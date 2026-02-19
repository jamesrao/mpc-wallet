package config

import (
	"fmt"
	"os"
)

// Config 配置结构
type Config struct {
	Server   ServerConfig   `yaml:"server"`
	Chains   ChainsConfig   `yaml:"chains"`
	Database DatabaseConfig `yaml:"database"`
	Cache    CacheConfig    `yaml:"cache"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Address string `yaml:"address"`
	Port    int    `yaml:"port"`
}

// ChainsConfig 区块链配置
type ChainsConfig struct {
	Ethereum ChainConfig `yaml:"ethereum"`
	Polygon  ChainConfig `yaml:"polygon"`
	BSC      ChainConfig `yaml:"bsc"`
	Bitcoin  ChainConfig `yaml:"bitcoin"`
}

// ChainConfig 单个链配置
type ChainConfig struct {
	Enabled      bool   `yaml:"enabled"`
	RPCURL       string `yaml:"rpc_url"`
	ChainID      int64  `yaml:"chain_id"`
	NetworkName  string `yaml:"network_name"`
	WsURL        string `yaml:"ws_url"`
	ExplorerURL  string `yaml:"explorer_url"`
	PrivateKey   string `yaml:"private_key"` // 仅用于测试环境
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

// CacheConfig 缓存配置
type CacheConfig struct {
	RedisURL string `yaml:"redis_url"`
}

// LoadConfig 加载配置
func LoadConfig() (*Config, error) {
	// 从环境变量或配置文件加载
	// 这里返回默认配置
	return &Config{
		Server: ServerConfig{
			Address: "0.0.0.0",
			Port:    8082,
		},
		Chains: ChainsConfig{
			Ethereum: ChainConfig{
				Enabled:     true,
				RPCURL:      getEnv("ETHEREUM_RPC_URL", "http://localhost:8545"),
				ChainID:     1,
				NetworkName: "mainnet",
				WsURL:       getEnv("ETHEREUM_WS_URL", "ws://localhost:8546"),
				ExplorerURL: "https://etherscan.io",
			},
			Polygon: ChainConfig{
				Enabled:     true,
				RPCURL:      getEnv("POLYGON_RPC_URL", "https://polygon-rpc.com"),
				ChainID:     137,
				NetworkName: "polygon",
				WsURL:       getEnv("POLYGON_WS_URL", "wss://polygon-rpc.com"),
				ExplorerURL: "https://polygonscan.com",
			},
			BSC: ChainConfig{
				Enabled:     true,
				RPCURL:      getEnv("BSC_RPC_URL", "https://bsc-dataseed.binance.org"),
				ChainID:     56,
				NetworkName: "bsc",
				WsURL:       getEnv("BSC_WS_URL", "wss://bsc-ws-node.nariox.org"),
				ExplorerURL: "https://bscscan.com",
			},
			Bitcoin: ChainConfig{
				Enabled:     false,
				RPCURL:      getEnv("BITCOIN_RPC_URL", "http://localhost:8332"),
				ChainID:     0,
				NetworkName: "bitcoin",
			},
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     5432,
			User:     getEnv("DB_USER", "mpc_user"),
			Password: getEnv("DB_PASSWORD", "mpc_password"),
			Name:     getEnv("DB_NAME", "mpc_wallet"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Cache: CacheConfig{
			RedisURL: getEnv("REDIS_URL", "redis://localhost:6379"),
		},
	}, nil
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetServerAddress 获取服务器地址
func (c *Config) GetServerAddress() string {
	return fmt.Sprintf("%s:%d", c.Server.Address, c.Server.Port)
}