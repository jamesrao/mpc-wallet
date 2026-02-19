#!/bin/bash

echo "🔍 执行安全审计..."
echo "================================"

# 检查Docker安全配置
echo "🐳 检查Docker安全配置..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

# 检查容器运行状态
echo ""
echo "📊 容器安全状态:"
for container in $(docker ps -q); do
    name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
    privileged=$(docker inspect --format='{{.HostConfig.Privileged}}' $container)
    read_only=$(docker inspect --format='{{.HostConfig.ReadonlyRootfs}}' $container)
    
    echo "容器: $name"
    echo "  - 特权模式: $privileged"
    echo "  - 只读文件系统: $read_only"
    
    if [ "$privileged" = "true" ]; then
        echo "  ⚠️  警告: 容器运行在特权模式"
    fi
    
    if [ "$read_only" = "false" ]; then
        echo "  ⚠️  警告: 容器文件系统可写"
    fi
    echo ""
done

# 检查网络配置
echo "🌐 检查网络配置..."
docker network ls
echo ""

# 检查端口暴露情况
echo "🔌 检查端口暴露..."
docker ps --format "table {{.Names}}\t{{.Ports}}"
echo ""

# 检查安全更新
echo "🔄 检查安全更新..."
if command -v apt-get &> /dev/null; then
    apt-get update > /dev/null 2>&1
    security_updates=$(apt-get upgrade --dry-run | grep -i security | wc -l)
    echo "可用的安全更新: $security_updates"
elif command -v yum &> /dev/null; then
    yum check-update --security > /dev/null 2>&1
    echo "使用 yum check-update --security 检查安全更新"
else
    echo "⚠️ 无法检查系统更新"
fi

echo ""
echo "✅ 安全审计完成"
echo "================================"
echo "📋 安全建议:"
echo "1. 定期运行安全审计"
echo "2. 及时应用安全更新"
echo "3. 监控异常网络活动"
echo "4. 备份重要数据"
