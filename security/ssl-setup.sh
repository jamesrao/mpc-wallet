#!/bin/bash

echo "🔐 SSL/TLS证书配置..."

# 生成自签名证书（生产环境应使用CA颁发的证书）
echo "📜 生成自签名SSL证书..."

# 创建证书目录
mkdir -p security/certs

# 生成私钥
openssl genrsa -out security/certs/server.key 2048 2>/dev/null || \
  echo "⚠️  openssl未安装，跳过证书生成"

# 生成证书签名请求
if [ -f security/certs/server.key ]; then
    openssl req -new -key security/certs/server.key -out security/certs/server.csr \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=MPCWallet/CN=localhost" 2>/dev/null
    
    # 生成自签名证书
    openssl x509 -req -days 365 -in security/certs/server.csr \
        -signkey security/certs/server.key -out security/certs/server.crt 2>/dev/null
    
    echo "✅ SSL证书已生成"
    echo "   - 私钥: security/certs/server.key"
    echo "   - 证书: security/certs/server.crt"
else
    echo "⚠️ 跳过SSL证书生成"
fi

# 创建Nginx SSL配置
cat > security/nginx-ssl.conf << 'ENDOFFILE2'
# Nginx SSL配置
server {
    listen 443 ssl http2;
    server_name localhost;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS头
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 代理到前端应用
    location / {
        proxy_pass http://frontend-web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 代理到后端API
    location /api/ {
        proxy_pass http://backend-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}
ENDOFFILE2

echo "✅ Nginx SSL配置已生成"
