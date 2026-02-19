#!/bin/bash
# 查看测试容器状态

echo "📊 测试容器状态检查"

# 检查容器运行状态
echo "=== 运行状态 ==="
running_containers=$(docker ps --filter "name=mpc-wallet" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

if [ -n "$running_containers" ]; then
    echo "$running_containers"
else
    echo "⚠️  没有运行的测试容器"
fi

echo ""
echo "=== 所有容器状态 ==="
docker ps -a --filter "name=mpc-wallet" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== 健康检查 ==="
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo "✅ API服务健康"
else
    echo "❌ API服务未响应"
fi

if curl -s -f http://localhost:5432 > /dev/null; then
    echo "✅ PostgreSQL服务正常"
else
    echo "❌ PostgreSQL服务未响应"
fi

if curl -s -f http://localhost:6379 > /dev/null; then
    echo "✅ Redis服务正常"
else
    echo "❌ Redis服务未响应"
fi

if curl -s -f http://localhost:8545 > /dev/null; then
    echo "✅ Ganache服务正常"
else
    echo "❌ Ganache服务未响应"
fi