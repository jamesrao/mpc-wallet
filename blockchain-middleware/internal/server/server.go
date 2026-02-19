package server

import (
	"blockchain-middleware/internal/config"
	"blockchain-middleware/pkg/handler"
	"blockchain-middleware/pkg/service"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Server 区块链中间件服务器
type Server struct {
	config  *config.Config
	srv     *http.Server
	router  *mux.Router
	services *service.ServiceManager
}

// NewServer 创建新的服务器实例
func NewServer(cfg *config.Config) (*Server, error) {
	// 创建区块链服务管理器
	serviceManager, err := service.NewServiceManager(cfg)
	if err != nil {
		return nil, err
	}

	// 创建路由器
	router := mux.NewRouter()

	// 创建服务器
	server := &Server{
		config:   cfg,
		router:   router,
		services: serviceManager,
	}

	// 注册路由
	server.registerRoutes()

	// 创建HTTP服务器
	server.srv = &http.Server{
		Addr:         cfg.GetServerAddress(),
		Handler:      server.getHandler(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return server, nil
}

// Start 启动服务器
func (s *Server) Start() error {
	log.Printf("Starting blockchain middleware server on %s", s.config.GetServerAddress())
	
	// 启动区块链服务连接
	if err := s.services.Start(); err != nil {
		return err
	}

	// 启动HTTP服务器
	return s.srv.ListenAndServe()
}

// Stop 停止服务器
func (s *Server) Stop() error {
	log.Println("Stopping blockchain middleware server...")
	
	// 停止区块链服务
	if err := s.services.Stop(); err != nil {
		log.Printf("Error stopping services: %v", err)
	}

	// 停止HTTP服务器
	return s.srv.Close()
}

// registerRoutes 注册路由
func (s *Server) registerRoutes() {
	// 创建处理器
	h := handler.NewHandler(s.services)

	// API版本前缀
	api := s.router.PathPrefix("/api/v1").Subrouter()

	// 健康检查
	api.HandleFunc("/health", h.HealthCheck).Methods("GET")

	// 链信息相关
	api.HandleFunc("/chains", h.GetSupportedChains).Methods("GET")
	api.HandleFunc("/chains/{chain}/info", h.GetChainInfo).Methods("GET")

	// 账户相关
	api.HandleFunc("/chains/{chain}/accounts/{address}/balance", h.GetBalance).Methods("GET")
	api.HandleFunc("/chains/{chain}/accounts/{address}/info", h.GetAccountInfo).Methods("GET")
	api.HandleFunc("/chains/{chain}/accounts/{address}/nonce", h.GetNonce).Methods("GET")

	// 交易相关
	api.HandleFunc("/chains/{chain}/transactions", h.SendTransaction).Methods("POST")
	api.HandleFunc("/chains/{chain}/transactions/{txHash}", h.GetTransaction).Methods("GET")
	api.HandleFunc("/chains/{chain}/transactions/estimate", h.EstimateGas).Methods("POST")

	// 合约相关
	api.HandleFunc("/chains/{chain}/contracts/call", h.CallContract).Methods("POST")
	api.HandleFunc("/chains/{chain}/contracts/{contract}/tokens/{address}/balance", h.GetTokenBalance).Methods("GET")

	// 区块相关
	api.HandleFunc("/chains/{chain}/blocks/latest", h.GetLatestBlock).Methods("GET")
	api.HandleFunc("/chains/{chain}/blocks/{blockNumber}", h.GetBlockByNumber).Methods("GET")

	// 事件监听
	api.HandleFunc("/chains/{chain}/events/subscribe", h.SubscribeEvents).Methods("POST")
	api.HandleFunc("/chains/{chain}/events/{subscriptionId}", h.UnsubscribeEvents).Methods("DELETE")

	// MPC相关
	api.HandleFunc("/mpc/transactions/sign", h.SignMPCTransaction).Methods("POST")
	api.HandleFunc("/mpc/transactions/broadcast", h.BroadcastMPCTransaction).Methods("POST")

	// 跨链相关
	api.HandleFunc("/cross-chain/transfer", h.CrossChainTransfer).Methods("POST")
	api.HandleFunc("/cross-chain/status/{transferId}", h.GetCrossChainStatus).Methods("GET")

	// 中间件：日志记录
	s.router.Use(s.loggingMiddleware)
}

// getHandler 获取HTTP处理器（包含CORS配置）
func (s *Server) getHandler() http.Handler {
	// 配置CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // 生产环境应该限制域名
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
		MaxAge:           300, // 5分钟
	})

	return corsHandler.Handler(s.router)
}

// loggingMiddleware 日志记录中间件
func (s *Server) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// 创建响应包装器
		ww := &responseWriter{w, http.StatusOK}

		// 处理请求
		next.ServeHTTP(ww, r)

		// 记录日志
		duration := time.Since(start)
		log.Printf("%s %s %d %s %s", 
			r.Method, 
			r.URL.Path, 
			ww.status, 
			r.RemoteAddr, 
			duration.String())
	})
}

// responseWriter 响应包装器
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}