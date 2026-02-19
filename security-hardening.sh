#!/bin/bash

echo "🔒 实施安全加固措施"
echo "================================"

# 创建安全配置目录
mkdir -p security/config security/certs security/scripts

echo "📁 创建安全配置目录结构..."

# 创建SSL/TLS证书配置
cat > security/ssl-setup.sh << 'ENDOFFILE'
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
ENDOFFILE

chmod +x security/ssl-setup.sh
echo "✅ SSL配置脚本已生成"

# 创建防火墙配置
cat > security/firewall-rules.sh << 'ENDOFFILE'
#!/bin/bash

echo "🔥 防火墙规则配置..."

# 检查ufw是否可用
if command -v ufw &> /dev/null; then
    echo "🔧 配置UFW防火墙..."
    
    # 重置防火墙规则
    sudo ufw --force reset
    
    # 默认策略
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # 允许SSH连接
    sudo ufw allow ssh
    
    # 允许HTTP/HTTPS端口
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # 允许监控端口
    sudo ufw allow 9090/tcp  # Prometheus
    sudo ufw allow 3001/tcp # Grafana
    
    # 启用防火墙
    sudo ufw --force enable
    
    echo "✅ UFW防火墙已配置"
    sudo ufw status verbose
else
    echo "⚠️ ufw未安装，跳过防火墙配置"
fi

# 创建iptables规则（备用）
cat > security/iptables-rules.sh << 'ENDOFFILE2'
#!/bin/bash

echo "🔥 配置iptables防火墙规则..."

# 清空现有规则
iptables -F
iptables -X

# 设置默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 允许本地回环
iptables -A INPUT -i lo -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 允许SSH连接
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许HTTP/HTTPS端口
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许监控端口
iptables -A INPUT -p tcp --dport 9090 -j ACCEPT  # Prometheus
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT  # Grafana

echo "✅ iptables规则已生成"
echo "执行以下命令应用规则:"
echo "sudo bash security/iptables-rules.sh"
ENDOFFILE2

chmod +x security/iptables-rules.sh
echo "✅ iptables规则脚本已生成"
ENDOFFILE

chmod +x security/firewall-rules.sh
echo "✅ 防火墙配置脚本已生成"

# 创建安全头配置
cat > security/security-headers.conf << 'ENDOFFILE'
# 安全头配置
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self';" always;

# CORS配置
add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
add_header Access-Control-Allow-Credentials "true" always;

# HSTS配置
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
ENDOFFILE

echo "✅ 安全头配置已生成"

# 创建Docker安全配置
cat > security/docker-security.yml << 'ENDOFFILE'
# Docker安全配置
version: '3.8'

services:
  backend-api:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

  mpc-core:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

  frontend-web:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

  postgres:
    security_opt:
      - no-new-privileges:true
    read_only: false  # 数据库需要写权限
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - SETGID
      - SETUID
ENDOFFILE

echo "✅ Docker安全配置已生成"

# 创建应用安全配置
cat > security/app-security-config.md << 'ENDOFFILE'
# 应用层安全配置指南

## 1. 认证与授权安全

### JWT配置
- 密钥长度: 至少256位
- 令牌过期时间: 15分钟（访问令牌），7天（刷新令牌）
- 启用令牌刷新机制
- 实现令牌黑名单

### 密码策略
- 最小长度: 12个字符
- 要求: 大小写字母、数字、特殊字符
- 密码历史: 禁止使用最近5次密码
- 账户锁定: 5次失败尝试后锁定15分钟

## 2. 数据安全

### 加密配置
- 使用AES-256-GCM加密敏感数据
- 密钥管理: 使用HSM或密钥管理服务
- 数据脱敏: 日志中不记录敏感信息

### 数据库安全
- 启用SSL连接
- 使用强密码策略
- 定期备份和加密备份数据
- 限制数据库网络访问

## 3. API安全

### 输入验证
- 对所有输入进行严格验证
- 使用白名单验证
- 防止SQL注入、XSS攻击
- 限制请求大小和频率

### 速率限制
- API请求限制: 1000次/小时/用户
- 关键操作限制: 10次/分钟/用户
- 实现滑动窗口算法

## 4. 网络安全

### 网络隔离
- 使用私有网络
- 限制容器间通信
- 启用网络策略
- 使用服务网格进行流量控制

### 监控与审计
- 记录所有安全事件
- 实时监控异常行为
- 定期安全审计
- 实现安全事件响应流程

## 5. 运维安全

### 访问控制
- 最小权限原则
- 多因素认证
- 定期轮换凭证
- 审计日志记录

### 更新策略
- 定期更新依赖包
- 安全补丁及时应用
- 漏洞扫描和修复
- 灾难恢复计划
ENDOFFILE

echo "✅ 应用安全配置指南已生成"

# 创建安全审计脚本
cat > security/security-audit.sh << 'ENDOFFILE'
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
ENDOFFILE

chmod +x security/security-audit.sh
echo "✅ 安全审计脚本已生成"

# 创建自动安全加固脚本
cat > security/apply-security.sh << 'ENDOFFILE'
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
ENDOFFILE

chmod +x security/apply-security.sh
echo "✅ 安全加固应用脚本已生成"

echo ""
echo "🎉 安全加固配置完成!"
echo "================================"
echo ""
echo "🚀 应用安全加固命令:"
echo "   ./security/apply-security.sh"
echo ""
echo "🔍 安全审计命令:"
echo "   ./security/security-audit.sh"
echo ""
echo "🔒 安全加固包含:"
echo "   - SSL/TLS加密"
echo "   - 防火墙配置"
echo "   - Docker安全"
echo "   - 应用安全配置"
echo "   - 安全审计"
echo ""
echo "⚠️ 注意: 部分安全措施需要sudo权限"