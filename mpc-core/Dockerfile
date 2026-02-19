# MPC核心服务Dockerfile
FROM rust:latest as builder

# 安装构建依赖
RUN apt-get update && apt-get install -y musl-tools pkg-config libssl-dev

# 创建工作目录
WORKDIR /app

# 复制Cargo文件
COPY Cargo.toml Cargo.lock ./

# 构建依赖缓存
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# 复制源代码
COPY src ./src

# 重新构建应用
RUN touch src/main.rs
RUN cargo build --release

# 运行时镜像
FROM alpine:latest

# 安装运行时依赖
RUN apk add --no-cache ca-certificates libgcc

# 创建非root用户
RUN addgroup -g 1000 mpc && \
    adduser -D -u 1000 -G mpc mpc

# 设置工作目录
WORKDIR /app

# 复制可执行文件
COPY --from=builder /app/target/release/mpc-core ./mpc-core

# 设置权限
RUN chown mpc:mpc mpc-core
RUN chmod +x mpc-core

# 切换用户
USER mpc

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
CMD ["./mpc-core"]