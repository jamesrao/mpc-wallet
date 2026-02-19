package types

import (
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

// TransactionRequest 交易请求
type TransactionRequest struct {
	From     string   `json:"from"`
	To       string   `json:"to"`
	Value    *big.Int `json:"value"`
	GasLimit uint64   `json:"gas_limit"`
	GasPrice *big.Int `json:"gas_price"`
	Nonce    uint64   `json:"nonce"`
	Data     []byte   `json:"data"`
	ChainID  int64    `json:"chain_id"`
}

// Transaction 交易信息
type Transaction struct {
	Hash              string           `json:"hash"`
	From              string           `json:"from"`
	To                string           `json:"to"`
	Value             *big.Int         `json:"value"`
	GasPrice          *big.Int         `json:"gas_price"`
	GasLimit          uint64           `json:"gas_limit"`
	Nonce             uint64           `json:"nonce"`
	Data              []byte           `json:"data"`
	ChainID           int64            `json:"chain_id"`
	Status            uint64           `json:"status"` // 0=失败, 1=成功
	BlockNumber       uint64           `json:"block_number"`
	TransactionIndex  uint             `json:"transaction_index"`
	GasUsed           uint64           `json:"gas_used"`
	CumulativeGasUsed uint64           `json:"cumulative_gas_used"`
	Logs              []*types.Log     `json:"logs"`
	Timestamp         uint64           `json:"timestamp"`
}

// Block 区块信息
type Block struct {
	Number       uint64   `json:"number"`
	Hash         string   `json:"hash"`
	ParentHash   string   `json:"parent_hash"`
	Timestamp    uint64   `json:"timestamp"`
	Transactions []string `json:"transactions"` // 交易哈希列表
	GasUsed      uint64   `json:"gas_used"`
	GasLimit     uint64   `json:"gas_limit"`
	Difficulty   *big.Int `json:"difficulty"`
	TotalDifficulty *big.Int `json:"total_difficulty"`
	Size         uint64   `json:"size"`
	Miner        string   `json:"miner"`
}

// ContractCallRequest 合约调用请求
type ContractCallRequest struct {
	From            common.Address `json:"from"`
	ContractAddress common.Address `json:"contract_address"`
	Data            []byte         `json:"data"`
	Value           *big.Int       `json:"value"`
	GasLimit        uint64         `json:"gas_limit"`
	GasPrice        *big.Int       `json:"gas_price"`
	BlockNumber     uint64         `json:"block_number"`
}

// ContractCallResponse 合约调用响应
type ContractCallResponse struct {
	Result []byte `json:"result"`
	GasUsed uint64 `json:"gas_used"`
	Error   string `json:"error,omitempty"`
}

// TokenBalance 代币余额
type TokenBalance struct {
	ContractAddress string   `json:"contract_address"`
	Symbol          string   `json:"symbol"`
	Decimals        uint8    `json:"decimals"`
	Balance         *big.Int `json:"balance"`
}

// AccountInfo 账户信息
type AccountInfo struct {
	Address      string          `json:"address"`
	ETHBalance   *big.Int        `json:"eth_balance"`
	TokenBalances []TokenBalance `json:"token_balances"`
	Nonce        uint64          `json:"nonce"`
	TransactionCount uint64      `json:"transaction_count"`
}

// ChainInfo 链信息
type ChainInfo struct {
	ChainID      int64  `json:"chain_id"`
	NetworkName  string `json:"network_name"`
	BlockNumber  uint64 `json:"block_number"`
	GasPrice     *big.Int `json:"gas_price"`
	IsSyncing    bool   `json:"is_syncing"`
	PeerCount    int    `json:"peer_count"`
}

// EventFilter 事件过滤器
type EventFilter struct {
	EventType       string   `json:"event_type"`
	ContractAddress string   `json:"contract_address"`
	Topics          []string `json:"topics"`
	FromBlock       uint64   `json:"from_block"`
	ToBlock         uint64   `json:"to_block"`
}

// MPCTransactionRequest MPC交易请求
type MPCTransactionRequest struct {
	SessionID string           `json:"session_id"`
	ChainName string           `json:"chain_name"`
	From      string           `json:"from"`
	To        string           `json:"to"`
	Value     *big.Int         `json:"value"`
	Data      []byte           `json:"data"`
	GasLimit  uint64           `json:"gas_limit"`
	GasPrice  *big.Int         `json:"gas_price"`
}

// MPCTransactionResponse MPC交易响应
type MPCTransactionResponse struct {
	SessionID string `json:"session_id"`
	Signature []byte `json:"signature"`
	Status    string `json:"status"`
}

// MPCBroadcastRequest MPC广播请求
type MPCBroadcastRequest struct {
	SessionID string           `json:"session_id"`
	ChainName string           `json:"chain_name"`
	From      string           `json:"from"`
	To        string           `json:"to"`
	Value     *big.Int         `json:"value"`
	Data      []byte           `json:"data"`
	GasLimit  uint64           `json:"gas_limit"`
	GasPrice  *big.Int         `json:"gas_price"`
	Signature []byte           `json:"signature"`
}

// CrossChainRequest 跨链请求
type CrossChainRequest struct {
	FromChain  string           `json:"from_chain"`
	ToChain    string           `json:"to_chain"`
	From       string           `json:"from"`
	To         string           `json:"to"`
	Amount     *big.Int         `json:"amount"`
	Token      string           `json:"token"`
}

// CrossChainStatus 跨链状态
type CrossChainStatus struct {
	TransferID string    `json:"transfer_id"`
	Status     string    `json:"status"`
	SourceTx   string    `json:"source_tx"`
	TargetTx   string    `json:"target_tx"`
	Amount     *big.Int  `json:"amount"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status string `json:"status"`
}

// SessionStatusResponse 会话状态响应
type SessionStatusResponse struct {
	SessionID string `json:"session_id"`
	Status    SessionStatus `json:"status"`
}

// PublicKeyResponse 公钥响应
type PublicKeyResponse struct {
	SessionID  string `json:"session_id"`
	PublicKey  string `json:"public_key"`
}

// VerifyResponse 验证响应
type VerifyResponse struct {
	Valid bool `json:"valid"`
}

// SessionStatus 会话状态枚举
type SessionStatus int

const (
	SessionPending SessionStatus = iota
	SessionInProgress
	SessionCompleted
	SessionFailed
	SessionCancelled
)

// BlockchainEvent 区块链事件
type BlockchainEvent struct {
	ChainName   string                 `json:"chain_name"`
	Type        string                 `json:"type"`
	BlockNumber uint64                 `json:"block_number"`
	BlockHash   string                 `json:"block_hash"`
	TxHash      string                 `json:"tx_hash,omitempty"`
	LogIndex    uint                   `json:"log_index,omitempty"`
	Data        map[string]interface{} `json:"data"`
	Timestamp   time.Time              `json:"timestamp"`
}