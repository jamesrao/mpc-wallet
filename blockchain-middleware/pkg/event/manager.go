package event

import (
	"blockchain-middleware/pkg/types"
	"context"
	"fmt"
	"log"
	"sync"
	"time"
)

// EventManager 事件管理器
type EventManager struct {
	subscriptions map[string]*Subscription
	mu            sync.RWMutex
	ctx           context.Context
	cancel        context.CancelFunc
}

// Subscription 事件订阅
type Subscription struct {
	ID            string
	ChainName     string
	Filter        types.EventFilter
	EventChan     chan types.BlockchainEvent
	ctx           context.Context
	cancel        context.CancelFunc
}



// NewEventManager 创建新的事件管理器
func NewEventManager() *EventManager {
	ctx, cancel := context.WithCancel(context.Background())
	return &EventManager{
		subscriptions: make(map[string]*Subscription),
		ctx:           ctx,
		cancel:        cancel,
	}
}

// Start 启动事件管理器
func (em *EventManager) Start() error {
	log.Println("Event manager started")
	// 这里可以启动事件监听循环
	// 实际实现需要连接到各个区块链的WebSocket端点
	return nil
}

// Stop 停止事件管理器
func (em *EventManager) Stop() error {
	em.mu.Lock()
	defer em.mu.Unlock()

	// 取消所有订阅
	for _, sub := range em.subscriptions {
		sub.cancel()
		close(sub.EventChan)
	}

	// 清空订阅列表
	em.subscriptions = make(map[string]*Subscription)

	// 取消上下文
	em.cancel()

	log.Println("Event manager stopped")
	return nil
}

// Subscribe 订阅事件
func (em *EventManager) Subscribe(chainName string, filter types.EventFilter) (string, error) {
	em.mu.Lock()
	defer em.mu.Unlock()

	subscriptionID := generateSubscriptionID()
	
	ctx, cancel := context.WithCancel(em.ctx)
	sub := &Subscription{
		ID:        subscriptionID,
		ChainName: chainName,
		Filter:    filter,
		EventChan: make(chan types.BlockchainEvent, 100), // 缓冲通道
		ctx:       ctx,
		cancel:    cancel,
	}

	em.subscriptions[subscriptionID] = sub

	// 启动事件监听协程
	go em.startSubscriptionListener(sub)

	log.Printf("New subscription created: %s for chain %s", subscriptionID, chainName)
	return subscriptionID, nil
}

// Unsubscribe 取消订阅
func (em *EventManager) Unsubscribe(subscriptionID string) error {
	em.mu.Lock()
	defer em.mu.Unlock()

	sub, exists := em.subscriptions[subscriptionID]
	if !exists {
		return fmt.Errorf("subscription not found: %s", subscriptionID)
	}

	sub.cancel()
	close(sub.EventChan)
	delete(em.subscriptions, subscriptionID)

	log.Printf("Subscription removed: %s", subscriptionID)
	return nil
}

// GetSubscription 获取订阅
func (em *EventManager) GetSubscription(subscriptionID string) (*Subscription, error) {
	em.mu.RLock()
	defer em.mu.RUnlock()

	sub, exists := em.subscriptions[subscriptionID]
	if !exists {
		return nil, fmt.Errorf("subscription not found: %s", subscriptionID)
	}

	return sub, nil
}

// startSubscriptionListener 启动订阅监听器
func (em *EventManager) startSubscriptionListener(sub *Subscription) {
	log.Printf("Starting listener for subscription: %s", sub.ID)

	// 模拟事件生成（实际实现需要连接到区块链节点）
	ticker := time.NewTicker(10 * time.Second) // 每10秒生成一个模拟事件
	defer ticker.Stop()

	blockNumber := uint64(10000000) // 起始区块号

	for {
		select {
		case <-sub.ctx.Done():
			log.Printf("Listener stopped for subscription: %s", sub.ID)
			return
		case <-ticker.C:
			// 生成模拟事件
			event := types.BlockchainEvent{
				ChainName:   sub.ChainName,
				Type:        "NewBlock",
				BlockNumber: blockNumber,
				BlockHash:   fmt.Sprintf("0x%x", time.Now().UnixNano()),
				Data: map[string]interface{}{
					"transactions": 10,
					"gas_used":     1000000,
				},
				Timestamp: time.Now(),
			}

			// 检查事件是否符合过滤器
			if em.filterMatches(sub.Filter, event) {
				select {
				case sub.EventChan <- event:
					log.Printf("Event sent to subscription: %s", sub.ID)
				default:
					log.Printf("Event channel full for subscription: %s", sub.ID)
				}
			}

			blockNumber++
		}
	}
}

// filterMatches 检查事件是否符合过滤器
func (em *EventManager) filterMatches(filter types.EventFilter, event types.BlockchainEvent) bool {
	// 检查事件类型
	if filter.EventType != "" && filter.EventType != event.Type {
		return false
	}

	// 检查合约地址
	if filter.ContractAddress != "" && event.Data["contract_address"] != filter.ContractAddress {
		return false
	}

	// 检查事件主题
	if len(filter.Topics) > 0 {
		// 简化处理，实际需要更复杂的匹配逻辑
		return true
	}

	return true
}

// generateSubscriptionID 生成订阅ID
func generateSubscriptionID() string {
	return fmt.Sprintf("sub_%d", time.Now().UnixNano())
}

// GetEventChan 获取事件通道
func (s *Subscription) GetEventChan() <-chan types.BlockchainEvent {
	return s.EventChan
}

// Close 关闭订阅
func (s *Subscription) Close() {
	s.cancel()
	close(s.EventChan)
}