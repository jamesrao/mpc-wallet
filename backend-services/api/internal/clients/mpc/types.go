package mpc

import (
	"encoding/json"
	"fmt"
)

// CurveType 曲线类型
type CurveType string

const (
	// CurveTypeSecp256k1 secp256k1 (以太坊、比特币)
	CurveTypeSecp256k1 CurveType = "Secp256k1"
	// CurveTypeEd25519 ed25519
	CurveTypeEd25519 CurveType = "Ed25519"
	// CurveTypeP256 P-256
	CurveTypeP256 CurveType = "P256"
)

// ProtocolType 协议类型
type ProtocolType string

const (
	// ProtocolTypeGg18 GG18协议
	ProtocolTypeGg18 ProtocolType = "Gg18"
	// ProtocolTypeGg20 GG20协议
	ProtocolTypeGg20 ProtocolType = "Gg20"
	// ProtocolTypeCustom 自定义协议
	ProtocolTypeCustom ProtocolType = "Custom"
)

// SessionStatus 会话状态
type SessionStatus string

const (
	// SessionStatusCreated 已创建
	SessionStatusCreated SessionStatus = "Created"
	// SessionStatusInProgress 进行中
	SessionStatusInProgress SessionStatus = "InProgress"
	// SessionStatusCompleted 已完成
	SessionStatusCompleted SessionStatus = "Completed"
	// SessionStatusFailed 已失败
	SessionStatusFailed SessionStatus = "Failed"
	// SessionStatusTimeout 已超时
	SessionStatusTimeout SessionStatus = "Timeout"
)

// ThresholdScheme 门限方案配置
type ThresholdScheme struct {
	// TotalParticipants 总参与者数
	TotalParticipants uint32 `json:"total_participants"`
	// Threshold 门限值（至少需要这么多分片才能签名）
	Threshold uint32 `json:"threshold"`
	// CurveType 曲线类型
	CurveType CurveType `json:"curve_type"`
	// Protocol 协议类型
	Protocol ProtocolType `json:"protocol"`
}

// PublicKey 公钥（压缩格式）
type PublicKey struct {
	// Bytes 公钥字节
	Bytes []byte `json:"bytes"`
	// CurveType 曲线类型
	CurveType CurveType `json:"curve_type"`
}

// MarshalJSON 自定义JSON序列化
func (pk PublicKey) MarshalJSON() ([]byte, error) {
	type Alias PublicKey
	return json.Marshal(&struct {
		Bytes string `json:"bytes"`
		*Alias
	}{
		Bytes: fmt.Sprintf("0x%x", pk.Bytes),
		Alias: (*Alias)(&pk),
	})
}

// UnmarshalJSON 自定义JSON反序列化
func (pk *PublicKey) UnmarshalJSON(data []byte) error {
	type Alias PublicKey
	aux := &struct {
		Bytes string `json:"bytes"`
		*Alias
	}{
		Alias: (*Alias)(pk),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	
	// 解析十六进制字符串
	if len(aux.Bytes) > 2 && aux.Bytes[:2] == "0x" {
		hexStr := aux.Bytes[2:]
		bytes := make([]byte, len(hexStr)/2)
		for i := 0; i < len(hexStr); i += 2 {
			var b byte
			fmt.Sscanf(hexStr[i:i+2], "%02x", &b)
			bytes[i/2] = b
		}
		pk.Bytes = bytes
	}
	return nil
}

// Signature 签名
type Signature struct {
	// Bytes 签名字节
	Bytes []byte `json:"bytes"`
	// RecoveryID 恢复ID（仅ECDSA）
	RecoveryID *uint8 `json:"recovery_id,omitempty"`
	// CurveType 曲线类型
	CurveType CurveType `json:"curve_type"`
}

// KeyShare 密钥分片
type KeyShare struct {
	// Index 分片索引
	Index uint32 `json:"index"`
	// Total 总份数
	Total uint32 `json:"total"`
	// Threshold 门限值
	Threshold uint32 `json:"threshold"`
	// EncryptedShare 加密后的分片数据
	EncryptedShare []byte `json:"encrypted_share"`
	// Proof 分片证明
	Proof []byte `json:"proof,omitempty"`
	// CreatedAt 创建时间戳
	CreatedAt uint64 `json:"created_at"`
}

// SignatureShare 签名分片
type SignatureShare struct {
	// Index 分片索引
	Index uint32 `json:"index"`
	// Share 签名分片数据
	Share []byte `json:"share"`
	// Proof 证明
	Proof []byte `json:"proof,omitempty"`
}

// KeyGenRequest 密钥生成请求
type KeyGenRequest struct {
	// SessionID 会话ID
	SessionID string `json:"session_id"`
	// Scheme 门限方案
	Scheme ThresholdScheme `json:"scheme"`
	// Participants 参与者列表
	Participants []string `json:"participants"`
	// Metadata 元数据
	Metadata map[string]string `json:"metadata"`
}

// KeyGenResponse 密钥生成响应
type KeyGenResponse struct {
	// SessionID 会话ID
	SessionID string `json:"session_id"`
	// PublicKey 公钥
	PublicKey PublicKey `json:"public_key"`
	// KeyShares 密钥分片（加密的）
	KeyShares []KeyShare `json:"key_shares"`
	// Status 状态
	Status SessionStatus `json:"status"`
}

// SignRequest 签名请求
type SignRequest struct {
	// SessionID 会话ID
	SessionID string `json:"session_id"`
	// MessageHash 消息哈希
	MessageHash []byte `json:"message_hash"`
	// Participants 参与者列表
	Participants []string `json:"participants"`
	// DerivationPath 派生路径（用于HD钱包）
	DerivationPath *string `json:"derivation_path,omitempty"`
	// Metadata 元数据
	Metadata map[string]string `json:"metadata"`
}

// SignResponse 签名响应
type SignResponse struct {
	// SessionID 会话ID
	SessionID string `json:"session_id"`
	// Signature 完整签名
	Signature *Signature `json:"signature,omitempty"`
	// SignatureShares 签名分片（如果未达到门限）
	SignatureShares []SignatureShare `json:"signature_shares"`
	// Status 状态
	Status SessionStatus `json:"status"`
}

// VerifyRequest 验证签名请求
type VerifyRequest struct {
	// SessionID 会话ID
	SessionID string `json:"session_id"`
	// Message 消息
	Message []byte `json:"message"`
	// Signature 签名
	Signature Signature `json:"signature"`
}

// VerifyResponse 验证签名响应
type VerifyResponse struct {
	// Valid 是否有效
	Valid bool `json:"valid"`
}

// APIResponse API响应包装器
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}