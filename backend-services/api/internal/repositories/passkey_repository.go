package repositories

import (
	"backend-api/internal/models"
	"backend-api/internal/database"
	"errors"

	"gorm.io/gorm"
)

// PasskeyRepository Passkey存储库接口
type PasskeyRepository interface {
	Create(passkey *models.Passkey) error
	FindByID(id string) (*models.Passkey, error)
	FindByUserID(userID string) ([]*models.Passkey, error)
	FindByCredentialID(credentialID string) (*models.Passkey, error)
	Update(passkey *models.Passkey) error
	Delete(id string) error
}

// postgresPasskeyRepository PostgreSQL Passkey存储库实现
type postgresPasskeyRepository struct {
	db *gorm.DB
}

// NewPostgresPasskeyRepository 创建PostgreSQL Passkey存储库实例
func NewPostgresPasskeyRepository() PasskeyRepository {
	return &postgresPasskeyRepository{
		db: database.GetDB(),
	}
}

// Create 创建Passkey
func (r *postgresPasskeyRepository) Create(passkey *models.Passkey) error {
	if passkey.ID == "" {
		return ErrInvalidID
	}

	// 检查凭证ID是否已存在
	var count int64
	if err := r.db.Model(&models.Passkey{}).Where("credential_id = ?", passkey.CredentialID).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return ErrCredentialExists
	}

	return r.db.Create(passkey).Error
}

// FindByID 根据ID查找Passkey
func (r *postgresPasskeyRepository) FindByID(id string) (*models.Passkey, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	var passkey models.Passkey
	err := r.db.First(&passkey, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPasskeyNotFound
		}
		return nil, err
	}

	return &passkey, nil
}

// FindByUserID 根据用户ID查找所有Passkey
func (r *postgresPasskeyRepository) FindByUserID(userID string) ([]*models.Passkey, error) {
	if userID == "" {
		return nil, ErrInvalidUserID
	}

	var passkeys []*models.Passkey
	err := r.db.Where("user_id = ?", userID).Find(&passkeys).Error
	if err != nil {
		return nil, err
	}

	return passkeys, nil
}

// FindByCredentialID 根据凭证ID查找Passkey
func (r *postgresPasskeyRepository) FindByCredentialID(credentialID string) (*models.Passkey, error) {
	if credentialID == "" {
		return nil, ErrInvalidCredentialID
	}

	var passkey models.Passkey
	err := r.db.First(&passkey, "credential_id = ?", credentialID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPasskeyNotFound
		}
		return nil, err
	}

	return &passkey, nil
}

// Update 更新Passkey
func (r *postgresPasskeyRepository) Update(passkey *models.Passkey) error {
	if passkey.ID == "" {
		return ErrInvalidID
	}

	// 检查Passkey是否存在
	var existing models.Passkey
	err := r.db.First(&existing, "id = ?", passkey.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPasskeyNotFound
		}
		return err
	}

	// 如果凭证ID已更改，检查新凭证ID是否已存在
	if existing.CredentialID != passkey.CredentialID {
		var count int64
		if err := r.db.Model(&models.Passkey{}).Where("credential_id = ? AND id != ?", passkey.CredentialID, passkey.ID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return ErrCredentialExists
		}
	}

	return r.db.Save(passkey).Error
}

// Delete 删除Passkey
func (r *postgresPasskeyRepository) Delete(id string) error {
	if id == "" {
		return ErrInvalidID
	}

	// 检查Passkey是否存在
	var passkey models.Passkey
	err := r.db.First(&passkey, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPasskeyNotFound
		}
		return err
	}

	return r.db.Delete(&passkey).Error
}

// 错误定义
var (
	ErrPasskeyNotFound     = errors.New("passkey not found")
	ErrCredentialExists    = errors.New("credential already exists")
	ErrPasskeyInvalidUserID = errors.New("invalid user ID")
	ErrInvalidCredentialID = errors.New("invalid credential ID")
)