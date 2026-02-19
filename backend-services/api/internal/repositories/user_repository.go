package repositories

import (
	"backend-api/internal/models"
	"errors"
	"sync"
	"time"
)

// UserRepository 用户存储库接口
type UserRepository interface {
	Create(user *models.User) error
	FindByID(id string) (*models.User, error)
	FindByUsername(username string) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByMetaUserID(metaUserID string) (*models.User, error)
	Update(user *models.User) error
	Delete(id string) error
}

// memoryUserRepository 内存用户存储库实现
type memoryUserRepository struct {
	users sync.Map // key: user.ID, value: *models.User
}

// NewMemoryUserRepository 创建内存用户存储库实例
func NewMemoryUserRepository() UserRepository {
	return &memoryUserRepository{}
}

// Create 创建用户
func (r *memoryUserRepository) Create(user *models.User) error {
	if user.ID == "" {
		return ErrInvalidID
	}
	
	// 检查用户名是否已存在
	if _, err := r.FindByUsername(user.Username); err == nil {
		return ErrUserExists
	}
	
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	
	r.users.Store(user.ID, user)
	return nil
}

// FindByID 根据ID查找用户
func (r *memoryUserRepository) FindByID(id string) (*models.User, error) {
	if id == "" {
		return nil, ErrInvalidID
	}
	
	val, ok := r.users.Load(id)
	if !ok {
		return nil, ErrUserNotFound
	}
	
	user, ok := val.(*models.User)
	if !ok {
		return nil, ErrInvalidData
	}
	
	return user, nil
}

// FindByUsername 根据用户名查找用户
func (r *memoryUserRepository) FindByUsername(username string) (*models.User, error) {
	if username == "" {
		return nil, ErrInvalidUsername
	}
	
	var foundUser *models.User
	r.users.Range(func(_, value interface{}) bool {
		user, ok := value.(*models.User)
		if ok && user.Username == username {
			foundUser = user
			return false
		}
		return true
	})
	
	if foundUser == nil {
		return nil, ErrUserNotFound
	}
	
	return foundUser, nil
}

// FindByEmail 根据邮箱查找用户
func (r *memoryUserRepository) FindByEmail(email string) (*models.User, error) {
	if email == "" {
		return nil, ErrInvalidEmail
	}
	
	var foundUser *models.User
	r.users.Range(func(_, value interface{}) bool {
		user, ok := value.(*models.User)
		if ok && user.Email == email {
			foundUser = user
			return false
		}
		return true
	})
	
	if foundUser == nil {
		return nil, ErrUserNotFound
	}
	
	return foundUser, nil
}

// FindByMetaUserID 根据MetaUserID查找用户
func (r *memoryUserRepository) FindByMetaUserID(metaUserID string) (*models.User, error) {
	if metaUserID == "" {
		return nil, ErrInvalidMetaUserID
	}
	
	var foundUser *models.User
	r.users.Range(func(_, value interface{}) bool {
		user, ok := value.(*models.User)
		if ok && user.MetaUserID == metaUserID {
			foundUser = user
			return false
		}
		return true
	})
	
	if foundUser == nil {
		return nil, ErrUserNotFound
	}
	
	return foundUser, nil
}

// Update 更新用户
func (r *memoryUserRepository) Update(user *models.User) error {
	if user.ID == "" {
		return ErrInvalidID
	}
	
	// 检查用户是否存在
	existing, err := r.FindByID(user.ID)
	if err != nil {
		return err
	}
	
	// 如果用户名已更改，检查新用户名是否已存在
	if existing.Username != user.Username {
		if _, err := r.FindByUsername(user.Username); err == nil {
			return ErrUserExists
		}
	}
	
	user.UpdatedAt = time.Now()
	r.users.Store(user.ID, user)
	return nil
}

// Delete 删除用户
func (r *memoryUserRepository) Delete(id string) error {
	if id == "" {
		return ErrInvalidID
	}
	
	if _, err := r.FindByID(id); err != nil {
		return err
	}
	
	r.users.Delete(id)
	return nil
}

// 错误定义
var (
	ErrUserNotFound     = errors.New("user not found")
	ErrUserExists       = errors.New("user already exists")
	ErrInvalidID        = errors.New("invalid user ID")
	ErrInvalidUsername  = errors.New("invalid username")
	ErrInvalidEmail     = errors.New("invalid email")
	ErrInvalidMetaUserID = errors.New("invalid meta user ID")
	ErrInvalidData      = errors.New("invalid data")
)