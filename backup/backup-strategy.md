# MPC钱包系统备份策略

## 📋 备份策略概述

### 备份目标
- **数据完整性**: 确保所有关键数据可恢复
- **业务连续性**: 最小化RTO（恢复时间目标）和RPO（恢复点目标）
- **合规性**: 满足数据保护和合规要求

### 备份层级
1. **数据库备份** - 核心业务数据
2. **配置文件备份** - 系统配置和密钥
3. **日志备份** - 操作日志和审计日志
4. **代码备份** - 应用程序代码

## 🗄️ 数据库备份策略

### 备份类型

#### 1. 全量备份（每日）
- **频率**: 每日凌晨2:00
- **保留**: 7天
- **存储**: 本地 + 云存储

#### 2. 增量备份（每小时）
- **频率**: 每小时整点
- **保留**: 24小时
- **存储**: 本地 + 云存储

#### 3. 事务日志备份（实时）
- **频率**: 每15分钟
- **保留**: 48小时
- **存储**: 本地

### 备份脚本

```bash
#!/bin/bash
# 数据库备份脚本

# 配置参数
BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_USER="backup_user"
DB_NAME="mpc_wallet"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 全量备份
pg_dump -h "$DB_HOST" -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_DIR/full_backup_$DATE.dump"

# 压缩备份
gzip "$BACKUP_DIR/full_backup_$DATE.dump"

# 上传到云存储（可选）
# aws s3 cp "$BACKUP_DIR/full_backup_$DATE.dump.gz" s3://your-bucket/backups/

# 清理旧备份（保留最近7天）
find "$BACKUP_DIR" -name "full_backup_*.dump.gz" -mtime +7 -delete

echo "数据库备份完成: $BACKUP_DIR/full_backup_$DATE.dump.gz"
```

## 🔧 配置文件备份

### 备份内容
- 环境配置文件（`.env.production`）
- Docker Compose配置
- Nginx配置
- SSL证书和密钥
- 服务配置文件

### 备份策略
- **频率**: 每次配置变更时
- **版本控制**: Git仓库管理
- **加密存储**: 敏感配置加密

## 📊 监控和日志备份

### 监控数据备份
- **Prometheus数据**: 每日快照
- **Grafana配置**: 版本控制
- **告警规则**: Git管理

### 应用日志备份
- **频率**: 每日轮转
- **保留**: 30天
- **存储**: 本地 + 日志管理系统

## 🚀 恢复策略

### 恢复场景

#### 1. 数据库恢复
```bash
# 停止应用服务
docker-compose -f docker-compose.prod.yml stop api-service

# 恢复数据库
pg_restore -h localhost -U postgres -d mpc_wallet /backup/database/full_backup_20240101_020000.dump.gz

# 启动服务
docker-compose -f docker-compose.prod.yml start api-service
```

#### 2. 完整系统恢复
```bash
# 1. 恢复配置文件
cp -r /backup/config/* /etc/mpc-wallet/

# 2. 恢复数据库
pg_restore -h localhost -U postgres -d mpc_wallet /backup/database/latest.dump.gz

# 3. 启动所有服务
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. 灾难恢复
```bash
# 在新服务器上执行
# 1. 克隆代码仓库
git clone https://github.com/your-repo/mpc-wallet.git

# 2. 恢复配置和备份
scp backup-server:/backup/* ./backup/

# 3. 恢复数据库
pg_restore -h new-db-server -U postgres -d mpc_wallet ./backup/database/latest.dump.gz

# 4. 部署服务
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 安全考虑

### 加密要求
- 备份数据加密存储
- 传输过程使用TLS
- 访问控制严格限制

### 权限管理
- 最小权限原则
- 定期轮换备份密钥
- 多因素认证

## 📈 备份验证

### 定期验证
- **每周**: 恢复测试
- **每月**: 灾难恢复演练
- **每季度**: 备份策略审查

### 验证脚本
```bash
#!/bin/bash
# 备份验证脚本

BACKUP_FILE="/backup/database/latest.dump.gz"
TEST_DB="mpc_wallet_test"

# 创建测试数据库
createdb -h localhost -U postgres "$TEST_DB"

# 恢复备份到测试数据库
pg_restore -h localhost -U postgres -d "$TEST_DB" "$BACKUP_FILE"

# 验证数据完整性
psql -h localhost -U postgres -d "$TEST_DB" -c "SELECT count(*) FROM users;"
psql -h localhost -U postgres -d "$TEST_DB" -c "SELECT count(*) FROM wallets;"

# 清理测试数据库
dropdb -h localhost -U postgres "$TEST_DB"

echo "备份验证完成"
```

## ⚙️ 自动化配置

### Cron任务配置
```bash
# 每日全量备份
0 2 * * * /opt/mpc-wallet/scripts/database-backup.sh

# 每小时增量备份
0 * * * * /opt/mpc-wallet/scripts/incremental-backup.sh

# 每周验证
0 3 * * 0 /opt/mpc-wallet/scripts/backup-verify.sh
```

### 监控告警
- 备份失败告警
- 存储空间不足告警
- 备份完整性检查失败告警

## 📋 合规性要求

### 数据保留政策
- **业务数据**: 7年
- **审计日志**: 5年
- **操作日志**: 1年
- **监控数据**: 6个月

### 恢复目标
- **RTO（恢复时间目标）**: < 4小时
- **RPO（恢复点目标）**: < 15分钟

---

**注意**: 此备份策略应根据实际业务需求和资源情况进行调整。定期审查和测试备份恢复流程至关重要。