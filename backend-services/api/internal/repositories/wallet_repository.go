package repositories

import (
	"backend-api/internal/models"
	"errors"
	"sync"
	"time"
)

// WalletRepository 钱包存储库接口
type WalletRepository interface {
	Create(wallet *models.Wallet) error
	FindByID(id string) (*models.Wallet, error)
	FindByUserID(userID string) ([]*models.Wallet, error)
	Update(wallet *models.Wallet) error
	Delete(id string) error
	UpdateStatus(id string, status string) error
}

// memoryWalletRepository 内存钱包存储库实现
type memoryWalletRepository struct {
	wallets sync.Map // key: wallet.ID, value: *models.Wallet
}

// NewMemoryWalletRepository 创建内存钱包存储库实例
func NewMemoryWalletRepository() WalletRepository {
	return &memoryWalletRepository{}
}

// Create 创建钱包
func (r *memoryWalletRepository) Create(wallet *models.Wallet) error {
	if wallet.ID == "" {
		return ErrInvalidID
	}
	
	now := time.Now()
	wallet.CreatedAt = now
	wallet.UpdatedAt = now
	
	r.wallets.Store(wallet.ID, wallet)
	return nil
}

// FindByID 根据ID查找钱包
func (r *memoryWalletRepository) FindByID(id string) (*models.Wallet, error) {
	if id == "" {
		return nil, ErrInvalidID
	}
	
	val, ok := r.wallets.Load(id)
	if !ok {
		return nil, ErrWalletNotFound
	}
	
	wallet, ok := val.(*models.Wallet)
	if !ok {
		return nil, ErrInvalidData
	}
	
	return wallet, nil
}

// FindByUserID 根据用户ID查找钱包
func (r *memoryWalletRepository) FindByUserID(userID string) ([]*models.Wallet, error) {
	if userID == "" {
		return nil, ErrInvalidUserID
	}
	
	var wallets []*models.Wallet
	r.wallets.Range(func(_, value interface{}) bool {
		wallet, ok := value.(*models.Wallet)
		if ok && wallet.UserID == userID {
			wallets = append(wallets, wallet)
		}
		return true
	})
	
	return wallets, nil
}

// Update 更新钱包
func (r *memoryWalletRepository) Update(wallet *models.Wallet) error {
	if wallet.ID == "" {
		return ErrInvalidID
	}
	
	// 检查钱包是否存在
	if _, err := r.FindByID(wallet.ID); err != nil {
		return err
	}
	
	wallet.UpdatedAt = time.Now()
	r.wallets.Store(wallet.ID, wallet)
	return nil
}

// Delete 删除钱包
func (r *memoryWalletRepository) Delete(id string) error {
	if id == "" {
		return ErrInvalidID
	}
	
	if _, err := r.FindByID(id); err != nil {
		return err
	}
	
	r.wallets.Delete(id)
	return nil
}

// UpdateStatus 更新钱包状态
func (r *memoryWalletRepository) UpdateStatus(id string, status string) error {
	if id == "" {
		return ErrInvalidID
	}
	
	val, ok := r.wallets.Load(id)
	if !ok {
		return ErrWalletNotFound
	}
	
	wallet, ok := val.(*models.Wallet)
	if !ok {
		return ErrInvalidData
	}
	
	wallet.Status = status
	wallet.UpdatedAt = time.Now()
	r.wallets.Store(id, wallet)
	return nil
}

// 错误定义
var (
	ErrWalletNotFound = errors.New("wallet not found")
	ErrInvalidUserID  = errors.New("invalid user ID")
)