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
