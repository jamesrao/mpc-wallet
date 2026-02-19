#!/bin/bash

echo "📈 部署状态检查..."

# 检查容器状态
echo "🐳 容器状态:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查服务日志
echo ""
echo "📋 最近日志:"
docker compose -f docker-compose.prod.yml logs --tail=10 backend-api

echo ""
echo "🎯 部署状态检查完成"
