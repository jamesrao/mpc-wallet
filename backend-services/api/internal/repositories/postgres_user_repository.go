package repositories

import (
	"backend-api/internal/database"
	"backend-api/internal/models"
	"errors"

	"gorm.io/gorm"
)

// postgresUserRepository PostgreSQL用户存储库实现
type postgresUserRepository struct {
	db *gorm.DB
}

// NewPostgresUserRepository 创建PostgreSQL用户存储库实例
func NewPostgresUserRepository() UserRepository {
	return &postgresUserRepository{
		db: database.GetDB(),
	}
}

// Create 创建用户
func (r *postgresUserRepository) Create(user *models.User) error {
	if user.ID == "" {
		return ErrInvalidID
	}

	// 检查用户名是否已存在
	var count int64
	if err := r.db.Model(&models.User{}).Where("username = ?", user.Username).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return ErrUserExists
	}

	// 检查邮箱是否已存在
	if err := r.db.Model(&models.User{}).Where("email = ?", user.Email).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return ErrUserExists
	}

	return r.db.Create(user).Error
}

// FindByID 根据ID查找用户
func (r *postgresUserRepository) FindByID(id string) (*models.User, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByUsername 根据用户名查找用户
func (r *postgresUserRepository) FindByUsername(username string) (*models.User, error) {
	if username == "" {
		return nil, ErrInvalidUsername
	}

	var user models.User
	err := r.db.First(&user, "username = ?", username).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByEmail 根据邮箱查找用户
func (r *postgresUserRepository) FindByEmail(email string) (*models.User, error) {
	if email == "" {
		return nil, ErrInvalidEmail
	}

	var user models.User
	err := r.db.First(&user, "email = ?", email).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByMetaUserID 根据MetaUserID查找用户
func (r *postgresUserRepository) FindByMetaUserID(metaUserID string) (*models.User, error) {
	if metaUserID == "" {
		return nil, ErrInvalidMetaUserID
	}

	var user models.User
	err := r.db.First(&user, "meta_user_id = ?", metaUserID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Update 更新用户
func (r *postgresUserRepository) Update(user *models.User) error {
	if user.ID == "" {
		return ErrInvalidID
	}

	// 检查用户是否存在
	var existing models.User
	err := r.db.First(&existing, "id = ?", user.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	// 如果用户名已更改，检查新用户名是否已存在
	if existing.Username != user.Username {
		var count int64
		if err := r.db.Model(&models.User{}).Where("username = ? AND id != ?", user.Username, user.ID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return ErrUserExists
		}
	}

	// 如果邮箱已更改，检查新邮箱是否已存在
	if existing.Email != user.Email {
		var count int64
		if err := r.db.Model(&models.User{}).Where("email = ? AND id != ?", user.Email, user.ID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return ErrUserExists
		}
	}

	return r.db.Save(user).Error
}

// Delete 删除用户（软删除）
func (r *postgresUserRepository) Delete(id string) error {
	if id == "" {
		return ErrInvalidID
	}

	// 检查用户是否存在
	var user models.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	// 软删除：设置deleted_at
	return r.db.Model(&user).Update("deleted_at", gorm.Expr("CURRENT_TIMESTAMP")).Error
}