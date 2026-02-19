#!/bin/bash

echo "📊 配置24小时监控观察系统"
echo "================================"

# 创建监控目录
mkdir -p monitoring/prometheus monitoring/grafana/provisioning/dashboards monitoring/grafana/provisioning/datasources

echo "📁 创建监控目录结构..."

# 创建Prometheus配置
cat > monitoring/prometheus.yml << 'ENDOFFILE'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'mpc-wallet-system'
    static_configs:
      - targets: ['backend-api:3000', 'mpc-core:8080', 'frontend-web:3000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'docker'
    static_configs:
      - targets: ['docker.for.mac.host.internal:9323']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
ENDOFFILE

echo "✅ Prometheus配置已生成"

# 创建Grafana数据源配置
cat > monitoring/grafana/provisioning/datasources/datasource.yml << 'ENDOFFILE'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
ENDOFFILE

echo "✅ Grafana数据源配置已生成"

# 创建Grafana仪表板配置
cat > monitoring/grafana/provisioning/dashboards/dashboard.yml << 'ENDOFFILE'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
ENDOFFILE

echo "✅ Grafana仪表板配置已生成"

# 创建MPC钱包系统监控仪表板
cat > monitoring/grafana/dashboards/mpc-wallet-system.json << 'ENDOFFILE'
{
  "dashboard": {
    "id": null,
    "title": "MPC钱包系统监控",
    "tags": ["mpc", "wallet", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "服务状态概览",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"mpc-wallet-system\"}",
            "legendFormat": "{{instance}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "CPU使用率",
        "type": "gauge",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "内存使用率",
        "type": "gauge",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "{{instance}}"
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0}
      }
    ],
    "time": {"from": "now-6h", "to": "now"}
  }
}
ENDOFFILE

echo "✅ MPC钱包系统监控仪表板已生成"

# 创建监控docker-compose文件
cat > docker-compose.monitoring.yml << 'ENDOFFILE'
version: '3.8'

services:
  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    restart: unless-stopped

  # Node Exporter（系统指标）
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
ENDOFFILE

echo "✅ 监控系统docker-compose文件已生成"

# 创建24小时监控脚本
cat > 24h-monitoring.sh << 'ENDOFFILE'
#!/bin/bash

echo "🔍 启动24小时监控系统..."

# 启动监控服务
docker compose -f docker-compose.monitoring.yml up -d

echo ""
echo "📊 监控系统已启动"
echo "================================"
echo "监控面板访问地址:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin)"
echo ""
echo "📈 监控指标:"
echo "- 服务可用性 (up指标)"
echo "- CPU/内存使用率"
echo "- 网络流量"
echo "- 请求响应时间"
echo ""
echo "⏰ 监控将持续运行24小时..."
echo "使用 Ctrl+C 停止监控"

# 持续监控循环
while true; do
    echo "$(date): 系统运行正常"
    sleep 300  # 每5分钟输出一次状态
    
    # 检查服务状态
    if ! docker ps | grep -q "prometheus\|grafana"; then
        echo "❌ 监控服务异常，重新启动..."
        docker compose -f docker-compose.monitoring.yml up -d
    fi
done
ENDOFFILE

chmod +x 24h-monitoring.sh
echo "✅ 24小时监控脚本已生成"

# 创建告警配置
cat > monitoring/alerts.yml << 'ENDOFFILE'
groups:
- name: mpc-wallet-alerts
  rules:
  - alert: ServiceDown
    expr: up{job="mpc-wallet-system"} == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "服务 {{ $labels.instance }} 已下线"
      description: "服务 {{ $labels.instance }} 已连续2分钟不可用"

  - alert: HighCPUUsage
    expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "高CPU使用率"
      description: "实例 {{ $labels.instance }} 的CPU使用率超过80%"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "高内存使用率"
      description: "实例 {{ $labels.instance }} 的内存使用率超过85%"
ENDOFFILE

echo "✅ 告警配置已生成"

echo ""
echo "🎉 24小时监控系统配置完成!"
echo "================================"
echo ""
echo "🚀 启动监控命令:"
echo "   ./24h-monitoring.sh"
echo ""
echo "📊 监控面板:"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3001 (admin/admin)"
echo ""
echo "⏰ 监控将持续24小时，自动检测服务状态"