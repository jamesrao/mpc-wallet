package services

import (
	"backend-api/internal/clients/mpc"
	"backend-api/internal/config"
	"backend-api/internal/utils"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// MPCSession MPC会话
type MPCSession struct {
	SessionID    string    `json:"session_id"`
	Type         string    `json:"type"` // keygen, sign
	Status       string    `json:"status"` // pending, processing, completed, failed
	Participants []string  `json:"participants"`
	Threshold    int       `json:"threshold"`
	TotalShares  int       `json:"total_shares"`
	Result       string    `json:"result,omitempty"` // 公钥或签名（十六进制字符串）
	PublicKey    string    `json:"public_key,omitempty"` // 公钥（十六进制字符串）
	Signature    string    `json:"signature,omitempty"` // 签名（十六进制字符串）
	ErrorMessage string    `json:"error_message,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// MPCService MPC服务
type MPCService struct {
	sessions map[string]*MPCSession
	client   *mpc.Client
}

// NewMPCService 创建MPC服务实例
func NewMPCService(cfg *config.Config) *MPCService {
	mpcCfg := &mpc.MPCConfig{
		ServiceURL: cfg.MPC.ServiceURL,
	}
	return &MPCService{
		sessions: make(map[string]*MPCSession),
		client:   mpc.NewClient(mpcCfg),
	}
}



// InitiateKeyGeneration 初始化密钥生成
func (s *MPCService) InitiateKeyGeneration(participants []string, threshold, totalShares int) (*MPCSession, error) {
	if len(participants) == 0 {
		return nil, fmt.Errorf("至少需要一个参与者")
	}
	
	if threshold < 2 || threshold > totalShares {
		return nil, fmt.Errorf("无效的门限值")
	}
	
	sessionID := utils.GenerateID()
	
	// 转换为MPC客户端期望的格式
	participantIDs := make([]string, len(participants))
	for i, p := range participants {
		participantIDs[i] = p
	}
	
	// 创建密钥生成请求
	req := &mpc.KeyGenRequest{
		SessionID: sessionID,
		Scheme: mpc.ThresholdScheme{
			TotalParticipants: uint32(totalShares),
			Threshold:         uint32(threshold),
			CurveType:         mpc.CurveTypeSecp256k1,
			Protocol:          mpc.ProtocolTypeGg18,
		},
		Participants: participantIDs,
		Metadata: map[string]string{
			"created_by": "mpc_wallet_api",
			"created_at": time.Now().UTC().Format(time.RFC3339),
		},
	}
	
	// 调用真实的MPC服务
	resp, err := s.client.GenerateKey(req)
	if err != nil {
		return nil, fmt.Errorf("failed to generate key via MPC service: %w", err)
	}
	
	// 转换为公钥十六进制字符串
	publicKeyHex := "0x" + hex.EncodeToString(resp.PublicKey.Bytes)
	
	// 创建并存储会话
	session := &MPCSession{
		SessionID:    sessionID,
		Type:         "keygen",
		Status:       string(resp.Status),
		Participants: participants,
		Threshold:    threshold,
		TotalShares:  totalShares,
		Result:       publicKeyHex,
		PublicKey:    publicKeyHex,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	
	s.sessions[sessionID] = session
	
	return session, nil
}

// GetKeyGenerationStatus 获取密钥生成状态
func (s *MPCService) GetKeyGenerationStatus(sessionID string) (*MPCSession, error) {
	session, ok := s.sessions[sessionID]
	if !ok {
		// 尝试从MPC服务获取会话信息
		pubKey, err := s.client.GetPublicKey(sessionID)
		if err != nil {
			return nil, fmt.Errorf("会话不存在: %w", err)
		}
		
		// 创建新会话记录
		session = &MPCSession{
			SessionID: sessionID,
			Type:      "keygen",
			Status:    "completed",
			PublicKey: "0x" + hex.EncodeToString(pubKey.Bytes),
			Result:    "0x" + hex.EncodeToString(pubKey.Bytes),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		
		s.sessions[sessionID] = session
	}
	
	return session, nil
}

// InitiateSigning 初始化签名
func (s *MPCService) InitiateSigning(sessionID string, message string, participants []string) (*MPCSession, error) {
	if message == "" {
		return nil, fmt.Errorf("消息不能为空")
	}
	
	if len(participants) == 0 {
		return nil, fmt.Errorf("至少需要一个参与者")
	}
	
	// 如果未提供sessionID，则创建新的
	signingSessionID := sessionID
	if signingSessionID == "" {
		signingSessionID = utils.GenerateID()
	}
	
	// 计算消息哈希
	hash := sha256.Sum256([]byte(message))
	
	// 创建签名请求
	req := &mpc.SignRequest{
		SessionID: signingSessionID,
		MessageHash: hash[:],
		Participants: participants,
		Metadata: map[string]string{
			"message": message,
			"created_by": "mpc_wallet_api",
			"created_at": time.Now().UTC().Format(time.RFC3339),
		},
	}
	
	// 调用真实的MPC服务
	resp, err := s.client.Sign(req)
	if err != nil {
		return nil, fmt.Errorf("failed to sign via MPC service: %w", err)
	}
	
	// 转换签名为十六进制字符串
	var signatureHex string
	if resp.Signature != nil {
		signatureHex = "0x" + hex.EncodeToString(resp.Signature.Bytes)
	}
	
	// 创建并存储会话
	session := &MPCSession{
		SessionID:    signingSessionID,
		Type:         "sign",
		Status:       string(resp.Status),
		Participants: participants,
		Threshold:    2, // 默认门限值
		TotalShares:  len(participants),
		Result:       signatureHex,
		Signature:    signatureHex,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	
	s.sessions[signingSessionID] = session
	
	return session, nil
}

// GetSigningStatus 获取签名状态
func (s *MPCService) GetSigningStatus(sessionID string) (*MPCSession, error) {
	session, ok := s.sessions[sessionID]
	if !ok {
		return nil, fmt.Errorf("会话不存在")
	}
	
	// 如果会话状态不是已完成，可以尝试从MPC服务获取最新状态
	if session.Status != "completed" && session.Status != "failed" {
		// 这里可以添加逻辑从MPC服务查询会话状态
		// 目前我们假设MPC服务会同步返回结果
	}
	
	return session, nil
}

// GenerateWalletAddress 生成钱包地址
func (s *MPCService) GenerateWalletAddress(userID string) (string, error) {
	// 为简化实现，基于用户ID生成一个模拟的以太坊地址
	// 在实际应用中，这里应该调用MPC服务生成真实的钱包地址
	return utils.GenerateEthereumAddress(), nil
}