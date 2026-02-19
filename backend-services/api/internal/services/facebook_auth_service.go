package services

import (
	"backend-api/internal/config"
	"backend-api/internal/models"
	"backend-api/internal/repositories"
	"backend-api/internal/utils"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// FacebookAuthService Facebook认证服务
type FacebookAuthService struct {
	config     *config.Config
	userRepo   repositories.UserRepository
	mpcService *MPCService
}

// FacebookUserInfo Facebook用户信息
type FacebookUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture struct {
		Data struct {
			URL string `json:"url"`
		} `json:"data"`
	} `json:"picture"`
}

// FacebookTokenResponse Facebook令牌响应
type FacebookTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// FacebookAuthResponse Facebook认证响应
type FacebookAuthResponse struct {
	User        *models.User  `json:"user"`
	Wallet      *models.Wallet `json:"wallet,omitempty"`
	AccessToken string        `json:"access_token"`
	ExpiresIn   int64         `json:"expires_in"`
	IsNewUser   bool          `json:"is_new_user"`
}

// NewFacebookAuthService 创建Facebook认证服务实例
func NewFacebookAuthService(cfg *config.Config, userRepo repositories.UserRepository, mpcService *MPCService) *FacebookAuthService {
	return &FacebookAuthService{
		config:     cfg,
		userRepo:   userRepo,
		mpcService: mpcService,
	}
}

// GetFacebookAuthURL 获取Facebook认证URL
func (s *FacebookAuthService) GetFacebookAuthURL(state string) string {
	if s.config.Auth.Facebook.AppID == "" {
		return ""
	}

	params := url.Values{}
	params.Add("client_id", s.config.Auth.Facebook.AppID)
	params.Add("redirect_uri", s.config.Auth.Facebook.RedirectURI)
	params.Add("state", state)
	params.Add("scope", "email,public_profile")
	params.Add("response_type", "code")

	return fmt.Sprintf("https://www.facebook.com/v20.0/dialog/oauth?%s", params.Encode())
}

// HandleFacebookCallback 处理Facebook回调
func (s *FacebookAuthService) HandleFacebookCallback(code string) (*FacebookAuthResponse, error) {
	if code == "" {
		return nil, fmt.Errorf("authorization code is required")
	}

	// 1. 用授权码换取访问令牌
	token, err := s.exchangeCodeForToken(code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code for token: %v", err)
	}

	// 2. 获取Facebook用户信息
	fbUser, err := s.getUserInfo(token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %v", err)
	}

	// 3. 查找或创建用户
	user, isNewUser, err := s.FindOrCreateUser(fbUser)
	if err != nil {
		return nil, fmt.Errorf("failed to find or create user: %v", err)
	}

	// 4. 如果是新用户，创建MPC钱包
	var wallet *models.Wallet
	if isNewUser && user.MPCPublicKey == "" {
		wallet, err = s.createMPCWalletForUser(user)
		if err != nil {
			return nil, fmt.Errorf("failed to create MPC wallet: %v", err)
		}
	}

	// 5. 生成JWT令牌
	accessToken, err := utils.GenerateToken(user.ID, user.Username, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %v", err)
	}

	return &FacebookAuthResponse{
		User:        user,
		Wallet:      wallet,
		AccessToken: accessToken,
		ExpiresIn:   24 * 60 * 60, // 24小时
		IsNewUser:   isNewUser,
	}, nil
}

// exchangeCodeForToken 用授权码换取访问令牌
func (s *FacebookAuthService) exchangeCodeForToken(code string) (*FacebookTokenResponse, error) {
	params := url.Values{}
	params.Add("client_id", s.config.Auth.Facebook.AppID)
	params.Add("client_secret", s.config.Auth.Facebook.AppSecret)
	params.Add("redirect_uri", s.config.Auth.Facebook.RedirectURI)
	params.Add("code", code)

	url := fmt.Sprintf("https://graph.facebook.com/v20.0/oauth/access_token?%s", params.Encode())

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("facebook API error: %s - %s", resp.Status, string(body))
	}

	var tokenResp FacebookTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

// getUserInfo 获取Facebook用户信息
func (s *FacebookAuthService) getUserInfo(accessToken string) (*FacebookUserInfo, error) {
	params := url.Values{}
	params.Add("access_token", accessToken)
	params.Add("fields", "id,name,email,picture")

	url := fmt.Sprintf("https://graph.facebook.com/v20.0/me?%s", params.Encode())

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("facebook API error: %s - %s", resp.Status, string(body))
	}

	var fbUser FacebookUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&fbUser); err != nil {
		return nil, err
	}

	// 验证必要字段
	if fbUser.ID == "" {
		return nil, fmt.Errorf("facebook user ID is empty")
	}

	// 如果邮箱为空，生成一个默认邮箱
	if fbUser.Email == "" {
		fbUser.Email = fmt.Sprintf("%s@facebook.com", fbUser.ID)
	}

	return &fbUser, nil
}

// FindOrCreateUser 查找或创建用户（公开方法）
func (s *FacebookAuthService) FindOrCreateUser(fbUser *FacebookUserInfo) (*models.User, bool, error) {
	// 先尝试通过MetaUserID查找
	user, err := s.userRepo.FindByMetaUserID(fbUser.ID)
	if err == nil {
		return user, false, nil
	}

	// 如果找不到，尝试通过邮箱查找（防止重复注册）
	user, err = s.userRepo.FindByEmail(fbUser.Email)
	if err == nil {
		// 如果找到用户但没有MetaUserID，则更新
		if user.MetaUserID == "" {
			user.MetaUserID = fbUser.ID
			if err := s.userRepo.Update(user); err != nil {
				return nil, false, fmt.Errorf("failed to update user with MetaUserID: %v", err)
			}
		}
		return user, false, nil
	}

	// 创建新用户
	username := s.generateUsername(fbUser.Name, fbUser.Email)
	
	newUser := &models.User{
		ID:         utils.GenerateID(),
		Email:      fbUser.Email,
		Username:   username,
		MetaUserID: fbUser.ID,
		KYCStatus:  "pending",
		RiskLevel:  "medium",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return nil, false, fmt.Errorf("failed to create user: %v", err)
	}

	return newUser, true, nil
}

// createMPCWalletForUser 为用户创建MPC钱包
func (s *FacebookAuthService) createMPCWalletForUser(user *models.User) (*models.Wallet, error) {
	if s.mpcService == nil {
		return nil, fmt.Errorf("MPC service is not available")
	}

	// 生成钱包地址
	walletAddress, err := s.mpcService.GenerateWalletAddress(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate wallet address: %v", err)
	}

	// 更新用户的MPC公钥
	user.MPCPublicKey = walletAddress
	if err := s.userRepo.Update(user); err != nil {
		return nil, fmt.Errorf("failed to update user with MPC public key: %v", err)
	}

	wallet := &models.Wallet{
		ID:            utils.GenerateID(),
		UserID:        user.ID,
		WalletAddress: walletAddress,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	return wallet, nil
}

// generateUsername 生成唯一的用户名
func (s *FacebookAuthService) generateUsername(name, email string) string {
	// 从姓名中提取用户名
	username := strings.ToLower(strings.ReplaceAll(name, " ", "_"))
	username = strings.ReplaceAll(username, "[^a-z0-9_]", "")
	
	// 如果用户名太长，截断
	if len(username) > 20 {
		username = username[:20]
	}
	
	// 检查用户名是否已存在，如果存在则添加数字后缀
	baseUsername := username
	counter := 1
	for {
		_, err := s.userRepo.FindByUsername(username)
		if err != nil {
			break // 用户名可用
		}
		username = fmt.Sprintf("%s%d", baseUsername, counter)
		counter++
		
		// 防止无限循环
		if counter > 100 {
			// 使用邮箱前缀作为备选
			emailParts := strings.Split(email, "@")
			username = emailParts[0] + fmt.Sprintf("%d", time.Now().Unix()%10000)
			break
		}
	}
	
	return username
}

// ValidateFacebookToken 验证Facebook访问令牌
func (s *FacebookAuthService) ValidateFacebookToken(accessToken string) (*FacebookUserInfo, error) {
	params := url.Values{}
	params.Add("access_token", accessToken)
	params.Add("fields", "id,name,email")

	url := fmt.Sprintf("https://graph.facebook.com/v20.0/me?%s", params.Encode())

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid facebook token")
	}

	var fbUser FacebookUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&fbUser); err != nil {
		return nil, err
	}

	return &fbUser, nil
}

// Facebook认证错误定义
var (
	ErrFacebookAuthDisabled = fmt.Errorf("facebook authentication is not configured")
	ErrInvalidFacebookCode  = fmt.Errorf("invalid facebook authorization code")
	ErrFacebookUserNotFound = fmt.Errorf("facebook user not found")
)