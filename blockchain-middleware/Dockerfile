# 区块链中间件服务Dockerfile
FROM golang:1.23-alpine as builder

# 安装构建依赖
RUN apk add --no-cache git make

# 设置Go代理
ENV GOPROXY=https://goproxy.cn,direct

# 创建工作目录
WORKDIR /app

# 复制Go模块文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o middleware ./cmd/middleware

# 运行时镜像
FROM alpine:latest

# 安装运行时依赖
RUN apk add --no-cache ca-certificates curl

# 创建非root用户
RUN addgroup -g 1000 mpc && \
    adduser -D -u 1000 -G mpc mpc

# 设置工作目录
WORKDIR /app

# 复制可执行文件
COPY --from=builder /app/middleware ./middleware

# 设置权限
RUN chown mpc:mpc middleware
RUN chmod +x middleware

# 切换用户
USER mpc

# 暴露端口
EXPOSE 8081

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/api/v1/health || exit 1

# 启动命令
CMD ["./middleware"]