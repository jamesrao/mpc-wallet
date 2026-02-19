#!/bin/bash

# 供应链金融平台备份脚本
# 自动备份数据库、配置文件、日志等重要数据

set -e

# 配置变量
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/backup.log"
RETENTION_DAYS=30

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 错误处理
error_exit() {
    log "${RED}错误: $1${NC}"
    exit 1
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

log "${GREEN}开始备份供应链金融平台数据...${NC}"

# 备份PostgreSQL数据库
log "备份PostgreSQL数据库..."
pg_dump -h $DB_HOST -U $DB_USER -d supplychain_finance > "$BACKUP_DIR/database.sql" || error_exit "数据库备份失败"

# 备份Redis数据
log "备份Redis数据..."
redis-cli -h $REDIS_HOST --rdb "$BACKUP_DIR/dump.rdb" || error_exit "Redis备份失败"

# 备份配置文件
log "备份配置文件..."
tar -czf "$BACKUP_DIR/configs.tar.gz" -C /etc/supplychain-finance . || error_exit "配置文件备份失败"

# 备份日志文件（最近7天）
log "备份日志文件..."
find /var/log/supplychain-finance -name "*.log" -mtime -7 -exec tar -rf "$BACKUP_DIR/logs.tar" {} + 2>/dev/null || true

# 备份Kubernetes配置
log "备份Kubernetes配置..."
kubectl get all -n supplychain-finance -o yaml > "$BACKUP_DIR/kubernetes-resources.yaml" || error_exit "Kubernetes配置备份失败"
kubectl get secrets -n supplychain-finance -o yaml > "$BACKUP_DIR/secrets.yaml" || error_exit "Kubernetes密钥备份失败"

# 备份智能合约
log "备份智能合约..."
tar -czf "$BACKUP_DIR/smart-contracts.tar.gz" -C /app/smart-contracts . || error_exit "智能合约备份失败"

# 创建备份清单
cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
    "backup_time": "$(date -Iseconds)",
    "backup_version": "1.0",
    "components": [
        "postgresql_database",
        "redis_cache", 
        "configuration_files",
        "application_logs",
        "kubernetes_resources",
        "smart_contracts"
    ],
    "size": "$(du -sh "$BACKUP_DIR" | cut -f1)"
}
EOF

# 压缩备份文件
log "压缩备份文件..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")" || error_exit "备份压缩失败"

# 上传到云存储（可选）
if [ "$UPLOAD_TO_S3" = "true" ]; then
    log "上传备份到S3..."
    aws s3 cp "$BACKUP_DIR.tar.gz" "s3://$S3_BUCKET/backups/" || error_exit "S3上传失败"
fi

# 清理旧备份
log "清理旧备份文件..."
find /backup -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete || true

# 清理临时文件
rm -rf "$BACKUP_DIR"

log "${GREEN}备份完成！备份文件: $BACKUP_DIR.tar.gz${NC}"

# 发送通知（可选）
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ 供应链金融平台备份完成 $(date '+%Y-%m-%d %H:%M:%S')\"}" \
        "$SLACK_WEBHOOK" || true
fi

# 验证备份完整性
log "验证备份完整性..."
tar -tzf "$BACKUP_DIR.tar.gz" >/dev/null || error_exit "备份文件损坏"

log "${GREEN}备份验证通过！${NC}"