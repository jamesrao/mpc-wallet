#!/bin/bash

# MPC钱包测试镜像构建脚本
# 解决Docker镜像拉取失败问题

echo "🚀 构建MPC钱包测试镜像..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 函数：带重试的镜像构建
docker_build_with_retry() {
    local context=$1
    local dockerfile=$2
    local image_name=$3
    local max_retries=3
    local retry_count=0
    
    echo "📦 构建镜像: $image_name"
    
    while [ $retry_count -lt $max_retries ]; do
        if docker build -f "$dockerfile" -t "$image_name" "$context"; then
            echo "✅ 镜像构建成功: $image_name"
            return 0
        else
            retry_count=$((retry_count + 1))
            echo "⚠️  构建失败，重试 $retry_count/$max_retries..."
            sleep 10
        fi
    done
    
    echo "❌ 镜像构建失败: $image_name"
    return 1
}

# 构建各个服务镜像
echo "📦 构建MPC核心服务镜像..."
docker_build_with_retry "./mpc-core" "./mpc-core/Dockerfile" "mpc-wallet-mpc-test"

if [ $? -ne 0 ]; then
    echo "❌ MPC核心镜像构建失败"
    exit 1
fi

echo "📦 构建区块链中间件镜像..."
docker_build_with_retry "./blockchain-middleware" "./blockchain-middleware/Dockerfile" "mpc-wallet-blockchain-test"

if [ $? -ne 0 ]; then
    echo "❌ 区块链中间件镜像构建失败"
    exit 1
fi

echo "📦 构建后端API服务镜像..."
docker_build_with_retry "./backend-services/api" "./backend-services/api/Dockerfile" "mpc-wallet-api-test"

if [ $? -ne 0 ]; then
    echo "❌ 后端API镜像构建失败"
    exit 1
fi

echo "🎉 所有测试镜像构建完成！"
echo ""
echo "📋 已构建的镜像:"
echo "  - mpc-wallet-mpc-test"
echo "  - mpc-wallet-blockchain-test"
echo "  - mpc-wallet-api-test"
echo ""
echo "💡 下一步: 运行测试环境"
echo "  ./scripts/start-test-environment.sh"