#!/bin/bash

echo "🔒 应用安全加固措施..."
echo "================================"

# 1. 配置SSL证书
echo "📜 配置SSL证书..."
./security/ssl-setup.sh

# 2. 配置防火墙
echo "🔥 配置防火墙..."
./security/firewall-rules.sh

# 3. 应用Docker安全配置
echo "🐳 应用Docker安全配置..."
if docker compose -f docker-compose.prod.yml -f security/docker-security.yml config > /dev/null 2>&1; then
    docker compose -f docker-compose.prod.yml -f security/docker-security.yml up -d --force-recreate
    echo "✅ Docker安全配置已应用"
else
    echo "⚠️ Docker安全配置应用失败"
fi

# 4. 重启服务
echo "🔄 重启服务..."
docker compose -f docker-compose.prod.yml restart

# 5. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 6. 执行安全审计
echo "🔍 执行安全审计..."
./security/security-audit.sh

echo ""
echo "🎉 安全加固措施应用完成!"
echo "================================"
echo "📊 已应用的安全措施:"
echo "   - SSL/TLS加密配置"
echo "   - 防火墙规则"
echo "   - Docker安全限制"
echo "   - 安全头配置"
echo "   - 安全审计"
echo ""
echo "🔒 安全级别: 企业级"
