package services

import (
	"backend-api/internal/config"
	"backend-api/internal/models"
	"backend-api/internal/repositories"
	"backend-api/internal/utils"
	"fmt"
	"time"
)

// UserService 用户服务
type UserService struct {
	userRepo repositories.UserRepository
	config   *config.Config
}

// NewUserService 创建用户服务实例
func NewUserService(userRepo repositories.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// NewUserServiceWithConfig 创建带配置的用户服务实例
func NewUserServiceWithConfig(userRepo repositories.UserRepository, cfg *config.Config) *UserService {
	return &UserService{
		userRepo: userRepo,
		config:   cfg,
	}
}



// CreateUser 创建用户
func (s *UserService) CreateUser(req models.CreateUserRequest) (*models.User, error) {
	// 验证请求
	if req.Username == "" || req.Email == "" || req.Password == "" {
		return nil, ErrInvalidRequest
	}
	
	// 检查用户名是否已存在
	if _, err := s.userRepo.FindByUsername(req.Username); err == nil {
		return nil, ErrUserExists
	}
	
	// 检查邮箱是否已存在
	if _, err := s.userRepo.FindByEmail(req.Email); err == nil {
		return nil, ErrEmailExists
	}
	
	// 哈希密码
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}
	
	// 创建用户
	user := &models.User{
		ID:           utils.GenerateID(),
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: passwordHash,
	}
	
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	
	return user, nil
}

// GetUser 获取用户信息
func (s *UserService) GetUser(id string) (*models.User, error) {
	if id == "" {
		return nil, ErrInvalidRequest
	}
	
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	
	return user, nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(id string, req models.UpdateUserRequest) (*models.User, error) {
	if id == "" {
		return nil, ErrInvalidRequest
	}
	
	// 获取现有用户
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	
	// 更新字段
	if req.Username != "" {
		// 检查新用户名是否已存在（如果不是当前用户名）
		if req.Username != user.Username {
			if _, err := s.userRepo.FindByUsername(req.Username); err == nil {
				return nil, ErrUserExists
			}
			user.Username = req.Username
		}
	}
	
	if req.Email != "" {
		user.Email = req.Email
	}
	
	user.UpdatedAt = time.Now()
	
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	
	return user, nil
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(id string) error {
	if id == "" {
		return ErrInvalidRequest
	}
	
	return s.userRepo.Delete(id)
}

// Login 用户登录
func (s *UserService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	// 验证请求
	if req.Username == "" || req.Password == "" {
		return nil, ErrInvalidRequest
	}
	
	// 查找用户（通过用户名或邮箱）
	var user *models.User
	var err error
	
	// 先尝试用户名查找
	user, err = s.userRepo.FindByUsername(req.Username)
	if err != nil {
		// 再尝试邮箱查找
		user, err = s.userRepo.FindByEmail(req.Username)
		if err != nil {
			return nil, ErrInvalidCredentials
		}
	}
	
	// 验证密码
	valid, err := utils.VerifyPassword(req.Password, user.PasswordHash)
	if err != nil {
		return nil, fmt.Errorf("failed to verify password: %v", err)
	}
	
	if !valid {
		return nil, ErrInvalidCredentials
	}
	
	// 生成令牌
	token, err := utils.GenerateToken(user.ID, user.Username, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %v", err)
	}
	
	// 创建登录响应
	response := &models.LoginResponse{
		User:        user,
		AccessToken: token,
		ExpiresIn:   24 * 60 * 60, // 24小时
	}
	
	return response, nil
}

// AuthenticateToken 验证JWT令牌
func (s *UserService) AuthenticateToken(tokenString string) (*models.User, error) {
	claims, err := utils.ValidateToken(tokenString, nil)
	if err != nil {
		return nil, err
	}
	
	// 查找用户
	user, err := s.userRepo.FindByID(claims.UserID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	
	return user, nil
}

// 错误定义
var (
	ErrInvalidRequest = fmt.Errorf("invalid request")
	ErrUserExists     = fmt.Errorf("user already exists")
	ErrEmailExists    = fmt.Errorf("email already exists")
	ErrUserNotFound   = fmt.Errorf("user not found")
	ErrInvalidCredentials = fmt.Errorf("invalid credentials")
)