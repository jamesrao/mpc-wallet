#!/bin/bash

# 前端-后端联调测试启动脚本
# 用法: ./scripts/test-setup.sh [backend|frontend|all]

echo "🎯 MPC钱包前端-后端联调测试环境"
echo "================================"

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm包是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

case "${1:-all}" in
    "backend")
        echo "🔧 启动后端服务检查..."
        # 检查后端服务是否运行
        if curl -s http://localhost:3000/api/v1/health > /dev/null; then
            echo "✅ 后端服务运行正常"
        else
            echo "⚠️  后端服务未运行，请先启动后端服务"
            echo "    cd /Users/jamesrao/CodeBuddy/20260202145728/backend-services"
            echo "    docker-compose up -d"
        fi
        ;;
    "frontend")
        echo "🎨 启动前端开发服务器..."
        npm run dev
        ;;
    "all")
        echo "🚀 启动完整测试环境..."
        
        # 首先检查后端
        if curl -s http://localhost:3000/api/v1/health > /dev/null; then
            echo "✅ 后端服务已就绪"
        else
            echo "⚠️  后端服务未运行，请手动启动"
            echo "    cd /Users/jamesrao/CodeBuddy/20260202145728/backend-services"
            echo "    docker-compose up -d"
            echo "    等待10秒后重试..."
            sleep 10
        fi
        
        # 启动前端
        echo "🎨 启动前端开发服务器..."
        npm run dev
        ;;
    "test")
        echo "🧪 运行自动化测试..."
        npm run test:e2e
        ;;
    *)
        echo "使用方法:"
        echo "  ./test-setup.sh backend    - 检查后端服务"
        echo "  ./test-setup.sh frontend   - 启动前端开发"
        echo "  ./test-setup.sh all        - 启动完整环境"
        echo "  ./test-setup.sh test       - 运行自动化测试"
        ;;
esac