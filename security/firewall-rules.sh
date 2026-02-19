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
