#!/bin/bash

# MPC钱包系统生产环境部署脚本
set -e

echo "🚀 开始部署MPC钱包系统到生产环境"
echo "========================================"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境文件
if [ ! -f ".env.production" ]; then
    echo "⚠️  生产环境配置文件 .env.production 不存在"
    echo "📝 正在创建示例配置文件..."
    cp .env.production .env.production.backup 2>/dev/null || true
    cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production

# 数据库配置
DB_PASSWORD=secure_production_password_$(date +%s)

# Facebook认证配置
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/v1/auth/facebook/callback

# 区块链RPC节点配置
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_infura_project_id
BSC_RPC_URL=https://bsc-dataseed.binance.org

# 安全配置
JWT_SECRET=production-jwt-secret-key-$(date +%s)
ENCRYPTION_KEY=production-encryption-key-$(date +%s)
EOF
    echo "✅ 已创建示例配置文件，请编辑 .env.production 并配置实际参数"
fi

# 构建Docker镜像
echo "🔧 构建Docker镜像..."
docker-compose -f docker-compose.prod.yml build

# 停止现有服务（如果有）
echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down || true

# 启动服务
echo "🚀 启动生产环境服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
services=("postgres" "redis" "mpc-core" "blockchain-middleware" "api" "nginx")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "${service}.*Up"; then
        echo "✅ ${service} 服务运行正常"
    else
        echo "❌ ${service} 服务启动失败"
        echo "查看日志: docker-compose -f docker-compose.prod.yml logs ${service}"
    fi
done

# 健康检查
echo "🏥 执行健康检查..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ API服务健康检查通过"
else
    echo "❌ API服务健康检查失败"
fi

# 输出部署信息
echo ""
echo "🎉 MPC钱包系统部署完成！"
echo "========================================"
echo "📊 服务状态:"
echo "   - 数据库: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - MPC核心服务: localhost:8081"
echo "   - 区块链中间件: localhost:8082"
echo "   - API服务: localhost:3000"
echo "   - Nginx代理: localhost:80/443"
echo ""
echo "🔧 常用命令:"
echo "   - 查看日志: docker-compose -f docker-compose.prod.yml logs"
echo "   - 停止服务: docker-compose -f docker-compose.prod.yml down"
echo "   - 重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "   - 更新服务: docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "⚠️  注意:"
echo "   - 请确保配置了正确的Facebook应用信息和区块链RPC节点"
echo "   - 生产环境请使用HTTPS和有效的SSL证书"
echo "   - 定期备份数据库和重要数据"
echo ""
echo "📞 如需技术支持，请参考项目文档"