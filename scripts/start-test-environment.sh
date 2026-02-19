#!/bin/bash

# MPC钱包测试环境启动脚本
echo "🚀 启动MPC钱包测试环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 停止可能存在的旧服务
echo "🔄 清理旧服务..."
docker compose -f docker-compose.test.yml down 2>/dev/null || true

# 构建测试镜像（如果不存在）
echo "📦 检查并构建测试镜像..."
if ! docker images | grep -q "mpc-wallet-mpc-test" || ! docker images | grep -q "mpc-wallet-blockchain-test" || ! docker images | grep -q "mpc-wallet-api-test"; then
    echo "🔨 检测到缺失的镜像，开始构建..."
    ./scripts/build-test-images.sh
    if [ $? -ne 0 ]; then
        echo "❌ 镜像构建失败，无法启动测试环境"
        exit 1
    fi
fi

# 启动测试环境
echo "📦 启动测试环境服务..."
docker compose -f docker-compose.test.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
services=("mpc-wallet-ganache-test" "mpc-wallet-postgres-test" "mpc-wallet-redis-test" "mpc-wallet-mpc-test" "mpc-wallet-blockchain-test" "mpc-wallet-api-test")

for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service"; then
        echo "✅ $service 运行正常"
    else
        echo "❌ $service 启动失败"
        echo "查看日志: docker logs $service"
    fi
done

# 健康检查
echo "🧪 执行健康检查..."
max_retries=10
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "✅ API服务健康检查通过"
        break
    fi
    
    retry_count=$((retry_count + 1))
    echo "⏳ 健康检查重试 $retry_count/$max_retries..."
    sleep 10
done

if [ $retry_count -eq $max_retries ]; then
    echo "❌ 健康检查超时，请检查服务日志"
    docker logs mpc-wallet-api-test
    exit 1
fi

echo "🎉 测试环境启动完成！"
echo ""
echo "📋 可用服务："
echo "  - API服务: http://localhost:3000"
echo "  - MPC核心: http://localhost:8081"
echo "  - 区块链中间件: http://localhost:8082"
echo "  - Ganache区块链: http://localhost:8545"
echo "  - 数据库: localhost:5433"
echo "  - Redis: localhost:6380"
echo ""
echo "💡 运行测试: ./scripts/run-tests.sh"