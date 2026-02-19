package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	// 设置服务器端口
	port := "3000"
	if envPort := os.Getenv("SERVER_PORT"); envPort != "" {
		port = envPort
	}

	// 创建HTTP服务器
	mux := http.NewServeMux()
	
	// 健康检查端点
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "timestamp": "` + time.Now().Format(time.RFC3339) + `"}`))
	})

	// 基础API端点
	mux.HandleFunc("/api/v1/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"service": "mpc-wallet-api",
			"version": "1.0.0",
			"status": "running",
			"timestamp": "` + time.Now().Format(time.RFC3339) + `"
		}`))
	})

	// MPC模拟端点
	mux.HandleFunc("/api/v1/mpc/keygen", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"session_id": "mock-session-123",
			"status": "completed",
			"public_key": {
				"bytes": "02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
			}
		}`))
	})

	mux.HandleFunc("/api/v1/mpc/sign", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"session_id": "mock-session-123",
			"status": "completed",
			"signature": {
				"bytes": "3045022100abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678902200abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
			}
		}`))
	})

	// 启动服务器
	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 MPC Wallet API Server starting on %s", addr)
	log.Printf("📊 Health check available at http://localhost:%s/health", port)
	
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}