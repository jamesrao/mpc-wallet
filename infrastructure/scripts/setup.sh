#!/bin/bash

# 供应链金融平台基础设施设置脚本
# 自动配置Terraform、Kubernetes、监控等基础设施

set -e

# 配置变量
PROJECT_NAME="supplychain-finance"
ENVIRONMENT="${1:-dev}"
AWS_REGION="${2:-us-east-1}"
KUBE_VERSION="1.28"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# 错误处理
error_exit() {
    echo -e "${RED}错误: $1${NC}" >&2
    exit 1
}

# 检查依赖
check_dependencies() {
    log "检查系统依赖..."
    
    local deps=("terraform" "kubectl" "helm" "aws" "docker")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error_exit "缺少依赖: $dep"
        fi
    done
    
    log "所有依赖检查通过"
}

# 配置AWS凭据
setup_aws() {
    log "配置AWS凭据..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log "${YELLOW}请配置AWS凭据:${NC}"
        aws configure
    fi
    
    log "AWS凭据配置完成"
}

# 初始化Terraform
setup_terraform() {
    log "初始化Terraform..."
    
    cd terraform
    
    # 创建Terraform变量文件
    cat > terraform.tfvars << EOF
environment = "$ENVIRONMENT"
aws_region = "$AWS_REGION"
db_password = "$(openssl rand -base64 32)"
db_username = "supplychain_admin"
EOF
    
    terraform init
    terraform plan -out=plan.out
    
    log "${YELLOW}请检查Terraform计划，确认无误后执行: terraform apply plan.out${NC}"
    
    cd ..
}

# 配置Kubernetes
setup_kubernetes() {
    log "配置Kubernetes集群..."
    
    # 等待集群就绪
    sleep 30
    
    # 更新kubeconfig
    aws eks update-kubeconfig --region "$AWS_REGION" --name "$PROJECT_NAME-cluster"
    
    # 创建命名空间
    kubectl apply -f kubernetes/namespace.yaml
    
    # 安装Ingress控制器
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    helm install ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.service.type=LoadBalancer
    
    # 安装证书管理器
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    helm install cert-manager jetstack/cert-manager \
        --namespace cert-manager \
        --create-namespace \
        --version v1.13.0 \
        --set installCRDs=true
    
    log "Kubernetes配置完成"
}

# 安装监控系统
setup_monitoring() {
    log "安装监控系统..."
    
    # 安装Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --set grafana.adminPassword=admin
    
    # 配置监控仪表板
    kubectl apply -f monitoring/ -n monitoring
    
    log "监控系统安装完成"
}

# 配置网络策略
setup_network() {
    log "配置网络策略..."
    
    kubectl apply -f security/network-policy.yaml -n "$PROJECT_NAME"
    
    log "网络策略配置完成"
}

# 创建配置文件
setup_configs() {
    log "创建配置文件..."
    
    # 创建数据库密钥
    kubectl create secret generic database-secrets \
        --namespace "$PROJECT_NAME" \
        --from-literal=url="postgresql://supplychain_admin:password@postgres:5432/supplychain_finance" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # 创建Redis密钥
    kubectl create secret generic redis-secrets \
        --namespace "$PROJECT_NAME" \
        --from-literal=url="redis://redis:6379" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log "配置文件创建完成"
}

# 部署应用
deploy_applications() {
    log "部署应用程序..."
    
    kubectl apply -f kubernetes/ -n "$PROJECT_NAME"
    
    # 等待所有Pod就绪
    kubectl wait --for=condition=ready pod -l app=blockchain-middleware -n "$PROJECT_NAME" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=mpc-core -n "$PROJECT_NAME" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=frontend-web -n "$PROJECT_NAME" --timeout=300s
    
    log "应用程序部署完成"
}

# 验证部署
verify_deployment() {
    log "验证部署..."
    
    # 检查Pod状态
    kubectl get pods -n "$PROJECT_NAME"
    
    # 检查服务状态
    kubectl get services -n "$PROJECT_NAME"
    
    # 检查Ingress状态
    kubectl get ingress -n "$PROJECT_NAME"
    
    log "部署验证完成"
}

# 显示访问信息
show_access_info() {
    log "${GREEN}基础设施设置完成！${NC}"
    echo ""
    echo "${YELLOW}访问信息:${NC}"
    echo "- 前端应用: https://app.$PROJECT_NAME.com"
    echo "- API接口: https://api.$PROJECT_NAME.com"
    echo "- Grafana监控: http://localhost:3001 (admin/admin)"
    echo "- Kubernetes Dashboard: kubectl proxy"
    echo ""
    echo "${YELLOW}管理命令:${NC}"
    echo "- 查看日志: kubectl logs -f deployment/blockchain-middleware -n $PROJECT_NAME"
    echo "- 扩展部署: kubectl scale deployment/blockchain-middleware --replicas=5 -n $PROJECT_NAME"
    echo "- 备份数据: ./backup/backup-script.sh"
    echo ""
}

# 主函数
main() {
    echo -e "${GREEN}=== 供应链金融平台基础设施设置 ===${NC}"
    echo "环境: $ENVIRONMENT"
    echo "区域: $AWS_REGION"
    echo ""
    
    check_dependencies
    setup_aws
    setup_terraform
    setup_kubernetes
    setup_monitoring
    setup_network
    setup_configs
    deploy_applications
    verify_deployment
    show_access_info
    
    echo -e "${GREEN}所有基础设施组件已成功设置！${NC}"
}

# 执行主函数
main "$@"