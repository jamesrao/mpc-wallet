package chain

import (
	"blockchain-middleware/internal/config"
	"blockchain-middleware/pkg/types"
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// BSCClient BSC客户端
type BSCClient struct {
	config config.ChainConfig
	client *ethclient.Client
}

// Connect 连接到BSC节点
func (c *BSCClient) Connect() error {
	client, err := ethclient.Dial(c.config.RPCURL)
	if err != nil {
		return fmt.Errorf("failed to connect to bsc node: %w", err)
	}
	c.client = client
	return nil
}

// GetChainID 获取链ID
func (c *BSCClient) GetChainID() int64 {
	return c.config.ChainID
}

// GetNetworkName 获取网络名称
func (c *BSCClient) GetNetworkName() string {
	return c.config.NetworkName
}

// GetBalance 获取余额
func (c *BSCClient) GetBalance(address string) (*big.Int, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return nil, err
		}
	}

	addr := common.HexToAddress(address)
	balance, err := c.client.BalanceAt(context.Background(), addr, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance, nil
}

// GetNonce 获取Nonce
func (c *BSCClient) GetNonce(address string) (uint64, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return 0, err
		}
	}

	addr := common.HexToAddress(address)
	nonce, err := c.client.PendingNonceAt(context.Background(), addr)
	if err != nil {
		return 0, fmt.Errorf("failed to get nonce: %w", err)
	}

	return nonce, nil
}

// SendTransaction 发送交易
func (c *BSCClient) SendTransaction(req *types.TransactionRequest) (string, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return "", err
		}
	}

	// 从配置获取私钥并解析
	if c.config.PrivateKey == "" {
		return "", fmt.Errorf("private key not configured")
	}
	privateKey, err := crypto.HexToECDSA(c.config.PrivateKey)
	if err != nil {
		return "", fmt.Errorf("failed to parse private key: %w", err)
	}

	// 创建交易
	tx := ethtypes.NewTransaction(
		req.Nonce,
		common.HexToAddress(req.To),
		req.Value,
		req.GasLimit,
		req.GasPrice,
		req.Data,
	)

	// 签名交易
	signedTx, err := ethtypes.SignTx(tx, ethtypes.NewEIP155Signer(big.NewInt(c.config.ChainID)), privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// 发送交易
	err = c.client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return signedTx.Hash().Hex(), nil
}

// GetTransaction 获取交易信息
func (c *BSCClient) GetTransaction(txHash string) (*types.Transaction, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return nil, err
		}
	}

	hash := common.HexToHash(txHash)
	tx, _, err := c.client.TransactionByHash(context.Background(), hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}

	// 获取交易收据
	receipt, err := c.client.TransactionReceipt(context.Background(), hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction receipt: %w", err)
	}

	// 转换为自定义类型
	return &types.Transaction{
		Hash:              tx.Hash().Hex(),
		From:              "", // 需要从签名中提取
		To:                tx.To().Hex(),
		Value:             tx.Value(),
		GasPrice:          tx.GasPrice(),
		GasLimit:          tx.Gas(),
		Nonce:             tx.Nonce(),
		Data:              tx.Data(),
		ChainID:           c.config.ChainID,
		Status:            receipt.Status,
		BlockNumber:       receipt.BlockNumber.Uint64(),
		TransactionIndex:  receipt.TransactionIndex,
		GasUsed:           receipt.GasUsed,
		CumulativeGasUsed: receipt.CumulativeGasUsed,
		Logs:              receipt.Logs,
	}, nil
}

// EstimateGas 预估Gas
func (c *BSCClient) EstimateGas(req *types.TransactionRequest) (uint64, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return 0, err
		}
	}

	// 创建消息调用
	to := common.HexToAddress(req.To)
	msg := ethereum.CallMsg{
		From:     common.HexToAddress(req.From),
		To:       &to,
		Gas:      req.GasLimit,
		GasPrice: req.GasPrice,
		Value:    req.Value,
		Data:     req.Data,
	}

	gas, err := c.client.EstimateGas(context.Background(), msg)
	if err != nil {
		return 0, fmt.Errorf("failed to estimate gas: %w", err)
	}

	return gas, nil
}

// GetBlockNumber 获取最新区块号
func (c *BSCClient) GetBlockNumber() (uint64, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return 0, err
		}
	}

	blockNumber, err := c.client.BlockNumber(context.Background())
	if err != nil {
		return 0, fmt.Errorf("failed to get block number: %w", err)
	}

	return blockNumber, nil
}

// GetBlockByNumber 根据区块号获取区块
func (c *BSCClient) GetBlockByNumber(blockNumber uint64) (*types.Block, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return nil, err
		}
	}

	block, err := c.client.BlockByNumber(context.Background(), big.NewInt(int64(blockNumber)))
	if err != nil {
		return nil, fmt.Errorf("failed to get block: %w", err)
	}

	// 转换为自定义类型
	// 收集交易哈希
	txHashes := make([]string, len(block.Transactions()))
	for i, tx := range block.Transactions() {
		txHashes[i] = tx.Hash().Hex()
	}
	
	return &types.Block{
		Number:       block.Number().Uint64(),
		Hash:         block.Hash().Hex(),
		ParentHash:   block.ParentHash().Hex(),
		Timestamp:    block.Time(),
		Transactions: txHashes,
		GasUsed:      block.GasUsed(),
		GasLimit:     block.GasLimit(),
		Difficulty:   block.Difficulty(),
	}, nil
}

// CallContract 调用合约
func (c *BSCClient) CallContract(req *types.ContractCallRequest) ([]byte, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return nil, err
		}
	}

	msg := ethereum.CallMsg{
		From:     req.From,
		To:       &req.ContractAddress,
		Gas:      req.GasLimit,
		GasPrice: req.GasPrice,
		Value:    req.Value,
		Data:     req.Data,
	}

	result, err := c.client.CallContract(context.Background(), msg, big.NewInt(int64(req.BlockNumber)))
	if err != nil {
		return nil, fmt.Errorf("failed to call contract: %w", err)
	}

	return result, nil
}

// GetTokenBalance 获取代币余额
func (c *BSCClient) GetTokenBalance(tokenAddr, holderAddr common.Address) (*big.Int, error) {
	if c.client == nil {
		if err := c.Connect(); err != nil {
			return nil, err
		}
	}

	// ERC20 balanceOf 函数签名
	balanceOfSig := []byte("balanceOf(address)")
	hash := crypto.Keccak256(balanceOfSig)
	methodID := hash[:4]

	// 编码地址参数
	addrArg := common.LeftPadBytes(holderAddr.Bytes(), 32)
	data := append(methodID, addrArg...)

	// 调用合约
	msg := ethereum.CallMsg{
		To:   &tokenAddr,
		Data: data,
	}

	result, err := c.client.CallContract(context.Background(), msg, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call token contract: %w", err)
	}

	// 解码余额
	balance := new(big.Int).SetBytes(result)
	return balance, nil
}

// Close 关闭连接
func (c *BSCClient) Close() error {
	if c.client != nil {
		c.client.Close()
	}
	return nil
}