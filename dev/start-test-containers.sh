#!/bin/bash
# 启动MPC钱包测试容器（保持后台运行）

echo "🚀 启动测试容器（后台模式）..."

# 检查是否已有自定义镜像
if docker images | grep -q "mpc-wallet-mpc-test"; then
    echo "📦 使用现有测试配置启动..."
    docker compose -f docker-compose.test.yml up -d
else
    echo "📦 使用最小化配置启动（避免构建）..."
    docker compose -f docker-compose.test-minimal.yml up -d
fi

# 等待服务启动
echo "⏳ 等待服务启动（30秒）..."
sleep 30

# 显示状态
echo ""
echo "📋 容器状态："
docker ps --filter "name=mpc-wallet" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💡 开发习惯建议："
echo "   早上运行此脚本 → 全天复用容器 → 晚上运行 dev/stop-test-containers.sh"