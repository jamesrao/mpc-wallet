package blockchain

import (
	"encoding/json"
	"fmt"
	"math/big"
)

// ChainType 区块链类型
type ChainType string

const (
	// ChainTypeEthereum 以太坊
	ChainTypeEthereum ChainType = "ethereum"
	// ChainTypePolygon Polygon
	ChainTypePolygon ChainType = "polygon"
	// ChainTypeBSC 币安智能链
	ChainTypeBSC ChainType = "bsc"
)

// BalanceResponse 余额响应
type BalanceResponse struct {
	Address string `json:"address"`
	Balance string `json:"balance"` // 十进制字符串
	Chain   string `json:"chain"`
}

// TransactionRequest 交易请求
type TransactionRequest struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Value string `json:"value"` // 十进制字符串，单位：wei
	Data  string `json:"data,omitempty"`
}

// TransactionResponse 交易响应
type TransactionResponse struct {
	TransactionHash string `json:"transaction_hash"`
	Chain          string `json:"chain"`
}

// TransactionDetails 交易详情
type TransactionDetails struct {
	Hash          string                 `json:"hash"`
	From          string                 `json:"from"`
	To            string                 `json:"to"`
	Value         string                 `json:"value"` // 十进制字符串
	Gas           string                 `json:"gas"`
	GasPrice      string                 `json:"gasPrice"`
	Nonce         uint64                 `json:"nonce"`
	BlockHash     string                 `json:"blockHash"`
	BlockNumber   uint64                 `json:"blockNumber"`
	Timestamp     int64                  `json:"timestamp"`
	Status        string                 `json:"status"`
	Confirmations int                    `json:"confirmations,omitempty"`
	Extra         map[string]interface{} `json:"extra,omitempty"`
}

// GasEstimateResponse Gas预估响应
type GasEstimateResponse struct {
	EstimatedGas *big.Int `json:"estimated_gas"`
	Chain        string   `json:"chain"`
}

// NonceResponse Nonce响应
type NonceResponse struct {
	Address string `json:"address"`
	Nonce   uint64 `json:"nonce"`
	Chain   string `json:"chain"`
}

// ChainInfo 链信息
type ChainInfo struct {
	Name        string `json:"name"`
	ChainID     uint64 `json:"chain_id"`
	NetworkName string `json:"network_name"`
	Enabled     bool   `json:"enabled"`
}

// APIResponse API响应包装器
type APIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Error   string          `json:"error,omitempty"`
}

// ParseBalance 解析余额响应
func ParseBalance(data json.RawMessage) (*BalanceResponse, error) {
	var balance BalanceResponse
	if err := json.Unmarshal(data, &balance); err != nil {
		return nil, fmt.Errorf("failed to parse balance response: %w", err)
	}
	return &balance, nil
}

// ParseTransaction 解析交易响应
func ParseTransaction(data json.RawMessage) (*TransactionResponse, error) {
	var tx TransactionResponse
	if err := json.Unmarshal(data, &tx); err != nil {
		return nil, fmt.Errorf("failed to parse transaction response: %w", err)
	}
	return &tx, nil
}

// ParseTransactionDetails 解析交易详情
func ParseTransactionDetails(data json.RawMessage) (*TransactionDetails, error) {
	var details TransactionDetails
	if err := json.Unmarshal(data, &details); err != nil {
		return nil, fmt.Errorf("failed to parse transaction details: %w", err)
	}
	return &details, nil
}

// ParseGasEstimate 解析Gas预估
func ParseGasEstimate(data json.RawMessage) (*GasEstimateResponse, error) {
	var gasResp struct {
		EstimatedGas string `json:"estimated_gas"`
		Chain        string `json:"chain"`
	}
	
	if err := json.Unmarshal(data, &gasResp); err != nil {
		return nil, fmt.Errorf("failed to parse gas estimate response: %w", err)
	}
	
	estimatedGas, ok := new(big.Int).SetString(gasResp.EstimatedGas, 10)
	if !ok {
		return nil, fmt.Errorf("invalid estimated gas value: %s", gasResp.EstimatedGas)
	}
	
	return &GasEstimateResponse{
		EstimatedGas: estimatedGas,
		Chain:        gasResp.Chain,
	}, nil
}

// ParseNonce 解析Nonce响应
func ParseNonce(data json.RawMessage) (*NonceResponse, error) {
	var nonce NonceResponse
	if err := json.Unmarshal(data, &nonce); err != nil {
		return nil, fmt.Errorf("failed to parse nonce response: %w", err)
	}
	return &nonce, nil
}

// ParseChains 解析链列表
func ParseChains(data json.RawMessage) ([]ChainInfo, error) {
	var chains []ChainInfo
	if err := json.Unmarshal(data, &chains); err != nil {
		return nil, fmt.Errorf("failed to parse chains list: %w", err)
	}
	return chains, nil
}