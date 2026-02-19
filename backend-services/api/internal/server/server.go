package server

import (
	"backend-api/internal/config"
	"backend-api/internal/database"
	"backend-api/internal/handlers"
	"backend-api/internal/repositories"
	"backend-api/internal/services"
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// retryDatabaseConnection 带重试机制的数据库连接
func retryDatabaseConnection(cfg *config.DatabaseConfig) error {
	maxRetries := 30
	retryInterval := 2 * time.Second

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			log.Printf("Retrying database connection (attempt %d/%d)...", i+1, maxRetries)
			time.Sleep(retryInterval)
		}

		err := database.InitDatabase(cfg)
		if err == nil {
			return nil
		}

		log.Printf("Database connection failed (attempt %d/%d): %v", i+1, maxRetries, err)
	}

	return fmt.Errorf("database connection failed after %d attempts", maxRetries)
}

// Server HTTP服务器
type Server struct {
	config *config.Config
	router *mux.Router
	server *http.Server
	handler *handlers.Handler
}

// NewServer 创建新的服务器实例
func NewServer(cfg *config.Config) *Server {
	router := mux.NewRouter()

	// 初始化数据库（带重试机制）
	if err := retryDatabaseConnection(&cfg.Database); err != nil {
		log.Fatalf("Failed to initialize database after retries: %v", err)
	}

	// 运行数据库迁移
	if err := database.ManualMigration(); err != nil {
		log.Printf("WARNING: Database migration failed (continuing anyway): %v", err)
	}

	// 初始化存储库
	userRepo := repositories.NewPostgresUserRepository()
	walletRepo := repositories.NewPostgresWalletRepository()

	// 初始化服务
	userService := services.NewUserService(userRepo)
	mpcService := services.NewMPCService(cfg)
	walletService := services.NewWalletService(walletRepo, mpcService)
	chainService := services.NewChainService(cfg)
	passkeyService := services.NewPasskeyService()
	
	// 初始化Facebook认证服务（如果配置了Facebook应用信息）
	var facebookAuthService *services.FacebookAuthService
	if cfg.Auth.Facebook.AppID != "" && cfg.Auth.Facebook.AppSecret != "" {
		facebookAuthService = services.NewFacebookAuthService(cfg, userRepo, mpcService)
	}

	// 初始化处理器
	var handler *handlers.Handler
	if facebookAuthService != nil {
		handler = handlers.NewHandlerWithAllAuth(userService, walletService, mpcService, chainService, facebookAuthService, passkeyService)
	} else {
		handler = handlers.NewHandlerWithPasskey(userService, walletService, mpcService, chainService, passkeyService)
		log.Println("Facebook authentication is not configured - skipping Facebook auth routes")
	}

	// 设置路由
	setupRoutes(router, handler)

	// 配置CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// 创建HTTP服务器
	srv := &http.Server{
		Addr:         cfg.GetServerAddress(),
		Handler:      corsHandler.Handler(router),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return &Server{
		config: cfg,
		router: router,
		server: srv,
		handler: handler,
	}
}

// setupRoutes 设置路由
func setupRoutes(router *mux.Router, handler *handlers.Handler) {
	// 健康检查
	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// 用户相关路由
	router.HandleFunc("/api/v1/auth/register", handler.Register).Methods("POST")
	router.HandleFunc("/api/v1/auth/login", handler.Login).Methods("POST")
	router.HandleFunc("/api/v1/users", handler.CreateUser).Methods("POST")
	router.HandleFunc("/api/v1/users/{id}", handler.GetUser).Methods("GET")
	router.HandleFunc("/api/v1/users/{id}", handler.UpdateUser).Methods("PUT")

	// Facebook认证路由
	if handler.FacebookAuthService != nil {
		router.HandleFunc("/api/v1/auth/facebook/start", handler.FacebookAuthStart).Methods("GET")
		router.HandleFunc("/api/v1/auth/facebook/callback", handler.FacebookAuthCallback).Methods("GET")
		router.HandleFunc("/api/v1/auth/facebook/token", handler.FacebookAuthToken).Methods("POST")
	}

	// Passkey认证路由
	if handler.PasskeyService != nil {
		router.HandleFunc("/api/v1/auth/passkey/register/start", handler.StartPasskeyRegistration).Methods("POST")
		router.HandleFunc("/api/v1/auth/passkey/register/finish", handler.FinishPasskeyRegistration).Methods("POST")
		router.HandleFunc("/api/v1/auth/passkey/authenticate/start", handler.StartPasskeyAuthentication).Methods("POST")
		router.HandleFunc("/api/v1/auth/passkey/authenticate/finish", handler.FinishPasskeyAuthentication).Methods("POST")
		router.HandleFunc("/api/v1/auth/passkey", handler.GetUserPasskeys).Methods("GET")
		router.HandleFunc("/api/v1/auth/passkey/{id}", handler.DeletePasskey).Methods("DELETE")
	}

	// 钱包相关路由
	router.HandleFunc("/api/v1/wallets", handler.CreateWallet).Methods("POST")
	router.HandleFunc("/api/v1/wallets/{id}", handler.GetWallet).Methods("GET")
	router.HandleFunc("/api/v1/wallets/{id}/balance", handler.GetWalletBalance).Methods("GET")
	router.HandleFunc("/api/v1/wallets/{id}/transactions", handler.GetWalletTransactions).Methods("GET")
	router.HandleFunc("/api/v1/wallets/{id}/send", handler.SendWalletTransaction).Methods("POST")

	// MPC相关路由
	router.HandleFunc("/api/v1/mpc/keygen", handler.InitiateKeyGeneration).Methods("POST")
	router.HandleFunc("/api/v1/mpc/keygen/{sessionId}", handler.GetKeyGenerationStatus).Methods("GET")
	router.HandleFunc("/api/v1/mpc/sign", handler.InitiateSigning).Methods("POST")
	router.HandleFunc("/api/v1/mpc/sign/{sessionId}", handler.GetSigningStatus).Methods("GET")

	// 区块链相关路由
	router.HandleFunc("/api/v1/chain/balance/{address}", handler.GetChainBalance).Methods("GET")
	router.HandleFunc("/api/v1/chain/transaction", handler.SendTransaction).Methods("POST")
	router.HandleFunc("/api/v1/chain/transaction/{txHash}", handler.GetTransaction).Methods("GET")

	// 智能合约相关路由
	router.HandleFunc("/api/v1/contract/escrow/create", handler.CreateEscrow).Methods("POST")
	router.HandleFunc("/api/v1/contract/escrow/{escrowId}", handler.GetEscrow).Methods("GET")
	router.HandleFunc("/api/v1/contract/escrow/{escrowId}/release", handler.ReleaseEscrow).Methods("POST")
	router.HandleFunc("/api/v1/contract/supply-chain/finance", handler.FinanceSupplyChain).Methods("POST")
}

// Start 启动服务器
func (s *Server) Start() error {
	log.Printf("Starting server on %s", s.server.Addr)
	return s.server.ListenAndServe()
}

// Stop 停止服务器
func (s *Server) Stop() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.server.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}
}