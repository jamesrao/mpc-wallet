# MPC Web3钱包项目 - 国内镜像加速配置

本文档提供MPC Web3钱包项目的国内镜像加速配置方案，以解决在中国大陆网络环境下Docker镜像拉取、Go模块下载、Rust包下载和npm包下载慢的问题。

## 已完成的配置

本项目已对以下配置文件进行了修改，以使用国内镜像源：

### 1. Go国内代理
- **backend-services/api/Dockerfile.dev**：已设置 `ENV GOPROXY=https://goproxy.cn,direct` 和 `ENV GOSUMDB=off`
- **blockchain-middleware/Dockerfile.dev**：已设置 `ENV GOPROXY=https://goproxy.cn,direct` 和 `ENV GOSUMDB=off`

### 2. Rust国内镜像
- **mpc-core/Dockerfile.dev**：已配置中科大镜像源 `https://mirrors.ustc.edu.cn/crates.io-index/`

### 3. npm国内镜像
- **frontend-web/Dockerfile.dev**：已设置 `ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com`
- **frontend-web/.npmrc**：已创建，设置 `registry=https://registry.npmmirror.com`

## 额外配置建议

### 1. Docker国内镜像加速器

要配置Docker守护进程使用国内镜像加速器，请按以下步骤操作：

#### 在Linux/macOS上配置

1. 创建或编辑 `/etc/docker/daemon.json` 文件：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

2. 重启Docker服务：

```bash
# Linux
sudo systemctl daemon-reload
sudo systemctl restart docker

# macOS (Docker Desktop)
# 通过Docker Desktop界面重启或执行：
killall Docker && open /Applications/Docker.app
```

3. 验证配置：
```bash
docker info | grep -A 5 "Registry Mirrors"
```

#### 在Windows上配置

1. 右键点击Docker Desktop托盘图标，选择 "Settings"
2. 进入 "Docker Engine" 选项卡
3. 在配置文件中添加：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```
4. 点击 "Apply & Restart"

### 2. Go代理的额外配置

除了Dockerfile中的配置，还可以在本地开发环境中设置：

#### 全局配置（推荐）
```bash
# 设置Go代理
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=off

# 验证配置
go env GOPROXY
go env GOSUMDB
```

#### 在GoLand或VSCode中
在IDE设置中配置环境变量：
- `GOPROXY=https://goproxy.cn,direct`
- `GOSUMDB=off`

### 3. Rust镜像的额外配置

除了Dockerfile中的配置，可以在本地开发环境中配置：

#### 本地Cargo配置
在 `~/.cargo/config.toml` 中添加：

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index/"
```

或者使用清华镜像：
```toml
[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```

### 4. npm镜像的额外配置

#### 全局配置npm镜像
```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或者使用cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com

# 验证配置
npm config get registry
```

#### 在package.json中配置
可以在 `package.json` 中添加：
```json
{
  "publishConfig": {
    "registry": "https://registry.npmmirror.com"
  }
}
```

## 使用最小化环境测试

如果网络问题仍然存在，可以使用最小化Docker Compose配置进行测试：

```bash
# 使用最小化配置（仅包含核心服务）
docker-compose -f docker-compose.test-minimal.yml up -d

# 或者使用本地开发模式（不依赖Docker）
cd backend-services/api
go run cmd/api/main.go
```

最小化配置文件 `docker-compose.test-minimal.yml` 仅包含：
- PostgreSQL数据库
- Redis缓存
- Ganache开发节点
- 后端API服务

## 常见问题解决

### 1. Docker镜像拉取超时
- 确认Docker镜像加速器配置正确
- 尝试使用不同的镜像源
- 检查网络连接，确保可以访问镜像地址

### 2. Go模块下载失败
- 确认 `GOPROXY` 环境变量已设置
- 尝试临时使用 `GOPROXY=direct` 跳过代理
- 检查 `go.sum` 文件完整性

### 3. npm包安装缓慢
- 确认 `.npmrc` 文件存在且配置正确
- 尝试清除npm缓存：`npm cache clean --force`
- 使用 `npm install --registry=https://registry.npmmirror.com` 临时指定镜像

### 4. Rust包编译缓慢
- 确认Cargo镜像配置正确
- 尝试使用 `cargo build --verbose` 查看详细日志
- 检查网络连接，确保可以访问crates.io-index镜像

## 镜像源列表

### Docker镜像源
- 中科大：`https://docker.mirrors.ustc.edu.cn`
- 网易：`https://hub-mirror.c.163.com`
- 百度：`https://mirror.baidubce.com`
- 阿里云：`https://<your-id>.mirror.aliyuncs.com` (需要注册)

### Go代理
- 七牛云：`https://goproxy.cn` (推荐)
- 阿里云：`https://mirrors.aliyun.com/goproxy/`

### Rust镜像
- 中科大：`https://mirrors.ustc.edu.cn/crates.io-index/`
- 清华大学：`https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git`

### npm镜像
- 淘宝：`https://registry.npmmirror.com`
- 腾讯云：`https://mirrors.cloud.tencent.com/npm/`

## 项目结构中的配置文件

以下是与镜像加速相关的主要配置文件：

```
├── backend-services/
│   └── api/
│       └── Dockerfile.dev           # Go代理配置
├── blockchain-middleware/
│   └── Dockerfile.dev               # Go代理配置
├── mpc-core/
│   └── Dockerfile.dev               # Rust镜像配置
├── frontend-web/
│   ├── Dockerfile.dev               # npm镜像配置
│   └── .npmrc                       # npm镜像配置
├── docker-compose.yml               # 完整环境配置
├── docker-compose.test-minimal.yml  # 最小化测试配置
└── README-CN-MIRROR.md              # 本配置文档
```

## 总结

通过以上配置，项目可以在中国大陆网络环境下正常进行开发、构建和部署。如果遇到任何网络相关的问题，请参考本文档进行排查和配置调整。

建议在开始开发前，先使用最小化配置验证环境是否正常工作，然后逐步启用其他服务。