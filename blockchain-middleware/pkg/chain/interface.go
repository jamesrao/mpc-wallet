package chain

import (
	"blockchain-middleware/internal/config"
	"blockchain-middleware/pkg/types"
	"fmt"
	"math/big"
)

// ChainClient 区块链客户端接口
type ChainClient interface {
	// 获取链信息
	GetChainID() int64
	GetNetworkName() string

	// 账户相关
	GetBalance(address string) (*big.Int, error)
	GetNonce(address string) (uint64, error)

	// 交易相关
	SendTransaction(req *types.TransactionRequest) (string, error)
	GetTransaction(txHash string) (*types.Transaction, error)
	EstimateGas(req *types.TransactionRequest) (uint64, error)

	// 区块相关
	GetBlockNumber() (uint64, error)
	GetBlockByNumber(blockNumber uint64) (*types.Block, error)

	// 合约相关
	CallContract(req *types.ContractCallRequest) ([]byte, error)

	// 关闭连接
	Close() error
}

// ChainFactory 区块链客户端工厂
type ChainFactory struct{}

// NewClient 创建区块链客户端
func (f *ChainFactory) NewClient(chainType string, config config.ChainConfig) (ChainClient, error) {
	switch chainType {
	case "ethereum":
		return NewEthereumClient(config)
	case "polygon":
		return NewPolygonClient(config)
	case "bsc":
		return NewBSCClient(config)
	case "bitcoin":
		return nil, fmt.Errorf("bitcoin support not implemented yet")
	default:
		return nil, fmt.Errorf("unsupported chain type: %s", chainType)
	}
}

// NewEthereumClient 创建以太坊客户端
func NewEthereumClient(config config.ChainConfig) (ChainClient, error) {
	return &EthereumClient{config: config}, nil
}

// NewPolygonClient 创建Polygon客户端
func NewPolygonClient(config config.ChainConfig) (ChainClient, error) {
	return &PolygonClient{config: config}, nil
}

// NewBSCClient 创建BSC客户端
func NewBSCClient(config config.ChainConfig) (ChainClient, error) {
	return &BSCClient{config: config}, nil
}

// NewBitcoinClient 创建比特币客户端
func NewBitcoinClient(config config.ChainConfig) (ChainClient, error) {
	return nil, fmt.Errorf("bitcoin support not implemented yet")
}