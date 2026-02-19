package config

import (
	"fmt"
	"os"
)

// Config 配置结构
type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
	MPC      MPCConfig      `yaml:"mpc"`
	Chain    ChainConfig    `yaml:"chain"`
	Auth     AuthConfig     `yaml:"auth"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Address string `yaml:"address"`
	Port    int    `yaml:"port"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	Name     string `yaml:"name"`
	SSLMode  string `yaml:"ssl_mode"`
}

// MPCConfig MPC服务配置
type MPCConfig struct {
	ServiceURL string `yaml:"service_url"`
}

// ChainConfig 区块链中间件配置
type ChainConfig struct {
	MiddlewareURL string `yaml:"middleware_url"`
}

// AuthConfig 认证配置
type AuthConfig struct {
	Facebook FacebookAuthConfig `yaml:"facebook"`
}

// FacebookAuthConfig Facebook认证配置
type FacebookAuthConfig struct {
	AppID       string `yaml:"app_id"`
	AppSecret   string `yaml:"app_secret"`
	RedirectURI string `yaml:"redirect_uri"`
}

// LoadConfig 加载配置
func LoadConfig() (*Config, error) {
	return &Config{
		Server: ServerConfig{
			Address: getEnv("SERVER_ADDRESS", "0.0.0.0"),
			Port:    getEnvAsInt("SERVER_PORT", 3000),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "postgres"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "mpc_user"),
			Password: getEnv("DB_PASSWORD", "mpc_password"),
			Name:     getEnv("DB_NAME", "mpc_wallet"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		MPC: MPCConfig{
			ServiceURL: getEnv("MPC_SERVICE_URL", "http://mpc-core:8080"),
		},
		Chain: ChainConfig{
			MiddlewareURL: getEnv("BLOCKCHAIN_MIDDLEWARE_URL", "http://blockchain-middleware:8081"),
		},
		Auth: AuthConfig{
			Facebook: FacebookAuthConfig{
				AppID:       getEnv("FACEBOOK_APP_ID", ""),
				AppSecret:   getEnv("FACEBOOK_APP_SECRET", ""),
				RedirectURI: getEnv("FACEBOOK_REDIRECT_URI", "http://localhost:3000/api/auth/facebook/callback"),
			},
		},
	}, nil
}

// GetServerAddress 获取服务器地址
func (c *Config) GetServerAddress() string {
	return fmt.Sprintf("%s:%d", c.Server.Address, c.Server.Port)
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt 获取环境变量作为整数
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		var result int
		_, err := fmt.Sscanf(value, "%d", &result)
		if err == nil {
			return result
		}
	}
	return defaultValue
}