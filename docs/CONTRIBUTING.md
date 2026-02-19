# 贡献指南

欢迎为MPC企业级Web3钱包项目贡献代码！请阅读以下指南以确保贡献流程顺利。

## 开发流程

### 1. 环境准备
- 确保已安装 Docker 和 Docker Compose
- 确保已安装 Git
- 推荐使用 VS Code 或 IntelliJ IDEA 作为开发环境

### 2. 克隆项目
```bash
git clone <repository-url>
cd mpc-web3-wallet
```

### 3. 启动开发环境
```bash
make dev-up
```

### 4. 运行测试
```bash
make test
```

## 代码规范

### Rust (MPC核心模块)
- 遵循 [Rust API 指南](https://rust-lang.github.io/api-guidelines/)
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 进行代码检查
- 为公共API添加文档注释

### Go (业务逻辑层)
- 遵循 [Go 代码评审标准](https://github.com/golang/go/wiki/CodeReviewComments)
- 使用 `go fmt` 格式化代码
- 使用 `golangci-lint` 进行代码检查
- 函数注释使用 GoDoc 格式

### TypeScript/React (前端)
- 使用 ESLint 和 Prettier 进行代码检查和格式化
- 遵循 React Hooks 最佳实践
- 使用 TypeScript 严格模式
- 组件使用函数式组件和 Hooks

### Solidity (智能合约)
- 遵循 [Solidity 风格指南](https://docs.soliditylang.org/en/v0.8.17/style-guide.html)
- 使用 Hardhat 进行测试和部署
- 所有合约必须有完整的 NatSpec 注释
- 进行安全审计和测试

## 提交规范

### 提交消息格式
```
<类型>: <描述>

[可选的正文]

[可选的页脚]
```

### 类型说明
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具更新

### 示例
```
feat: 添加MPC密钥生成功能

- 实现GG18协议密钥生成
- 添加密钥分片存储
- 添加相关测试

Closes #123
```

## 分支策略

### 主要分支
- `main`: 生产环境代码，受保护分支
- `develop`: 开发分支，功能合并前先合并到此分支

### 支持分支
- `feature/*`: 新功能开发
- `bugfix/*`: 错误修复
- `hotfix/*`: 紧急修复
- `release/*`: 版本发布

### 工作流程
1. 从 `develop` 创建功能分支
2. 在功能分支上开发
3. 提交 Pull Request 到 `develop`
4. 代码评审通过后合并
5. 定期从 `develop` 创建发布分支

## Pull Request 流程

### 创建 Pull Request
1. 确保代码通过所有测试
2. 更新相关文档
3. 添加清晰的描述和关联的 Issue
4. 指定合适的 Reviewer

### 代码评审标准
- 代码符合项目规范
- 有适当的测试覆盖
- 文档已更新
- 性能和安全考虑
- 向后兼容性

## 测试要求

### 单元测试
- 所有公共函数必须有单元测试
- 测试覆盖率不低于 80%
- 使用适当的测试框架

### 集成测试
- 关键业务流程必须有集成测试
- 测试环境使用 Docker Compose
- 模拟真实业务场景

### 安全测试
- 智能合约需进行安全审计
- MPC协议需进行密码学验证
- 定期进行渗透测试

## 文档要求

### 代码文档
- 所有公共API必须有文档注释
- 复杂算法必须有详细说明
- 使用清晰的示例

### 项目文档
- 更新 README 中相关部分
- 记录架构设计决策
- 提供部署和运维指南

## 安全注意事项

### 敏感信息
- 不要提交密钥或密码到代码库
- 使用环境变量或密钥管理服务
- 遵循最小权限原则

### 代码安全
- 进行输入验证和参数检查
- 防止常见安全漏洞（SQL注入、XSS等）
- 定期更新依赖包

## 问题反馈

### 报告 Bug
1. 使用 Issue 模板
2. 提供重现步骤
3. 包含环境信息
4. 添加相关日志

### 功能请求
1. 描述使用场景
2. 说明预期行为
3. 讨论技术可行性
4. 评估优先级

## 联系方式

- 项目负责人: [姓名]
- 技术讨论: [Slack/钉钉群]
- 紧急问题: [联系电话]

感谢您的贡献！