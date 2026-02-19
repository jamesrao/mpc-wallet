package service

import (
	"blockchain-middleware/internal/config"
	"blockchain-middleware/pkg/chain"
	"blockchain-middleware/pkg/event"
	"blockchain-middleware/pkg/types"
	"fmt"
	"log"
	"math/big"
	"sync"
	"time"
)

// ServiceManager 服务管理器
type ServiceManager struct {
	config    *config.Config
	clients   map[string]chain.ChainClient
	eventMgr  *event.EventManager
	mu        sync.RWMutex
}

// NewServiceManager 创建新的服务管理器
func NewServiceManager(cfg *config.Config) (*ServiceManager, error) {
	mgr := &ServiceManager{
		config:   cfg,
		clients:  make(map[string]chain.ChainClient),
		eventMgr: event.NewEventManager(),
	}

	return mgr, nil
}

// Start 启动所有服务
func (sm *ServiceManager) Start() error {
	log.Println("Starting blockchain services...")

	// 启动支持的链客户端
	chains := []struct {
		name string
		cfg  config.ChainConfig
	}{
		{"ethereum", sm.config.Chains.Ethereum},
		{"polygon", sm.config.Chains.Polygon},
		{"bsc", sm.config.Chains.BSC},
	}

	for _, c := range chains {
		if c.cfg.Enabled {
			if err := sm.startChainClient(c.name, c.cfg); err != nil {
				return fmt.Errorf("failed to start %s client: %w", c.name, err)
			}
		}
	}

	// 启动事件管理器
	if err := sm.eventMgr.Start(); err != nil {
		return fmt.Errorf("failed to start event manager: %w", err)
	}

	log.Println("All blockchain services started successfully")
	return nil
}

// Stop 停止所有服务
func (sm *ServiceManager) Stop() error {
	log.Println("Stopping blockchain services...")

	// 停止事件管理器
	if err := sm.eventMgr.Stop(); err != nil {
		log.Printf("Error stopping event manager: %v", err)
	}

	// 关闭所有链客户端
	sm.mu.Lock()
	defer sm.mu.Unlock()

	for name, client := range sm.clients {
		if err := client.Close(); err != nil {
			log.Printf("Error closing %s client: %v", name, err)
		}
		delete(sm.clients, name)
	}

	log.Println("All blockchain services stopped")
	return nil
}

// startChainClient 启动单个链客户端
func (sm *ServiceManager) startChainClient(name string, cfg config.ChainConfig) error {
	factory := &chain.ChainFactory{}
	client, err := factory.NewClient(name, cfg)
	if err != nil {
		return err
	}

	sm.mu.Lock()
	sm.clients[name] = client
	sm.mu.Unlock()

	log.Printf("%s client started successfully", name)
	return nil
}

// GetChainClient 获取指定链的客户端
func (sm *ServiceManager) GetChainClient(chainName string) (chain.ChainClient, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	client, exists := sm.clients[chainName]
	if !exists {
		return nil, fmt.Errorf("chain client not found: %s", chainName)
	}

	return client, nil
}

// GetSupportedChains 获取支持的链列表
func (sm *ServiceManager) GetSupportedChains() []string {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	chains := make([]string, 0, len(sm.clients))
	for name := range sm.clients {
		chains = append(chains, name)
	}

	return chains
}

// GetChainInfo 获取链信息
func (sm *ServiceManager) GetChainInfo(chainName string) (*types.ChainInfo, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return nil, err
	}

	blockNumber, err := client.GetBlockNumber()
	if err != nil {
		return nil, err
	}

	// 获取Gas价格（示例实现）
	gasPrice := new(types.TransactionRequest)
	gasPrice.GasPrice = big.NewInt(20000000000) // 20 Gwei

	return &types.ChainInfo{
		ChainID:     client.GetChainID(),
		NetworkName: client.GetNetworkName(),
		BlockNumber: blockNumber,
		GasPrice:    gasPrice.GasPrice,
		IsSyncing:   false, // 简化处理
		PeerCount:   0,     // 简化处理
	}, nil
}

// GetBalance 获取账户余额
func (sm *ServiceManager) GetBalance(chainName, address string) (*big.Int, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return nil, err
	}

	return client.GetBalance(address)
}

// SendTransaction 发送交易
func (sm *ServiceManager) SendTransaction(chainName string, req *types.TransactionRequest) (string, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return "", err
	}

	return client.SendTransaction(req)
}

// GetTransaction 获取交易信息
func (sm *ServiceManager) GetTransaction(chainName, txHash string) (*types.Transaction, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return nil, err
	}

	return client.GetTransaction(txHash)
}

// EstimateGas 预估Gas
func (sm *ServiceManager) EstimateGas(chainName string, req *types.TransactionRequest) (uint64, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return 0, err
	}

	return client.EstimateGas(req)
}

// CallContract 调用合约
func (sm *ServiceManager) CallContract(chainName string, req *types.ContractCallRequest) ([]byte, error) {
	client, err := sm.GetChainClient(chainName)
	if err != nil {
		return nil, err
	}

	return client.CallContract(req)
}

// SubscribeEvents 订阅事件
func (sm *ServiceManager) SubscribeEvents(chainName string, filter types.EventFilter) (string, error) {
	return sm.eventMgr.Subscribe(chainName, filter)
}

// UnsubscribeEvents 取消订阅事件
func (sm *ServiceManager) UnsubscribeEvents(subscriptionID string) error {
	return sm.eventMgr.Unsubscribe(subscriptionID)
}

// GetEventManager 获取事件管理器
func (sm *ServiceManager) GetEventManager() *event.EventManager {
	return sm.eventMgr
}

// CrossChainTransfer 跨链转账
func (sm *ServiceManager) CrossChainTransfer(req *types.CrossChainRequest) (string, error) {
	// 跨链转账实现
	// 1. 在源链锁定资产
	// 2. 生成证明
	// 3. 在目标链解锁资产
	// 这里返回模拟的转账ID
	
	transferID := fmt.Sprintf("crosschain_%s_%d", req.FromChain, time.Now().UnixNano())
	return transferID, nil
}

// GetCrossChainStatus 获取跨链状态
func (sm *ServiceManager) GetCrossChainStatus(transferID string) (*types.CrossChainStatus, error) {
	// 返回模拟的跨链状态
	return &types.CrossChainStatus{
		TransferID: transferID,
		Status:     "completed",
		SourceTx:   "0x123...",
		TargetTx:   "0x456...",
		Amount:     big.NewInt(1000000000000000000), // 1 ETH
		CreatedAt:  time.Now().Add(-10 * time.Minute),
		UpdatedAt:  time.Now().Add(-1 * time.Minute),
	}, nil
}

// MPC相关方法

// SignMPCTransaction MPC签名交易
func (sm *ServiceManager) SignMPCTransaction(req *types.MPCTransactionRequest) (*types.MPCTransactionResponse, error) {
	// MPC签名实现
	// 1. 收集参与者的签名分片
	// 2. 组合签名
	// 3. 返回签名结果
	
	return &types.MPCTransactionResponse{
		SessionID: req.SessionID,
		Signature: []byte("signed_tx_hash"),
		Status:    "completed",
	}, nil
}

// BroadcastMPCTransaction 广播MPC交易
func (sm *ServiceManager) BroadcastMPCTransaction(req *types.MPCBroadcastRequest) (string, error) {
	// 广播MPC交易
	client, err := sm.GetChainClient(req.ChainName)
	if err != nil {
		return "", err
	}

	txReq := &types.TransactionRequest{
		From:     req.From,
		To:       req.To,
		Value:    req.Value,
		Data:     req.Data,
		GasLimit: req.GasLimit,
		GasPrice: req.GasPrice,
	}

	return client.SendTransaction(txReq)
}