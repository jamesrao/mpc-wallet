# 供应链金融平台基础设施模块

## 📋 概述

本基础设施模块为供应链金融平台提供完整的云原生基础设施架构，包括容器编排、监控、安全、CI/CD等核心组件。

## 🏗️ 架构设计

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                     用户访问层                                │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   前端应用      │  │   移动应用      │                   │
│  │  (React/Vue)   │  │  (React Native) │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    负载均衡层                                │
│                  ┌─────────────┐                           │
│                  │   ALB/NLB   │                           │
│                  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes集群                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  前端服务    │  │ 中间件服务   │  │  MPC服务    │         │
│  │ frontend-web │  │ blockchain  │  │  mpc-core  │         │
│  │             │  │  middleware │  │            │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     数据层                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │   Redis     │  │ 区块链节点   │         │
│  │  数据库      │  │   缓存      │  │ (Ethereum)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 目录结构

```
infrastructure/
├── terraform/           # Terraform基础设施即代码
│   ├── main.tf          # 主配置文件
│   ├── variables.tf     # 变量定义
│   └── outputs.tf       # 输出变量
├── kubernetes/          # Kubernetes资源配置
│   ├── namespace.yaml   # 命名空间
│   ├── deployment.yaml  # 部署配置
│   ├── service.yaml     # 服务配置
│   └── ingress.yaml     # 入口路由
├── docker/              # Docker容器化配置
│   ├── Dockerfile.middleware  # 中间件镜像
│   ├── Dockerfile.mpc         # MPC服务镜像
│   ├── Dockerfile.frontend    # 前端镜像
│   └── docker-compose.dev.yml # 开发环境编排
├── monitoring/          # 监控系统
│   ├── prometheus.yml   # Prometheus配置
│   ├── alert_rules.yml  # 告警规则
│   └── grafana/         # Grafana仪表板
├── security/            # 安全配置
│   ├── network-policy.yaml    # 网络策略
│   └── psp.yaml               # Pod安全策略
├── ci-cd/              # CI/CD流水线
│   └── gitlab-ci.yml   # GitLab CI配置
├── backup/             # 备份策略
│   └── backup-script.sh # 备份脚本
├── scripts/            # 工具脚本
│   └── setup.sh        # 基础设施设置脚本
└── nginx/              # Nginx配置
    ├── nginx.conf      # 主配置文件
    └── conf.d/         # 服务配置
```

## 🚀 快速开始

### 环境要求
- AWS CLI 配置
- Terraform >= 1.0
- kubectl >= 1.28
- helm >= 3.0
- docker >= 20.0

### 一键部署

```bash
# 设置基础设施
chmod +x scripts/setup.sh
./scripts/setup.sh dev us-east-1

# 手动部署Terraform（如果需要）
cd terraform
terraform init
terraform plan
terraform apply
```

### 开发环境部署

```bash
# 使用Docker Compose启动开发环境
cd docker
docker-compose -f docker-compose.dev.yml up -d

# 访问服务
# 前端: http://localhost:80
# API: http://localhost:8080
# MPC服务: http://localhost:3000
# 监控: http://localhost:3001 (Grafana)
```

## 🔧 核心组件

### 1. Terraform基础设施

**功能特性：**
- 自动创建VPC网络和子网
- EKS Kubernetes集群管理
- RDS PostgreSQL数据库实例
- ElastiCache Redis集群
- 应用负载均衡器(ALB)

**关键配置：**
```hcl
module "eks" {
  cluster_name    = "supplychain-finance-cluster"
  cluster_version = "1.28"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
}
```

### 2. Kubernetes编排

**部署策略：**
- 多副本高可用部署
- 资源限制和请求配置
- 健康检查和就绪检查
- 自动扩缩容(HPA)

**服务发现：**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: blockchain-middleware
spec:
  selector:
    app: blockchain-middleware
  ports:
  - port: 8080
    targetPort: 8080
```

### 3. 监控告警系统

**监控指标：**
- 应用性能指标(APM)
- 基础设施资源使用率
- 业务指标监控
- 自定义告警规则

**告警规则示例：**
```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
```

### 4. 安全配置

**网络安全：**
- 网络策略隔离
- Pod安全策略
- 服务间TLS加密
- 入口流量控制

**安全策略：**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
spec:
  podSelector:
    matchLabels:
      app: blockchain-middleware
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend-web
```

## 📊 监控指标

### 应用层监控
- HTTP请求量/成功率
- 响应时间分布
- 错误率统计
- 业务交易量

### 基础设施监控
- CPU/内存使用率
- 磁盘I/O性能
- 网络流量
- 容器资源限制

### 数据库监控
- 连接数统计
- 查询性能
- 锁等待时间
- 备份状态

## 🔒 安全特性

### 数据安全
- 数据库加密存储
- 传输层TLS加密
- 密钥管理(KMS)
- 定期安全扫描

### 访问控制
- RBAC权限管理
- 网络策略隔离
- API认证授权
- 审计日志记录

### 合规性
- GDPR数据保护
- PCI DSS合规
- SOC2安全认证
- 定期安全审计

## 🔄 CI/CD流水线

### 自动化流程
```
代码提交 → 单元测试 → 安全扫描 → 镜像构建 → 部署测试 → 生产发布
```

### 流水线阶段
1. **测试阶段**: 代码质量检查、单元测试
2. **构建阶段**: Docker镜像构建、安全扫描
3. **部署阶段**: 多环境自动部署
4. **验证阶段**: 健康检查、性能测试

## 💾 备份恢复

### 备份策略
- **数据库**: 每日全量备份 + 实时WAL备份
- **配置文件**: 版本控制 + 定期快照
- **日志文件**: 集中存储 + 长期归档
- **智能合约**: 版本控制 + 多重备份

### 恢复流程
```bash
# 执行恢复脚本
./backup/restore-script.sh <backup-file>

# 验证恢复结果
kubectl get pods -n supplychain-finance
```

## 🛠️ 运维管理

### 常用命令

**查看服务状态：**
```bash
kubectl get pods,svc,ingress -n supplychain-finance
```

**查看日志：**
```bash
kubectl logs -f deployment/blockchain-middleware -n supplychain-finance
```

**扩展部署：**
```bash
kubectl scale deployment/blockchain-middleware --replicas=5 -n supplychain-finance
```

**备份数据：**
```bash
./backup/backup-script.sh
```

### 故障排查

**常见问题：**
1. Pod启动失败：检查资源限制和依赖服务
2. 网络连接问题：验证网络策略和服务发现
3. 性能问题：监控资源使用率和应用指标
4. 安全事件：审查审计日志和访问记录

## 📈 性能优化

### 资源优化
- 合理设置CPU/内存限制
- 使用HPA自动扩缩容
- 优化容器镜像大小
- 启用资源回收机制

### 网络优化
- 使用服务网格优化通信
- 配置连接池和超时设置
- 启用压缩和缓存
- 优化DNS解析性能

## 🔮 扩展计划

### 短期目标
- [ ] 实现多区域部署
- [ ] 添加服务网格(Istio)
- [ ] 完善灾难恢复方案
- [ ] 优化CI/CD流水线

### 长期目标
- [ ] 实现混合云部署
- [ ] 添加AI运维能力
- [ ] 构建自愈系统
- [ ] 实现零信任安全架构

## 🤝 贡献指南

### 开发规范
1. 遵循基础设施即代码原则
2. 所有配置变更通过PR审核
3. 保持配置文件的版本控制
4. 定期进行安全审计

### 问题反馈
- 提交Issue描述问题
- 提供详细的错误日志
- 包含环境信息和复现步骤

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

---

**基础设施模块维护团队**  
如有问题请联系：infrastructure@supplychain-finance.com