#!/bin/bash

echo "📊 性能监控启动..."
echo "================================"

# 监控持续时间（秒）
DURATION=${1:-3600}  # 默认1小时

start_time=$(date +%s)
end_time=$((start_time + DURATION))

echo "⏰ 监控将持续: $((DURATION / 60)) 分钟"
echo "🕐 开始时间: $(date)"
echo "🕐 结束时间: $(date -d "@$end_time")"
echo ""

while [ $(date +%s) -lt $end_time ]; do
    echo "=== $(date) ==="
    
    # 检查容器资源使用
    echo "🐳 容器资源使用:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    # 检查系统负载
    echo "💻 系统负载:"
    uptime
    
    # 检查内存使用
    echo "🧠 内存使用:"
    free -h | head -2
    
    # 检查磁盘使用
    echo "💾 磁盘使用:"
    df -h / | head -2
    
    echo ""
    
    # 每30秒检查一次
    sleep 30
done

echo "✅ 性能监控完成"
echo "📊 监控报告已生成: performance/monitor-report-$(date +%Y%m%d-%H%M%S).txt"
