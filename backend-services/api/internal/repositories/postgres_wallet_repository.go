package repositories

import (
	"backend-api/internal/database"
	"backend-api/internal/models"
	"errors"

	"gorm.io/gorm"
)

// postgresWalletRepository PostgreSQL钱包存储库实现
type postgresWalletRepository struct {
	db *gorm.DB
}

// NewPostgresWalletRepository 创建PostgreSQL钱包存储库实例
func NewPostgresWalletRepository() WalletRepository {
	return &postgresWalletRepository{
		db: database.GetDB(),
	}
}

// Create 创建钱包
func (r *postgresWalletRepository) Create(wallet *models.Wallet) error {
	if wallet.ID == "" {
		return ErrInvalidID
	}

	// 检查钱包地址是否已存在（同一链类型）
	var count int64
	if err := r.db.Model(&models.Wallet{}).
		Where("wallet_address = ? AND chain_type = ?", wallet.WalletAddress, wallet.ChainType).
		Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("wallet address already exists for this chain type")
	}

	return r.db.Create(wallet).Error
}

// FindByID 根据ID查找钱包
func (r *postgresWalletRepository) FindByID(id string) (*models.Wallet, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	var wallet models.Wallet
	err := r.db.First(&wallet, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrWalletNotFound
		}
		return nil, err
	}

	return &wallet, nil
}

// FindByUserID 根据用户ID查找钱包
func (r *postgresWalletRepository) FindByUserID(userID string) ([]*models.Wallet, error) {
	if userID == "" {
		return nil, ErrInvalidUserID
	}

	var wallets []*models.Wallet
	err := r.db.Where("user_id = ?", userID).Find(&wallets).Error
	if err != nil {
		return nil, err
	}

	return wallets, nil
}

// Update 更新钱包
func (r *postgresWalletRepository) Update(wallet *models.Wallet) error {
	if wallet.ID == "" {
		return ErrInvalidID
	}

	// 检查钱包是否存在
	var existing models.Wallet
	err := r.db.First(&existing, "id = ?", wallet.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWalletNotFound
		}
		return err
	}

	return r.db.Save(wallet).Error
}

// Delete 删除钱包
func (r *postgresWalletRepository) Delete(id string) error {
	if id == "" {
		return ErrInvalidID
	}

	// 检查钱包是否存在
	var wallet models.Wallet
	err := r.db.First(&wallet, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWalletNotFound
		}
		return err
	}

	return r.db.Delete(&wallet).Error
}

// UpdateStatus 更新钱包状态
func (r *postgresWalletRepository) UpdateStatus(id string, status string) error {
	if id == "" {
		return ErrInvalidID
	}

	var wallet models.Wallet
	err := r.db.First(&wallet, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWalletNotFound
		}
		return err
	}

	wallet.Status = status
	return r.db.Save(&wallet).Error
}