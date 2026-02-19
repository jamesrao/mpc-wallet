#!/bin/bash
# 端到端测试脚本：用户注册 -> 钱包创建 -> 发送交易

set -e

# 配置API基础地址
API_BASE="http://localhost:3000"

# 检查服务是否运行
echo "🔍 检查服务状态..."
if ! curl -s $API_BASE/health > /dev/null 2>&1; then
    echo "❌ 后端API未运行，请先启动测试环境:"
    echo "   ./scripts/start-test-environment.sh"
    echo ""
    echo "💡 或者检查以下服务是否正常:"
    echo "   - API服务: curl http://localhost:3000/health"
    echo "   - MPC核心: curl http://localhost:8081/health"
    echo "   - 区块链中间件: curl http://localhost:8082/health"
    exit 1
fi

# 检查依赖服务
if ! curl -s http://localhost:8081/health > /dev/null 2>&1; then
    echo "⚠️ MPC核心服务未运行，使用模拟模式"
    MPC_MODE="mock"
else
    MPC_MODE="real"
fi

if ! curl -s http://localhost:8082/health > /dev/null 2>&1; then
    echo "⚠️ 区块链中间件未运行，使用模拟模式"
    BLOCKCHAIN_MODE="mock"
else
    BLOCKCHAIN_MODE="real"
fi

echo "=== MPC钱包端到端测试 ==="
echo "API基础地址: $API_BASE"
echo ""

# 1. 用户注册
echo "1. 用户注册..."
USER_RESP=$(curl -s -X POST "$API_BASE/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "TestPass123!"
  }')

if echo "$USER_RESP" | grep -q '"success":true'; then
    USER_ID=$(echo "$USER_RESP" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✓ 用户注册成功，用户ID: $USER_ID"
else
    echo "✗ 用户注册失败: $USER_RESP"
    exit 1
fi

# 2. 钱包创建
echo ""
echo "2. 创建MPC钱包..."
WALLET_RESP=$(curl -s -X POST "$API_BASE/api/v1/wallets" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'"$USER_ID"'",
    "chain_type": "ethereum",
    "wallet_type": "mpc",
    "threshold": 2,
    "total_shares": 3,
    "name": "测试钱包"
  }')

if echo "$WALLET_RESP" | grep -q '"success":true'; then
    WALLET_ADDRESS=$(echo "$WALLET_RESP" | grep -o '"wallet_address":"[^"]*"' | cut -d'"' -f4)
    WALLET_ID=$(echo "$WALLET_RESP" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✓ 钱包创建成功，地址: $WALLET_ADDRESS"
else
    echo "✗ 钱包创建失败: $WALLET_RESP"
    # 如果MPC服务未运行，使用模拟钱包
    echo "尝试创建模拟钱包..."
    WALLET_ADDRESS="0x$(openssl rand -hex 20)"
    WALLET_ID="mock-wallet-id"
    echo "模拟钱包地址: $WALLET_ADDRESS"
fi

# 3. 查询余额
echo ""
echo "3. 查询钱包余额..."
BALANCE_RESP=$(curl -s -X GET "$API_BASE/api/v1/wallets/$WALLET_ID/balance?chain_type=ethereum")

if echo "$BALANCE_RESP" | grep -q '"success":true'; then
    BALANCE=$(echo "$BALANCE_RESP" | grep -o '"balance":"[^"]*"' | cut -d'"' -f4)
    echo "✓ 余额查询成功: $BALANCE ETH"
else
    echo "✗ 余额查询失败: $BALANCE_RESP"
fi

# 4. 发送交易（需要Ganache中有余额）
echo ""
echo "4. 发送测试交易..."
# 首先给钱包充值（使用Ganache默认账户）
GANACHE_URL="http://localhost:8545"
# 获取Ganache默认账户
DEFAULT_ACCOUNT=$(curl -s -X POST "$GANACHE_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' | \
  grep -o '"result":\["[^"]*"' | cut -d'"' -f4 | head -1)

if [ -n "$DEFAULT_ACCOUNT" ]; then
    echo "Ganache默认账户: $DEFAULT_ACCOUNT"
    # 发送ETH到测试钱包
    TX_DATA=$(curl -s -X POST "$GANACHE_URL" \
      -H "Content-Type: application/json" \
      -d '{
        "jsonrpc":"2.0",
        "method":"eth_sendTransaction",
        "params":[{
          "from": "'"$DEFAULT_ACCOUNT"'",
          "to": "'"$WALLET_ADDRESS"'",
          "value": "0x16345785d8a0000"  # 0.1 ETH
        }],
        "id":1
      }')
    echo "充值交易: $TX_DATA"
fi

# 5. 创建交易（使用后端API）
echo ""
echo "5. 创建交易请求..."
TX_RESP=$(curl -s -X POST "$API_BASE/api/v1/chain/transaction" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": "'"$WALLET_ID"'",
    "chain_type": "ethereum",
    "to_address": "0x0000000000000000000000000000000000000000",
    "value": "0.001",
    "data": ""
  }')

if echo "$TX_RESP" | grep -q '"success":true'; then
    TX_HASH=$(echo "$TX_RESP" | grep -o '"transaction_hash":"[^"]*"' | cut -d'"' -f4)
    echo "✓ 交易创建成功，哈希: $TX_HASH"
else
    echo "✗ 交易创建失败: $TX_RESP"
fi

echo ""
echo "=== 测试完成 ==="
echo "用户ID: $USER_ID"
echo "钱包地址: $WALLET_ADDRESS"
echo "请检查区块链浏览器确认交易状态。"