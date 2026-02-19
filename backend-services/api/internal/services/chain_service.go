package services

import (
	"backend-api/internal/clients/blockchain"
	"backend-api/internal/config"
	"crypto/rand"
	"crypto/sha256"
	"fmt"
	"math/big"
	"time"
)

// ChainService 区块链服务
type ChainService struct {
	client *blockchain.Client
}

// NewChainService 创建区块链服务实例
func NewChainService(cfg *config.Config) *ChainService {
	return &ChainService{
		client: blockchain.NewClient(&cfg.Chain),
	}
}

// GetBalance 获取地址余额
func (s *ChainService) GetBalance(address string) (string, error) {
	if address == "" {
		return "", fmt.Errorf("地址不能为空")
	}
	
	// 调用真实的区块链中间件服务
	// 默认使用以太坊链
	resp, err := s.client.GetBalance(blockchain.ChainTypeEthereum, address)
	if err != nil {
		return "", fmt.Errorf("failed to get balance from blockchain middleware: %w", err)
	}
	
	return resp.Balance, nil
}

// SendTransaction 发送交易
func (s *ChainService) SendTransaction(from, to, value, data string) (string, error) {
	if from == "" || to == "" {
		return "", fmt.Errorf("发件人或收件人地址不能为空")
	}
	
	// 创建交易请求
	req := &blockchain.TransactionRequest{
		From:  from,
		To:    to,
		Value: value,
		Data:  data,
	}
	
	// 调用真实的区块链中间件服务
	// 默认使用以太坊链
	resp, err := s.client.SendTransaction(blockchain.ChainTypeEthereum, req)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction via blockchain middleware: %w", err)
	}
	
	return resp.TransactionHash, nil
}

// GetTransaction 获取交易信息
func (s *ChainService) GetTransaction(txHash string) (map[string]interface{}, error) {
	if txHash == "" {
		return nil, fmt.Errorf("交易哈希不能为空")
	}
	
	// 调用真实的区块链中间件服务
	// 默认使用以太坊链
	details, err := s.client.GetTransaction(blockchain.ChainTypeEthereum, txHash)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction from blockchain middleware: %w", err)
	}
	
	// 转换为map[string]interface{}以保持向后兼容
	tx := map[string]interface{}{
		"hash":          details.Hash,
		"from":          details.From,
		"to":            details.To,
		"value":         details.Value,
		"gas":           details.Gas,
		"gasPrice":      details.GasPrice,
		"nonce":         details.Nonce,
		"blockHash":     details.BlockHash,
		"blockNumber":   details.BlockNumber,
		"timestamp":     details.Timestamp,
		"status":        details.Status,
		"confirmations": details.Confirmations,
	}
	
	// 添加额外字段
	for key, value := range details.Extra {
		tx[key] = value
	}
	
	return tx, nil
}

// CreateEscrow 创建托管合约
func (s *ChainService) CreateEscrow(seller, arbitrator string, amount *big.Int, deadline uint64, termsHash string) (string, error) {
	// 这里应该调用智能合约
	// 目前返回模拟ID
	return fmt.Sprintf("escrow_%d", time.Now().Unix()), nil
}

// GetEscrow 获取托管合约信息
func (s *ChainService) GetEscrow(escrowID string) (map[string]interface{}, error) {
	// 这里应该从智能合约获取信息
	// 目前返回模拟数据
	return map[string]interface{}{
		"id":         escrowID,
		"buyer":      "0x1234567890123456789012345678901234567890",
		"seller":     "0x2345678901234567890123456789012345678901",
		"arbitrator": "0x3456789012345678901234567890123456789012",
		"amount":     "1000000000000000000",
		"createdAt":  time.Now().Unix() - 86400,
		"deadline":   time.Now().Unix() + 86400,
		"status":     "Created",
		"termsHash":  "0x" + fmt.Sprintf("%x", sha256.Sum256([]byte(escrowID))),
	}, nil
}

// ReleaseEscrow 释放托管资金
func (s *ChainService) ReleaseEscrow(escrowID string) (string, error) {
	// 这里应该调用智能合约释放资金
	// 目前返回模拟交易哈希
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("0x%x", b), nil
}

// FinanceSupplyChain 供应链金融
func (s *ChainService) FinanceSupplyChain(invoiceID string, financier string, amount *big.Int) (string, error) {
	// 这里应该调用智能合约进行供应链金融
	// 目前返回模拟交易ID
	return fmt.Sprintf("finance_%d", time.Now().Unix()), nil
}

