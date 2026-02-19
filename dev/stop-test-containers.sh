#!/bin/bash
# 停止测试容器但保留数据

echo "⏹️  停止测试容器（保留数据）..."

# 检查使用哪个配置文件
if docker ps --filter "name=mpc-wallet" --format "{{.Names}}" | grep -q "test"; then
    # 停止但不删除容器和数据卷
    docker compose -f docker-compose.test.yml stop
else
    docker compose -f docker-compose.test-minimal.yml stop
fi

echo "✅ 容器已停止，数据已保留"
echo "💡 下次启动将快速恢复状态"