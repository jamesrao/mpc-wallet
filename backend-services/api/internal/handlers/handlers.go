package handlers

import (
	"backend-api/internal/models"
	"encoding/json"
	"math/big"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// HealthCheck 健康检查
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "healthy"}
	jsonResponse(w, response, http.StatusOK)
}

// CreateUser 创建用户
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	user, err := h.userService.CreateUser(req)
	if err != nil {
		// 根据错误类型返回不同的状态码
		if err.Error() == "user already exists" {
			jsonResponse(w, map[string]string{"error": "User already exists"}, http.StatusConflict)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, user, http.StatusCreated)
}

// GetUser 获取用户信息
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	user, err := h.userService.GetUser(id)
	if err != nil {
		if err.Error() == "user not found" {
			jsonResponse(w, map[string]string{"error": "User not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, user, http.StatusOK)
}

// UpdateUser 更新用户信息
func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	user, err := h.userService.UpdateUser(id, req)
	if err != nil {
		if err.Error() == "user not found" {
			jsonResponse(w, map[string]string{"error": "User not found"}, http.StatusNotFound)
		} else if err.Error() == "user already exists" {
			jsonResponse(w, map[string]string{"error": "Username already exists"}, http.StatusConflict)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, user, http.StatusOK)
}

// Register 用户注册
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	// 转换为CreateUserRequest
	createReq := models.CreateUserRequest{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
	}

	user, err := h.userService.CreateUser(createReq)
	if err != nil {
		// 根据错误类型返回不同的状态码
		if err.Error() == "user already exists" {
			jsonResponse(w, map[string]string{"error": "Username already exists"}, http.StatusConflict)
		} else if err.Error() == "email already exists" {
			jsonResponse(w, map[string]string{"error": "Email already exists"}, http.StatusConflict)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, user, http.StatusCreated)
}

// Login 用户登录
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	response, err := h.userService.Login(req)
	if err != nil {
		if err.Error() == "invalid credentials" {
			jsonResponse(w, map[string]string{"error": "Invalid username or password"}, http.StatusUnauthorized)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, response, http.StatusOK)
}

// CreateWallet 创建钱包
func (h *Handler) CreateWallet(w http.ResponseWriter, r *http.Request) {
	var req models.CreateWalletRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	wallet, err := h.walletService.CreateWallet(req)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, wallet, http.StatusCreated)
}

// GetWallet 获取钱包信息
func (h *Handler) GetWallet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	wallet, err := h.walletService.GetWallet(id)
	if err != nil {
		if err.Error() == "wallet not found" {
			jsonResponse(w, map[string]string{"error": "Wallet not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, wallet, http.StatusOK)
}

// GetWalletBalance 获取钱包余额
func (h *Handler) GetWalletBalance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// 从查询参数获取代币地址（可选）
	tokenAddress := r.URL.Query().Get("token")

	balance, err := h.walletService.GetWalletBalance(id, tokenAddress)
	if err != nil {
		if err.Error() == "wallet not found" {
			jsonResponse(w, map[string]string{"error": "Wallet not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, balance, http.StatusOK)
}

// GetWalletTransactions 获取钱包交易记录
func (h *Handler) GetWalletTransactions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// 解析查询参数
	query := r.URL.Query()
	limit := 10 // 默认限制
	offset := 0  // 默认偏移

	if limitStr := query.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr := query.Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	transactions, err := h.walletService.GetWalletTransactions(id, limit, offset)
	if err != nil {
		if err.Error() == "wallet not found" {
			jsonResponse(w, map[string]string{"error": "Wallet not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	response := map[string]interface{}{
		"transactions": transactions,
		"limit":        limit,
		"offset":       offset,
		"total":        len(transactions),
	}
	jsonResponse(w, response, http.StatusOK)
}

// SendWalletTransaction 发送钱包交易
func (h *Handler) SendWalletTransaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	walletID := vars["id"]

	var req struct {
		To    string `json:"to" validate:"required"`
		Value string `json:"value" validate:"required"`
		Data  string `json:"data,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	txHash, err := h.walletService.SendTransaction(walletID, req.To, req.Value, req.Data)
	if err != nil {
		if err.Error() == "wallet not found" {
			jsonResponse(w, map[string]string{"error": "Wallet not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	response := map[string]string{"txHash": txHash}
	jsonResponse(w, response, http.StatusAccepted)
}

// InitiateKeyGeneration 初始化密钥生成
func (h *Handler) InitiateKeyGeneration(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Participants []string `json:"participants"`
		Threshold    int      `json:"threshold"`
		TotalShares  int      `json:"total_shares"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}
	
	session, err := h.mpcService.InitiateKeyGeneration(req.Participants, req.Threshold, req.TotalShares)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	jsonResponse(w, session, http.StatusAccepted)
}

// GetKeyGenerationStatus 获取密钥生成状态
func (h *Handler) GetKeyGenerationStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionId"]
	
	session, err := h.mpcService.GetKeyGenerationStatus(sessionID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusNotFound)
		return
	}
	
	jsonResponse(w, session, http.StatusOK)
}

// InitiateSigning 初始化签名
func (h *Handler) InitiateSigning(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Message      string   `json:"message"`
		Participants []string `json:"participants"`
		SessionID    string   `json:"session_id,omitempty"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}
	
	session, err := h.mpcService.InitiateSigning(req.SessionID, req.Message, req.Participants)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	jsonResponse(w, session, http.StatusAccepted)
}

// GetSigningStatus 获取签名状态
func (h *Handler) GetSigningStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionId"]
	
	session, err := h.mpcService.GetSigningStatus(sessionID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusNotFound)
		return
	}
	
	jsonResponse(w, session, http.StatusOK)
}

// GetChainBalance 获取链上余额
func (h *Handler) GetChainBalance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	address := vars["address"]
	
	balance, err := h.chainService.GetBalance(address)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	response := map[string]string{"balance": balance}
	jsonResponse(w, response, http.StatusOK)
}

// SendTransaction 发送交易
func (h *Handler) SendTransaction(w http.ResponseWriter, r *http.Request) {
	var req struct {
		From  string `json:"from"`
		To    string `json:"to"`
		Value string `json:"value"`
		Data  string `json:"data,omitempty"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}
	
	txHash, err := h.chainService.SendTransaction(req.From, req.To, req.Value, req.Data)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	response := map[string]string{"txHash": txHash}
	jsonResponse(w, response, http.StatusAccepted)
}

// GetTransaction 获取交易信息
func (h *Handler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	txHash := vars["txHash"]
	
	tx, err := h.chainService.GetTransaction(txHash)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	response := map[string]interface{}{"transaction": tx}
	jsonResponse(w, response, http.StatusOK)
}

// CreateEscrow 创建托管合约
func (h *Handler) CreateEscrow(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Seller     string `json:"seller"`
		Arbitrator string `json:"arbitrator"`
		Amount     string `json:"amount"`
		Deadline   uint64 `json:"deadline"`
		TermsHash  string `json:"terms_hash"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}
	
	// 解析金额
	amount, ok := new(big.Int).SetString(req.Amount, 10)
	if !ok {
		jsonResponse(w, map[string]string{"error": "Invalid amount format"}, http.StatusBadRequest)
		return
	}
	
	// 调用链服务创建托管
	escrowID, err := h.chainService.CreateEscrow(req.Seller, req.Arbitrator, amount, req.Deadline, req.TermsHash)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	response := map[string]string{"escrowId": escrowID}
	jsonResponse(w, response, http.StatusCreated)
}

// GetEscrow 获取托管合约信息
func (h *Handler) GetEscrow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	escrowID := vars["escrowId"]
	
	// 调用链服务获取托管信息
	escrow, err := h.chainService.GetEscrow(escrowID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusNotFound)
		return
	}
	
	response := map[string]interface{}{"escrow": escrow}
	jsonResponse(w, response, http.StatusOK)
}

// ReleaseEscrow 释放托管资金
func (h *Handler) ReleaseEscrow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	escrowID := vars["escrowId"]
	
	// 调用链服务释放托管资金
	txHash, err := h.chainService.ReleaseEscrow(escrowID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}
	
	response := map[string]string{"txHash": txHash, "message": "Escrow released successfully"}
	jsonResponse(w, response, http.StatusOK)
}

// FinanceSupplyChain 供应链金融
func (h *Handler) FinanceSupplyChain(w http.ResponseWriter, r *http.Request) {
	// TODO: 实现供应链金融逻辑
	response := map[string]string{"transactionId": "mock_transaction_id"}
	jsonResponse(w, response, http.StatusCreated)
}

// FacebookAuthStart Facebook认证开始
func (h *Handler) FacebookAuthStart(w http.ResponseWriter, r *http.Request) {
	if h.facebookAuthService == nil {
		jsonResponse(w, map[string]string{"error": "Facebook authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	// 生成随机state参数用于安全验证
	state := utils.GenerateID()
	
	// 获取Facebook认证URL
	authURL := h.facebookAuthService.GetFacebookAuthURL(state)
	if authURL == "" {
		jsonResponse(w, map[string]string{"error": "Facebook app configuration is missing"}, http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"auth_url": authURL,
		"state":    state,
	}
	jsonResponse(w, response, http.StatusOK)
}

// FacebookAuthCallback Facebook认证回调
func (h *Handler) FacebookAuthCallback(w http.ResponseWriter, r *http.Request) {
	if h.facebookAuthService == nil {
		jsonResponse(w, map[string]string{"error": "Facebook authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	// 从查询参数获取授权码
	code := r.URL.Query().Get("code")
	if code == "" {
		jsonResponse(w, map[string]string{"error": "Authorization code is required"}, http.StatusBadRequest)
		return
	}

	// 处理Facebook回调
	response, err := h.facebookAuthService.HandleFacebookCallback(code)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusUnauthorized)
		return
	}

	jsonResponse(w, response, http.StatusOK)
}

// FacebookAuthToken 使用Facebook访问令牌登录
func (h *Handler) FacebookAuthToken(w http.ResponseWriter, r *http.Request) {
	if h.facebookAuthService == nil {
		jsonResponse(w, map[string]string{"error": "Facebook authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	var req struct {
		AccessToken string `json:"access_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	if req.AccessToken == "" {
		jsonResponse(w, map[string]string{"error": "Access token is required"}, http.StatusBadRequest)
		return
	}

	// 验证Facebook令牌
	fbUser, err := h.facebookAuthService.ValidateFacebookToken(req.AccessToken)
	if err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid Facebook access token"}, http.StatusUnauthorized)
		return
	}

	// 查找或创建用户
	user, isNewUser, err := h.facebookAuthService.FindOrCreateUser(fbUser)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	// 生成JWT令牌
	accessToken, err := utils.GenerateToken(user.ID, user.Username, nil)
	if err != nil {
		jsonResponse(w, map[string]string{"error": "Failed to generate token"}, http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"user":          user,
		"access_token":  accessToken,
		"expires_in":    24 * 60 * 60,
		"is_new_user":   isNewUser,
	}

	jsonResponse(w, response, http.StatusOK)
}

// StartPasskeyRegistration 开始Passkey注册流程
func (h *Handler) StartPasskeyRegistration(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	// 从请求中获取用户ID（通常从JWT令牌中获取）
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		jsonResponse(w, map[string]string{"error": "User ID is required"}, http.StatusBadRequest)
		return
	}

	options, err := h.passkeyService.BeginRegistration(userID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, options, http.StatusOK)
}

// FinishPasskeyRegistration 完成Passkey注册
func (h *Handler) FinishPasskeyRegistration(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	// 从请求中获取用户ID
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		jsonResponse(w, map[string]string{"error": "User ID is required"}, http.StatusBadRequest)
		return
	}

	var req struct {
		SessionID                string                   `json:"session_id"`
		CredentialCreationData map[string]interface{} `json:"credential"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	if req.SessionID == "" {
		jsonResponse(w, map[string]string{"error": "Session ID is required"}, http.StatusBadRequest)
		return
	}

	// 解析凭证创建数据
	parsedData := &webauthn.ParsedCredentialCreationData{
		// 这里需要将JSON数据转换为WebAuthn结构
		// 实际实现中需要更详细的解析逻辑
	}

	if err := h.passkeyService.FinishRegistration(userID, req.SessionID, parsedData); err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, map[string]string{"message": "Passkey registered successfully"}, http.StatusOK)
}

// StartPasskeyAuthentication 开始Passkey认证流程
func (h *Handler) StartPasskeyAuthentication(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	var req struct {
		UserID string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		jsonResponse(w, map[string]string{"error": "User ID is required"}, http.StatusBadRequest)
		return
	}

	options, err := h.passkeyService.BeginAuthentication(req.UserID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, options, http.StatusOK)
}

// FinishPasskeyAuthentication 完成Passkey认证
func (h *Handler) FinishPasskeyAuthentication(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	var req struct {
		UserID                  string                   `json:"user_id"`
		CredentialAssertionData map[string]interface{}   `json:"credential"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, map[string]string{"error": "Invalid request body"}, http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		jsonResponse(w, map[string]string{"error": "User ID is required"}, http.StatusBadRequest)
		return
	}

	// 解析凭证断言数据
	parsedData := &webauthn.ParsedCredentialAssertionData{
		// 这里需要将JSON数据转换为WebAuthn结构
		// 实际实现中需要更详细的解析逻辑
	}

	user, err := h.passkeyService.FinishAuthentication(req.UserID, parsedData)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusUnauthorized)
		return
	}

	// 生成JWT令牌
	accessToken, err := utils.GenerateToken(user.ID, user.Username, nil)
	if err != nil {
		jsonResponse(w, map[string]string{"error": "Failed to generate token"}, http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"user":         user,
		"access_token": accessToken,
		"expires_in":   24 * 60 * 60,
	}

	jsonResponse(w, response, http.StatusOK)
}

// GetUserPasskeys 获取用户的Passkey列表
func (h *Handler) GetUserPasskeys(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	// 从请求中获取用户ID
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		jsonResponse(w, map[string]string{"error": "User ID is required"}, http.StatusBadRequest)
		return
	}

	passkeys, err := h.passkeyService.GetPasskeysByUserID(userID)
	if err != nil {
		jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		return
	}

	jsonResponse(w, passkeys, http.StatusOK)
}

// DeletePasskey 删除Passkey
func (h *Handler) DeletePasskey(w http.ResponseWriter, r *http.Request) {
	if h.passkeyService == nil {
		jsonResponse(w, map[string]string{"error": "Passkey authentication is not configured"}, http.StatusServiceUnavailable)
		return
	}

	vars := mux.Vars(r)
	passkeyID := vars["id"]

	if err := h.passkeyService.DeletePasskey(passkeyID); err != nil {
		if err.Error() == "passkey not found" {
			jsonResponse(w, map[string]string{"error": "Passkey not found"}, http.StatusNotFound)
		} else {
			jsonResponse(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
		}
		return
	}

	jsonResponse(w, map[string]string{"message": "Passkey deleted successfully"}, http.StatusOK)
}

// jsonResponse 返回JSON响应
func jsonResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}