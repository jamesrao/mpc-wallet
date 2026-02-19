package chain

import (
	"blockchain-middleware/internal/config"
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// EventHandler 事件处理接口
type EventHandler interface {
	HandleEvent(log ethtypes.Log) error
}

// EventWatcher 事件监听器
type EventWatcher struct {
	client      *ethclient.Client
	config      config.ChainConfig
	handlers    map[common.Hash]EventHandler
	running     bool
	stopChan    chan struct{}
	lastBlock   uint64
}

// NewEventWatcher 创建新的事件监听器
func NewEventWatcher(config config.ChainConfig) (*EventWatcher, error) {
	client, err := ethclient.Dial(config.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to node: %w", err)
	}

	return &EventWatcher{
		client:   client,
		config:   config,
		handlers: make(map[common.Hash]EventHandler),
		stopChan: make(chan struct{}),
	}, nil
}

// RegisterEventHandler 注册事件处理器
func (w *EventWatcher) RegisterEventHandler(eventSig common.Hash, handler EventHandler) {
	w.handlers[eventSig] = handler
}

// Start 开始监听事件
func (w *EventWatcher) Start() error {
	if w.running {
		return fmt.Errorf("event watcher already running")
	}

	// 获取当前区块号
	blockNumber, err := w.client.BlockNumber(context.Background())
	if err != nil {
		return fmt.Errorf("failed to get block number: %w", err)
	}
	w.lastBlock = blockNumber

	w.running = true
	go w.watchLoop()
	return nil
}

// Stop 停止监听事件
func (w *EventWatcher) Stop() {
	if !w.running {
		return
	}

	w.running = false
	close(w.stopChan)
}

// watchLoop 事件监听循环
func (w *EventWatcher) watchLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-w.stopChan:
			return
		case <-ticker.C:
			w.checkNewEvents()
		}
	}
}

// checkNewEvents 检查新事件
func (w *EventWatcher) checkNewEvents() {
	// 获取最新区块号
	currentBlock, err := w.client.BlockNumber(context.Background())
	if err != nil {
		log.Printf("Failed to get block number: %v", err)
		return
	}

	// 如果没有新块，跳过
	if currentBlock <= w.lastBlock {
		return
	}

	// 查询新块中的事件
	for blockNum := w.lastBlock + 1; blockNum <= currentBlock; blockNum++ {
		err := w.processBlockEvents(blockNum)
		if err != nil {
			log.Printf("Failed to process block %d: %v", blockNum, err)
			// 继续处理下一个块
		}
	}

	w.lastBlock = currentBlock
}

// processBlockEvents 处理区块中的事件
func (w *EventWatcher) processBlockEvents(blockNumber uint64) error {
	// 构建过滤器查询
	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(int64(blockNumber)),
		ToBlock:   big.NewInt(int64(blockNumber)),
		Addresses: []common.Address{}, // 为空表示监听所有合约
		Topics:    [][]common.Hash{},
	}

	logs, err := w.client.FilterLogs(context.Background(), query)
	if err != nil {
		return fmt.Errorf("failed to filter logs: %w", err)
	}

	// 处理每个事件
	for _, eventLog := range logs {
		// 查找对应的事件处理器
		if handler, ok := w.handlers[eventLog.Topics[0]]; ok {
			err := handler.HandleEvent(eventLog)
			if err != nil {
				log.Printf("Failed to handle event: %v", err)
				// 继续处理下一个事件
			}
		}
	}

	return nil
}

// GetLastBlock 获取最后处理的区块号
func (w *EventWatcher) GetLastBlock() uint64 {
	return w.lastBlock
}

// SetLastBlock 设置最后处理的区块号
func (w *EventWatcher) SetLastBlock(blockNumber uint64) {
	w.lastBlock = blockNumber
}

// Close 关闭事件监听器
func (w *EventWatcher) Close() error {
	w.Stop()
	if w.client != nil {
		w.client.Close()
	}
	return nil
}