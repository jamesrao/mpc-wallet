package blockchain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"time"

	"backend-api/internal/config"
)

// Client 区块链客户端
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient 创建新的区块链客户端
func NewClient(cfg *config.ChainConfig) *Client {
	return &Client{
		baseURL: cfg.MiddlewareURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// HealthCheck 健康检查
func (c *Client) HealthCheck() error {
	url := fmt.Sprintf("%s/health", c.baseURL)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("failed to call health endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health check failed with status: %d", resp.StatusCode)
	}
	
	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return fmt.Errorf("failed to decode health response: %w", err)
	}
	
	if status, ok := response["status"].(string); !ok || status != "healthy" {
		return fmt.Errorf("health check returned unhealthy status: %v", response)
	}
	
	return nil
}

// GetChains 获取支持的链
func (c *Client) GetChains() ([]ChainInfo, error) {
	url := fmt.Sprintf("%s/api/v1/chains", c.baseURL)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call get chains endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get chains failed with status %d", resp.StatusCode)
	}
	
	var chains []ChainInfo
	if err := json.NewDecoder(resp.Body).Decode(&chains); err != nil {
		return nil, fmt.Errorf("failed to decode chains response: %w", err)
	}
	
	return chains, nil
}

// GetBalance 获取地址余额
func (c *Client) GetBalance(chain ChainType, address string) (*BalanceResponse, error) {
	url := fmt.Sprintf("%s/api/v1/%s/balance/%s", c.baseURL, chain, address)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call get balance endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get balance failed with status %d", resp.StatusCode)
	}
	
	var balance BalanceResponse
	if err := json.NewDecoder(resp.Body).Decode(&balance); err != nil {
		return nil, fmt.Errorf("failed to decode balance response: %w", err)
	}
	
	return &balance, nil
}

// SendTransaction 发送交易
func (c *Client) SendTransaction(chain ChainType, req *TransactionRequest) (*TransactionResponse, error) {
	url := fmt.Sprintf("%s/api/v1/%s/send", c.baseURL, chain)
	
	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal transaction request: %w", err)
	}
	
	resp, err := c.httpClient.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to call send transaction endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("send transaction failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var txResp TransactionResponse
	if err := json.NewDecoder(resp.Body).Decode(&txResp); err != nil {
		return nil, fmt.Errorf("failed to decode transaction response: %w", err)
	}
	
	return &txResp, nil
}

// GetTransaction 获取交易信息
func (c *Client) GetTransaction(chain ChainType, txHash string) (*TransactionDetails, error) {
	url := fmt.Sprintf("%s/api/v1/%s/transaction/%s", c.baseURL, chain, txHash)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call get transaction endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get transaction failed with status %d", resp.StatusCode)
	}
	
	var details TransactionDetails
	if err := json.NewDecoder(resp.Body).Decode(&details); err != nil {
		return nil, fmt.Errorf("failed to decode transaction details: %w", err)
	}
	
	return &details, nil
}

// EstimateGas 预估Gas
func (c *Client) EstimateGas(chain ChainType, req *TransactionRequest) (*GasEstimateResponse, error) {
	url := fmt.Sprintf("%s/api/v1/%s/estimate", c.baseURL, chain)
	
	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal gas estimate request: %w", err)
	}
	
	resp, err := c.httpClient.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to call estimate gas endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("estimate gas failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var gasResp struct {
		EstimatedGas string `json:"estimated_gas"`
		Chain        string `json:"chain"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&gasResp); err != nil {
		return nil, fmt.Errorf("failed to decode gas estimate response: %w", err)
	}
	
	estimatedGas, ok := new(big.Int).SetString(gasResp.EstimatedGas, 10)
	if !ok {
		return nil, fmt.Errorf("invalid estimated gas value: %s", gasResp.EstimatedGas)
	}
	
	return &GasEstimateResponse{
		EstimatedGas: estimatedGas,
		Chain:        gasResp.Chain,
	}, nil
}

// GetNonce 获取Nonce
func (c *Client) GetNonce(chain ChainType, address string) (*NonceResponse, error) {
	url := fmt.Sprintf("%s/api/v1/%s/nonce/%s", c.baseURL, chain, address)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call get nonce endpoint: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get nonce failed with status %d", resp.StatusCode)
	}
	
	var nonceResp NonceResponse
	if err := json.NewDecoder(resp.Body).Decode(&nonceResp); err != nil {
		return nil, fmt.Errorf("failed to decode nonce response: %w", err)
	}
	
	return &nonceResp, nil
}