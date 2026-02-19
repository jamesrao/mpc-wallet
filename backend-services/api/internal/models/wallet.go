package models

import (
	"time"
)

// Wallet 钱包模型
type Wallet struct {
	ID              string    `gorm:"column:id;type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID          string    `gorm:"column:user_id;type:uuid;index;not null" json:"user_id"`
	OrganizationID  *string   `gorm:"column:organization_id;type:uuid;index" json:"organization_id,omitempty"`
	Name            string    `gorm:"column:name;type:varchar(255)" json:"name"` // 钱包显示名称
	WalletAddress   string    `gorm:"column:wallet_address;type:varchar(255);not null" json:"wallet_address"`
	ChainType       string    `gorm:"column:chain_type;type:varchar(50);not null" json:"chain_type"`
	WalletType      string    `gorm:"column:wallet_type;type:varchar(50);not null;default:mpc" json:"wallet_type"`
	Threshold       int       `gorm:"column:threshold;type:integer" json:"threshold"`
	TotalShares     int       `gorm:"column:total_shares;type:integer" json:"total_shares"`
	Status          string    `gorm:"column:status;type:varchar(50);default:active" json:"status"`
	CreatedAt       time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// TableName 指定表名
func (Wallet) TableName() string {
	return "wallets"
}

// CreateWalletRequest 创建钱包请求
type CreateWalletRequest struct {
	UserID      string `json:"user_id" validate:"required"`
	Name        string `json:"name" validate:"required,min=1,max=100"`
	ChainType   string `json:"chain_type" validate:"required,oneof=ethereum polygon bsc"`
	Threshold   int    `json:"threshold" validate:"required,min=2,max=10"`
	TotalShares int    `json:"total_shares" validate:"required,min=threshold,max=10"`
}

// WalletBalance 钱包余额
type WalletBalance struct {
	WalletID string `json:"wallet_id"`
	Balance  string `json:"balance"` // 字符串表示，避免精度问题
	Token    string `json:"token"`   // 代币地址，空字符串表示原生代币
	Chain    string `json:"chain"`
}