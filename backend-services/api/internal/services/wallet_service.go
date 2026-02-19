package services

import (
	"backend-api/internal/models"
	"backend-api/internal/repositories"
	"backend-api/internal/utils"
	"fmt"
	"time"
)

// WalletService 钱包服务
type WalletService struct {
	walletRepo repositories.WalletRepository
	mpcService *MPCService
}

// NewWalletService 创建钱包服务实例
func NewWalletService(walletRepo repositories.WalletRepository, mpcService *MPCService) *WalletService {
	return &WalletService{
		walletRepo: walletRepo,
		mpcService: mpcService,
	}
}



// CreateWallet 创建钱包
func (s *WalletService) CreateWallet(req models.CreateWalletRequest) (*models.Wallet, error) {
	// 验证请求
	if req.UserID == "" || req.Name == "" || req.ChainType == "" {
		return nil, ErrInvalidRequest
	}
	
	if req.Threshold < 2 || req.Threshold > req.TotalShares {
		return nil, fmt.Errorf("invalid threshold")
	}
	
	// 生成参与者列表（当前只有一个参与者：用户自己）
	participants := []string{req.UserID}
	
	// 调用MPC服务生成密钥对
	session, err := s.mpcService.InitiateKeyGeneration(participants, req.Threshold, req.TotalShares)
	if err != nil {
		return nil, fmt.Errorf("failed to generate MPC key pair: %v", err)
	}
	
	// 检查密钥生成是否成功
	if session.Status != "completed" {
		return nil, fmt.Errorf("MPC key generation failed with status: %s", session.Status)
	}
	
	if session.PublicKey == "" {
		return nil, fmt.Errorf("MPC key generation did not produce a public key")
	}
	
	// 使用生成的公钥作为钱包地址
	walletAddress := session.PublicKey
	
	// 创建钱包
	wallet := &models.Wallet{
		ID:            utils.GenerateID(),
		UserID:        req.UserID,
		Name:          req.Name,
		WalletAddress: walletAddress,
		ChainType:     req.ChainType,
		WalletType:    "mpc",
		Threshold:     req.Threshold,
		TotalShares:   req.TotalShares,
		Status:        "active",
	}
	
	if err := s.walletRepo.Create(wallet); err != nil {
		return nil, err
	}
	
	return wallet, nil
}

// GetWallet 获取钱包信息
func (s *WalletService) GetWallet(id string) (*models.Wallet, error) {
	if id == "" {
		return nil, ErrInvalidRequest
	}
	
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	
	return wallet, nil
}

// GetUserWallets 获取用户的所有钱包
func (s *WalletService) GetUserWallets(userID string) ([]*models.Wallet, error) {
	if userID == "" {
		return nil, ErrInvalidRequest
	}
	
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	
	return wallets, nil
}

// UpdateWallet 更新钱包信息
func (s *WalletService) UpdateWallet(id string, name string) (*models.Wallet, error) {
	if id == "" || name == "" {
		return nil, ErrInvalidRequest
	}
	
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	
	wallet.Name = name
	wallet.UpdatedAt = time.Now()
	
	if err := s.walletRepo.Update(wallet); err != nil {
		return nil, err
	}
	
	return wallet, nil
}

// DeleteWallet 删除钱包
func (s *WalletService) DeleteWallet(id string) error {
	if id == "" {
		return ErrInvalidRequest
	}
	
	return s.walletRepo.Delete(id)
}

// GetWalletBalance 获取钱包余额
func (s *WalletService) GetWalletBalance(walletID string, tokenAddress string) (*models.WalletBalance, error) {
	if walletID == "" {
		return nil, ErrInvalidRequest
	}

	wallet, err := s.walletRepo.FindByID(walletID)
	if err != nil {
		return nil, err
	}

	// 这里应该调用区块链中间件查询余额
	// 暂时返回模拟余额
	balance := &models.WalletBalance{
		WalletID: walletID,
		Balance:  "1000000000000000000",
		Token:    tokenAddress,
		Chain:    wallet.ChainType,
	}

	return balance, nil
}

// SendTransaction 发送交易
func (s *WalletService) SendTransaction(walletID, to, value, data string) (string, error) {
	if walletID == "" || to == "" || value == "" {
		return "", ErrInvalidRequest
	}

	wallet, err := s.walletRepo.FindByID(walletID)
	if err != nil {
		return "", err
	}

	// 检查钱包状态
	if wallet.Status != "active" {
		return "", fmt.Errorf("钱包状态异常，无法发送交易")
	}

	// 准备签名消息
	message := fmt.Sprintf("From: %s, To: %s, Value: %s, Data: %s", 
		wallet.WalletAddress, to, value, data)

	// 调用MPC服务进行签名
	session, err := s.mpcService.InitiateSigning(walletID, message, []string{wallet.UserID})
	if err != nil {
		return "", fmt.Errorf("MPC签名失败: %v", err)
	}

	// 检查签名状态
	if session.Status != "completed" || session.Signature == "" {
		return "", fmt.Errorf("MPC签名未完成: %s", session.Status)
	}

	// 这里应该调用区块链服务发送交易
	// 暂时返回模拟交易哈希
	txHash := fmt.Sprintf("0x%s_transaction_%d", walletID, time.Now().Unix())

	return txHash, nil
}

// GetWalletTransactions 获取钱包交易记录
func (s *WalletService) GetWalletTransactions(walletID string, limit, offset int) ([]map[string]interface{}, error) {
	if walletID == "" {
		return nil, ErrInvalidRequest
	}

	wallet, err := s.walletRepo.FindByID(walletID)
	if err != nil {
		return nil, err
	}

	// 这里应该调用区块链服务查询交易记录
	// 暂时返回模拟数据
	transactions := []map[string]interface{}{
		{
			"hash":        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			"from":        wallet.WalletAddress,
			"to":          "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
			"value":       "100000000000000000",
			"gasUsed":     "21000",
			"status":      "success",
			"timestamp":   time.Now().Add(-time.Hour).Unix(),
			"blockNumber": "12345678",
		},
		{
			"hash":        "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
			"from":        "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
			"to":          wallet.WalletAddress,
			"value":       "500000000000000000",
			"gasUsed":     "21000",
			"status":      "success",
			"timestamp":   time.Now().Add(-2 * time.Hour).Unix(),
			"blockNumber": "12345677",
		},
	}

	return transactions, nil
}