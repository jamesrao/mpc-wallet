package utils

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// TokenConfig 令牌配置
type TokenConfig struct {
	SecretKey     string
	ExpireHours   int
}

// DefaultTokenConfig 默认令牌配置
var DefaultTokenConfig = &TokenConfig{
	SecretKey:   "default-secret-key-change-in-production",
	ExpireHours: 24,
}

// TokenClaims 令牌声明
type TokenClaims struct {
	UserID   string `json:"uid"`
	Username string `json:"un"`
	IssuedAt int64  `json:"iat"`
	ExpiresAt int64 `json:"exp"`
}

// GenerateTokenSecret 生成随机的令牌密钥
func GenerateTokenSecret() (string, error) {
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(key), nil
}

// GenerateToken 生成简单令牌
func GenerateToken(userID, username string, config *TokenConfig) (string, error) {
	if config == nil {
		config = DefaultTokenConfig
	}

	// 如果密钥为空，生成一个随机密钥
	if config.SecretKey == "" || config.SecretKey == "default-secret-key-change-in-production" {
		secret, err := GenerateTokenSecret()
		if err != nil {
			return "", err
		}
		config.SecretKey = secret
	}

	now := time.Now()
	expiresAt := now.Add(time.Duration(config.ExpireHours) * time.Hour)

	claims := &TokenClaims{
		UserID:   userID,
		Username: username,
		IssuedAt: now.Unix(),
		ExpiresAt: expiresAt.Unix(),
	}

	// 序列化声明
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	// 编码声明部分
	encodedClaims := base64.URLEncoding.EncodeToString(claimsJSON)

	// 创建签名
	h := hmac.New(sha256.New, []byte(config.SecretKey))
	h.Write([]byte(encodedClaims))
	signature := base64.URLEncoding.EncodeToString(h.Sum(nil))

	// 组合令牌: claims.signature
	token := fmt.Sprintf("%s.%s", encodedClaims, signature)

	return token, nil
}

// ValidateToken 验证令牌
func ValidateToken(tokenString string, config *TokenConfig) (*TokenClaims, error) {
	if config == nil {
		config = DefaultTokenConfig
	}

	// 分割令牌
	parts := strings.Split(tokenString, ".")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid token format")
	}

	encodedClaims := parts[0]
	expectedSignature := parts[1]

	// 验证签名
	h := hmac.New(sha256.New, []byte(config.SecretKey))
	h.Write([]byte(encodedClaims))
	actualSignature := base64.URLEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(expectedSignature), []byte(actualSignature)) {
		return nil, fmt.Errorf("invalid signature")
	}

	// 解码声明
	claimsJSON, err := base64.URLEncoding.DecodeString(encodedClaims)
	if err != nil {
		return nil, fmt.Errorf("failed to decode claims: %v", err)
	}

	var claims TokenClaims
	err = json.Unmarshal(claimsJSON, &claims)
	if err != nil {
		return nil, fmt.Errorf("failed to parse claims: %v", err)
	}

	// 检查过期时间
	if time.Now().Unix() > claims.ExpiresAt {
		return nil, fmt.Errorf("token expired")
	}

	return &claims, nil
}