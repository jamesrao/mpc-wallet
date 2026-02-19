#!/bin/bash

echo "🔍 生产环境健康检查..."

SERVICES=(
    "后端API:3000"
    "MPC核心:8080"
    "前端应用:80"
    "数据库:5432"
)

for service in "${SERVICES[@]}"; do
    name="${service%:*}"
    port="${service#*:}"
    
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $name 服务正常 (端口: $port)"
    else
        echo "❌ $name 服务异常 (端口: $port)"
    fi
done

echo ""
echo "📊 健康检查完成"
