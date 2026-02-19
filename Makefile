.PHONY: help dev-up dev-down dev-logs test build clean

# 默认目标
help:
	@echo "MPC Web3钱包开发命令"
	@echo ""
	@echo "常用命令:"
	@echo "  make dev-up         启动开发环境"
	@echo "  make dev-down       停止开发环境"
	@echo "  make dev-logs       查看开发环境日志"
	@echo "  make test           运行测试"
	@echo "  make build          构建所有服务"
	@echo "  make clean          清理构建产物"
	@echo "  make frontend-dev   前端独立开发"
	@echo ""
	@echo "项目结构:"
	@echo "  mpc-core/           MPC核心服务 (Rust)"
	@echo "  blockchain-middleware/ 区块链中间件 (Go/Rust)"
	@echo "  backend-services/   后端业务服务 (Go/Java)"
	@echo "  frontend-web/       Web前端 (TypeScript + React)"
	@echo "  frontend-mobile/    移动端 (React Native)"
	@echo "  smart-contracts/    智能合约 (Solidity)"
	@echo "  private-chain/      供应链金融专有链 (Substrate)"
	@echo "  infrastructure/     基础设施配置"
	@echo "  docs/              文档"
	@echo "  scripts/           脚本"

# 开发环境
dev-up:
	/Applications/Docker.app/Contents/Resources/bin/docker-compose up -d --build
	@echo "开发环境启动完成！"
	@echo "- API服务: http://localhost:3000"
	@echo "- 前端Web: http://localhost:3001"
	@echo "- MPC服务: http://localhost:8080"
	@echo "- Ganache: http://localhost:8545"
	@echo "- PostgreSQL: localhost:5432"
	@echo "- Redis: localhost:6379"

dev-down:
	/Applications/Docker.app/Contents/Resources/bin/docker-compose down

dev-logs:
	/Applications/Docker.app/Contents/Resources/bin/docker-compose logs -f

# 测试
test:
	@echo "运行测试..."
	cd mpc-core && cargo test || true
	cd blockchain-middleware && go test ./... || true
	cd backend-services/api && go test ./... || true
	cd frontend-web && npm test || true
	cd smart-contracts && npx hardhat test || true

# 构建
build:
	@echo "构建所有服务..."
	cd mpc-core && cargo build --release
	cd blockchain-middleware && go build -o ./bin/middleware ./cmd/middleware
	cd backend-services/api && go build -o ./bin/api ./cmd/api
	cd frontend-web && npm run build
	cd smart-contracts && npx hardhat compile

# 清理
clean:
	@echo "清理构建产物..."
	cd mpc-core && cargo clean
	cd blockchain-middleware && rm -rf ./bin
	cd backend-services/api && rm -rf ./bin
	cd frontend-web && rm -rf ./build ./dist ./node_modules
	cd smart-contracts && rm -rf ./artifacts ./cache
	/Applications/Docker.app/Contents/Resources/bin/docker-compose down -v --remove-orphans

# 数据库迁移
db-migrate:
	@echo "运行数据库迁移..."
	cd backend-services/api && go run cmd/migrate/main.go

# 代码格式化
format:
	cd mpc-core && cargo fmt
	cd blockchain-middleware && go fmt ./...
	cd backend-services/api && go fmt ./...
	cd frontend-web && npm run format
	cd smart-contracts && npx prettier --write "contracts/**/*.sol"

# 代码检查
lint:
	cd mpc-core && cargo clippy
	cd blockchain-middleware && golangci-lint run
	cd backend-services/api && golangci-lint run
	cd frontend-web && npm run lint
	cd smart-contracts && npx solhint "contracts/**/*.sol"

# 部署相关
deploy-dev:
	@echo "部署到开发环境..."
	kubectl apply -f infrastructure/k8s/dev/

deploy-prod:
	@echo "部署到生产环境..."
	kubectl apply -f infrastructure/k8s/prod/

# 前端独立开发
frontend-dev:
	@echo "启动前端开发服务器..."
	cd frontend-web && npm run dev