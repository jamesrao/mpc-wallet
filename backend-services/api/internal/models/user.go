package models

import (
	"time"
)

// User 用户模型
type User struct {
	ID           string     `gorm:"column:id;type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email        string     `gorm:"column:email;type:varchar(255);uniqueIndex;not null" json:"email"`
	Username     string     `gorm:"column:username;type:varchar(100);uniqueIndex" json:"username"`
	PasswordHash string     `gorm:"column:password_hash;type:varchar(255)" json:"-"`
	MPCPublicKey string     `gorm:"column:mpc_public_key;type:text" json:"mpc_public_key"`
	MetaUserID   string     `gorm:"column:meta_user_id;type:varchar(255)" json:"meta_user_id"`
	KYCStatus    string     `gorm:"column:kyc_status;type:varchar(50);default:pending" json:"kyc_status"`
	RiskLevel    string     `gorm:"column:risk_level;type:varchar(50);default:medium" json:"risk_level"`
	PasskeyEnabled bool     `gorm:"column:passkey_enabled;type:boolean;default:false" json:"passkey_enabled"`
	CreatedAt    time.Time  `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt    *time.Time `gorm:"column:deleted_at;type:timestamp with time zone;index" json:"deleted_at,omitempty"`
	
	Passkeys     []Passkey  `gorm:"foreignKey:UserID" json:"passkeys,omitempty"`
}

// Passkey Passkey凭证模型
type Passkey struct {
	ID          string    `gorm:"column:id;type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID      string    `gorm:"column:user_id;type:uuid;not null;index" json:"user_id"`
	CredentialID string   `gorm:"column:credential_id;type:text;uniqueIndex;not null" json:"credential_id"`
	PublicKey   []byte    `gorm:"column:public_key;type:bytea;not null" json:"public_key"`
	Counter     uint32    `gorm:"column:counter;type:integer;default:0" json:"counter"`
	DeviceName  string    `gorm:"column:device_name;type:varchar(255)" json:"device_name"`
	CreatedAt   time.Time `gorm:"column:created_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;type:timestamp with time zone;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// TableName 指定Passkey表名
func (Passkey) TableName() string {
	return "passkeys"
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// UpdateUserRequest 更新用户请求
type UpdateUserRequest struct {
	Username string `json:"username" validate:"omitempty,min=3,max=50"`
	Email    string `json:"email" validate:"omitempty,email"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	User        *User  `json:"user"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}