package mpc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client MPC客户端
type Client struct {
	baseURL string
	httpClient *http.Client
}

// NewClient 创建MPC客户端实例
func NewClient(config *MPCConfig) *Client {
	return &Client{
		baseURL: config.ServiceURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// MPCConfig MPC配置
type MPCConfig struct {
	ServiceURL string `yaml:"service_url"`
}





// Status 状态枚举
type Status string

const (
	StatusPending    Status = "pending"
	StatusProcessing Status = "processing"
	StatusCompleted  Status = "completed"
	StatusFailed     Status = "failed"
)



// GenerateKey 生成密钥
func (c *Client) GenerateKey(req *KeyGenRequest) (*KeyGenResponse, error) {
	url := fmt.Sprintf("%s/api/v1/mpc/keygen", c.baseURL)
	
	resp, err := c.doRequest("POST", url, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("MPC service error: %s - %s", resp.Status, string(body))
	}
	
	var keyGenResp KeyGenResponse
	if err := json.NewDecoder(resp.Body).Decode(&keyGenResp); err != nil {
		return nil, err
	}
	
	return &keyGenResp, nil
}

// Sign 签名
func (c *Client) Sign(req *SignRequest) (*SignResponse, error) {
	url := fmt.Sprintf("%s/api/v1/mpc/sign", c.baseURL)
	
	resp, err := c.doRequest("POST", url, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusAccepted {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("MPC service error: %s - %s", resp.Status, string(body))
	}
	
	var signResp SignResponse
	if err := json.NewDecoder(resp.Body).Decode(&signResp); err != nil {
		return nil, err
	}
	
	return &signResp, nil
}

// GetPublicKey 获取公钥
func (c *Client) GetPublicKey(sessionID string) (*PublicKey, error) {
	url := fmt.Sprintf("%s/api/v1/mpc/keygen/%s", c.baseURL, sessionID)
	
	resp, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			return nil, fmt.Errorf("session not found")
		}
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("MPC service error: %s - %s", resp.Status, string(body))
	}
	
	var keyGenResp KeyGenResponse
	if err := json.NewDecoder(resp.Body).Decode(&keyGenResp); err != nil {
		return nil, err
	}
	
	if keyGenResp.Status != SessionStatusCompleted {
		return nil, fmt.Errorf("key generation not completed")
	}

	return &keyGenResp.PublicKey, nil
}

// doRequest 执行HTTP请求
func (c *Client) doRequest(method, url string, body interface{}) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(jsonData)
	}
	
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Content-Type", "application/json")
	
	return c.httpClient.Do(req)
}