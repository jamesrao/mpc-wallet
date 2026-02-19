# 基础设施变量定义
variable "aws_region" {
  description = "AWS区域"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "环境名称 (dev/staging/production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "环境必须是 dev、staging 或 production"
  }
}

variable "project_name" {
  description = "项目名称"
  type        = string
  default     = "supplychain-finance"
}

variable "vpc_cidr" {
  description = "VPC的CIDR块"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "可用区列表"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  description = "私有子网CIDR块列表"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "公共子网CIDR块列表"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "db_username" {
  description = "数据库用户名"
  type        = string
  default     = "supplychain_admin"
  sensitive   = true
}

variable "db_password" {
  description = "数据库密码"
  type        = string
  sensitive   = true
}

variable "instance_type" {
  description = "EC2实例类型"
  type        = string
  default     = "m5.large"
}

variable "min_instances" {
  description = "最小实例数量"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "最大实例数量"
  type        = number
  default     = 10
}

variable "desired_instances" {
  description = "期望实例数量"
  type        = number
  default     = 3
}

variable "backup_retention_days" {
  description = "数据库备份保留天数"
  type        = number
  default     = 7
}

variable "enable_monitoring" {
  description = "是否启用监控"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "是否启用日志记录"
  type        = bool
  default     = true
}

variable "ssl_certificate_arn" {
  description = "SSL证书ARN (用于HTTPS)"
  type        = string
  default     = ""
}