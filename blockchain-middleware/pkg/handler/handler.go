package handler

import (
	"blockchain-middleware/pkg/service"
	"blockchain-middleware/pkg/types"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// Handler HTTP请求处理器
type Handler struct {
	services *service.ServiceManager
}

// NewHandler 创建新的处理器
func NewHandler(services *service.ServiceManager) *Handler {
	return &Handler{
		services: services,
	}
}

// HealthCheck 健康检查
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	}
	h.writeJSON(w, http.StatusOK, response)
}

// GetSupportedChains 获取支持的链列表
func (h *Handler) GetSupportedChains(w http.ResponseWriter, r *http.Request) {
	chains := h.services.GetSupportedChains()
	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"chains": chains,
	})
}

// GetChainInfo 获取链信息
func (h *Handler) GetChainInfo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	info, err := h.services.GetChainInfo(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, info)
}

// GetBalance 获取账户余额
func (h *Handler) GetBalance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	address := vars["address"]

	balance, err := h.services.GetBalance(chainName, address)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"address": address,
		"balance": balance.String(),
		"chain":   chainName,
	})
}

// GetAccountInfo 获取账户信息
func (h *Handler) GetAccountInfo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	address := vars["address"]

	client, err := h.services.GetChainClient(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 获取ETH余额
	ethBalance, err := client.GetBalance(address)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 获取nonce
	nonce, err := client.GetNonce(address)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	accountInfo := &types.AccountInfo{
		Address:           address,
		ETHBalance:        ethBalance,
		Nonce:             nonce,
		TransactionCount:  0, // 简化处理
	}

	h.writeJSON(w, http.StatusOK, accountInfo)
}

// GetNonce 获取账户nonce
func (h *Handler) GetNonce(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	address := vars["address"]

	client, err := h.services.GetChainClient(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	nonce, err := client.GetNonce(address)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"address": address,
		"nonce":   nonce,
		"chain":   chainName,
	})
}

// SendTransaction 发送交易
func (h *Handler) SendTransaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	var req types.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	txHash, err := h.services.SendTransaction(chainName, &req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"tx_hash": txHash,
		"chain":   chainName,
	})
}

// GetTransaction 获取交易信息
func (h *Handler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	txHash := vars["txHash"]

	tx, err := h.services.GetTransaction(chainName, txHash)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, tx)
}

// EstimateGas 预估Gas
func (h *Handler) EstimateGas(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	var req types.TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	gas, err := h.services.EstimateGas(chainName, &req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"estimated_gas": gas,
		"chain":        chainName,
	})
}

// CallContract 调用合约
func (h *Handler) CallContract(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	var req types.ContractCallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	result, err := h.services.CallContract(chainName, &req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, types.ContractCallResponse{
		Result: result,
	})
}

// GetTokenBalance 获取代币余额
func (h *Handler) GetTokenBalance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	contract := vars["contract"]
	address := vars["address"]

	// 检查链服务是否可用
	_, err := h.services.GetChainClient(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	// 这里需要实现代币余额查询逻辑
	// 简化处理，返回示例数据
	balance := big.NewInt(1000000000000000000) // 1 token

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"contract": contract,
		"address":  address,
		"balance":  balance.String(),
		"chain":    chainName,
	})
}

// GetLatestBlock 获取最新区块
func (h *Handler) GetLatestBlock(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	client, err := h.services.GetChainClient(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	blockNumber, err := client.GetBlockNumber()
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	block, err := client.GetBlockByNumber(blockNumber)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, block)
}

// GetBlockByNumber 根据区块号获取区块
func (h *Handler) GetBlockByNumber(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]
	blockNumberStr := vars["blockNumber"]

	var blockNumber uint64
	fmt.Sscanf(blockNumberStr, "%d", &blockNumber)

	client, err := h.services.GetChainClient(chainName)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	block, err := client.GetBlockByNumber(blockNumber)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, block)
}

// SubscribeEvents 订阅事件
func (h *Handler) SubscribeEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chainName := vars["chain"]

	var filter types.EventFilter
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	subscriptionID, err := h.services.SubscribeEvents(chainName, filter)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"subscription_id": subscriptionID,
		"chain":          chainName,
	})
}

// UnsubscribeEvents 取消订阅事件
func (h *Handler) UnsubscribeEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	subscriptionID := vars["subscriptionId"]

	err := h.services.UnsubscribeEvents(subscriptionID)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Unsubscribed successfully",
	})
}

// SignMPCTransaction MPC签名交易
func (h *Handler) SignMPCTransaction(w http.ResponseWriter, r *http.Request) {
	var req types.MPCTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	response, err := h.services.SignMPCTransaction(&req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, response)
}

// BroadcastMPCTransaction 广播MPC交易
func (h *Handler) BroadcastMPCTransaction(w http.ResponseWriter, r *http.Request) {
	var req types.MPCBroadcastRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	txHash, err := h.services.BroadcastMPCTransaction(&req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"tx_hash": txHash,
		"session_id": req.SessionID,
	})
}

// CrossChainTransfer 跨链转账
func (h *Handler) CrossChainTransfer(w http.ResponseWriter, r *http.Request) {
	var req types.CrossChainRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	transferID, err := h.services.CrossChainTransfer(&req)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"transfer_id": transferID,
		"status":      "pending",
	})
}

// GetCrossChainStatus 获取跨链状态
func (h *Handler) GetCrossChainStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transferID := vars["transferId"]

	status, err := h.services.GetCrossChainStatus(transferID)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, status)
}

// writeJSON 写入JSON响应
func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	if err := json.NewEncoder(w).Encode(data); err != nil {
		h.writeError(w, http.StatusInternalServerError, "Failed to encode response")
	}
}

// writeError 写入错误响应
func (h *Handler) writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	errorResponse := map[string]interface{}{
		"error":   http.StatusText(status),
		"message": message,
		"code":    status,
	}
	
	json.NewEncoder(w).Encode(errorResponse)
}