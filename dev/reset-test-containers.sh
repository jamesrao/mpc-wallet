#!/bin/bash
# 重置测试容器到初始状态

echo "🔄 重置测试容器（清理数据）..."

read -p "确定要重置容器吗？这将删除所有测试数据 (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 检查使用哪个配置文件
    if docker ps -a --filter "name=mpc-wallet" --format "{{.Names}}" | grep -q "test"; then
        docker compose -f docker-compose.test.yml down -v
    else
        docker compose -f docker-compose.test-minimal.yml down -v
    fi
    echo "✅ 容器和数据已重置"
else
    echo "❌ 取消重置操作"
fi