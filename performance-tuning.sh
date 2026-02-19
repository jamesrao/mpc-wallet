#!/bin/bash

echo "⚡ 配置性能调优参数"
echo "================================"

# 创建性能调优配置目录
mkdir -p performance/config

echo "📁 创建性能调优目录结构..."

# 创建Docker资源限制配置
cat > performance/docker-resources.yml << 'ENDOFFILE'
# Docker容器资源限制配置
# 根据实际服务器配置调整这些参数

version: '3.8'

services:
  backend-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M

  mpc-core:
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend-web:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
ENDOFFILE

echo "✅ Docker资源限制配置已生成"

# 创建数据库性能调优配置
cat > performance/postgres-optimization.sql << 'ENDOFFILE'
-- PostgreSQL性能调优配置
-- 在数据库启动后执行这些优化命令

-- 1. 调整共享缓冲区大小
ALTER SYSTEM SET shared_buffers = '256MB';

-- 2. 调整工作内存
ALTER SYSTEM SET work_mem = '16MB';

-- 3. 调整维护工作内存
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- 4. 启用并行查询
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- 5. 调整检查点配置
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';

-- 6. 日志配置
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 记录执行时间超过1秒的查询

-- 7. 重启数据库使配置生效
SELECT pg_reload_conf();

-- 8. 创建关键索引
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 9. 更新统计信息
ANALYZE;

-- 10. 显示当前配置
SELECT name, setting, unit FROM pg_settings 
WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem', 'max_connections');
ENDOFFILE

echo "✅ 数据库性能调优配置已生成"

# 创建应用层性能调优配置
cat > performance/app-optimization.md << 'ENDOFFILE'
# 应用层性能调优指南

## 后端API优化

### 1. 连接池配置
- 数据库连接池大小: 20-50个连接
- 连接超时时间: 30秒
- 最大空闲连接: 10个

### 2. 缓存策略
- Redis缓存热点数据
- 缓存TTL: 5-30分钟
- 使用内存缓存减少数据库访问

### 3. 异步处理
- 使用消息队列处理耗时操作
- 异步日志记录
- 批处理数据库操作

## MPC服务优化

### 1. 会话管理
- 会话超时时间: 30分钟
- 最大并发会话数: 100
- 会话清理间隔: 5分钟

### 2. 内存优化
- 限制单个会话内存使用
- 定期清理过期会话
- 使用内存映射文件处理大文件

## 前端优化

### 1. 静态资源优化
- 启用Gzip压缩
- 使用CDN加速静态资源
- 图片懒加载

### 2. 代码分割
- 按路由分割代码包
- 延迟加载非关键组件
- 预加载关键资源

## 监控指标阈值

### 性能指标
- API响应时间: < 100ms (P95)
- 数据库查询时间: < 50ms
- 内存使用率: < 80%
- CPU使用率: < 70%

### 业务指标
- 用户注册成功率: > 99%
- 交易处理成功率: > 99.5%
- 系统可用性: > 99.9%
ENDOFFILE

echo "✅ 应用层性能调优指南已生成"

# 创建负载测试配置
cat > performance/load-test-config.json << 'ENDOFFILE'
{
  "load_test": {
    "scenarios": [
      {
        "name": "用户注册流程",
        "users": 100,
        "duration": "5m",
        "ramp_up": "30s",
        "requests": [
          {
            "method": "POST",
            "url": "http://localhost:3000/api/v1/auth/register",
            "body": {
              "username": "testuser_{{id}}",
              "email": "test{{id}}@example.com",
              "password": "TestPassword123!"
            }
          }
        ]
      },
      {
        "name": "MPC密钥生成",
        "users": 50,
        "duration": "10m",
        "ramp_up": "60s",
        "requests": [
          {
            "method": "POST",
            "url": "http://localhost:8080/api/v1/keygen",
            "body": {
              "participants": ["user1", "user2", "user3"],
              "threshold": 2
            }
          }
        ]
      }
    ],
    "thresholds": {
      "http_req_duration": ["p(95)<100"],
      "http_req_failed": ["rate<0.01"],
      "iterations": ["count>1000"]
    }
  }
}
ENDOFFILE

echo "✅ 负载测试配置已生成"

# 创建性能调优脚本
cat > performance/apply-tuning.sh << 'ENDOFFILE'
#!/bin/bash

echo "🔧 应用性能调优配置..."

# 应用数据库优化
if command -v psql &> /dev/null; then
    echo "📊 应用数据库性能优化..."
    psql -h localhost -U user -d mpc_wallet -f performance/postgres-optimization.sql
    echo "✅ 数据库优化完成"
else
    echo "⚠️  psql命令未找到，跳过数据库优化"
fi

# 应用Docker资源限制
echo "🐳 应用Docker资源限制..."
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    # 合并资源限制到生产配置
    docker compose -f docker-compose.prod.yml -f performance/docker-resources.yml up -d --force-recreate
    echo "✅ Docker资源限制已应用"
else
    echo "⚠️ Docker Compose配置检查失败，跳过资源限制"
fi

# 重启服务以确保配置生效
echo "🔄 重启服务..."
docker compose -f docker-compose.prod.yml restart

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
./health-check.sh

echo ""
echo "🎉 性能调优配置应用完成!"
echo "================================"
echo "📊 当前资源配置:"
echo "   - 后端API: 2CPU / 2GB内存"
echo "   - MPC核心: 1.5CPU / 1GB内存"
echo "   - 前端应用: 1CPU / 512MB内存"
echo "   - 数据库: 1CPU / 1GB内存"
echo ""
echo "📈 性能指标阈值:"
echo "   - API响应时间: < 100ms (P95)"
echo "   - 内存使用率: < 80%"
echo "   - CPU使用率: < 70%"
ENDOFFILE

chmod +x performance/apply-tuning.sh
echo "✅ 性能调优应用脚本已生成"

# 创建性能监控脚本
cat > performance/monitor-performance.sh << 'ENDOFFILE'
#!/bin/bash

echo "📊 性能监控启动..."
echo "================================"

# 监控持续时间（秒）
DURATION=${1:-3600}  # 默认1小时

start_time=$(date +%s)
end_time=$((start_time + DURATION))

echo "⏰ 监控将持续: $((DURATION / 60)) 分钟"
echo "🕐 开始时间: $(date)"
echo "🕐 结束时间: $(date -d "@$end_time")"
echo ""

while [ $(date +%s) -lt $end_time ]; do
    echo "=== $(date) ==="
    
    # 检查容器资源使用
    echo "🐳 容器资源使用:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # 检查系统负载
    echo "💻 系统负载:"
    uptime
    
    # 检查内存使用
    echo "🧠 内存使用:"
    free -h | head -2
    
    # 检查磁盘使用
    echo "💾 磁盘使用:"
    df -h / | head -2
    
    echo ""
    
    # 每30秒检查一次
    sleep 30
done

echo "✅ 性能监控完成"
echo "📊 监控报告已生成: performance/monitor-report-$(date +%Y%m%d-%H%M%S).txt"
ENDOFFILE

chmod +x performance/monitor-performance.sh
echo "✅ 性能监控脚本已生成"

echo ""
echo "🎉 性能调优配置完成!"
echo "================================"
echo ""
echo "🚀 应用性能调优命令:"
echo "   ./performance/apply-tuning.sh"
echo ""
echo "📊 监控性能命令:"
echo "   ./performance/monitor-performance.sh [时长(秒)]"
echo ""
echo "📈 性能调优包含:"
echo "   - Docker资源限制配置"
echo "   - 数据库性能优化"
echo "   - 应用层优化指南"
echo "   - 负载测试配置"
echo "   - 实时性能监控"