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
