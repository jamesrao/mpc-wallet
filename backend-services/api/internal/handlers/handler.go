package handlers

import (
	"backend-api/internal/services"
)

// Handler HTTP请求处理器
type Handler struct {
	userService         *services.UserService
	walletService       *services.WalletService
	mpcService          *services.MPCService
	chainService        *services.ChainService
	facebookAuthService *services.FacebookAuthService
	passkeyService      *services.PasskeyService
}

// NewHandler 创建新的处理器实例
func NewHandler(userService *services.UserService, walletService *services.WalletService, mpcService *services.MPCService, chainService *services.ChainService) *Handler {
	return &Handler{
		userService:   userService,
		walletService: walletService,
		mpcService:    mpcService,
		chainService:  chainService,
	}
}

// NewHandlerWithFacebookAuth 创建带Facebook认证的处理器实例
func NewHandlerWithFacebookAuth(userService *services.UserService, walletService *services.WalletService, mpcService *services.MPCService, chainService *services.ChainService, facebookAuthService *services.FacebookAuthService) *Handler {
	return &Handler{
		userService:         userService,
		walletService:       walletService,
		mpcService:          mpcService,
		chainService:        chainService,
		facebookAuthService: facebookAuthService,
	}
}

// NewHandlerWithPasskey 创建带Passkey认证的处理器实例
func NewHandlerWithPasskey(userService *services.UserService, walletService *services.WalletService, mpcService *services.MPCService, chainService *services.ChainService, passkeyService *services.PasskeyService) *Handler {
	return &Handler{
		userService:    userService,
		walletService:  walletService,
		mpcService:     mpcService,
		chainService:   chainService,
		passkeyService: passkeyService,
	}
}

// NewHandlerWithAllAuth 创建带所有认证方式的处理器实例
func NewHandlerWithAllAuth(userService *services.UserService, walletService *services.WalletService, mpcService *services.MPCService, chainService *services.ChainService, facebookAuthService *services.FacebookAuthService, passkeyService *services.PasskeyService) *Handler {
	return &Handler{
		userService:         userService,
		walletService:       walletService,
		mpcService:          mpcService,
		chainService:        chainService,
		facebookAuthService: facebookAuthService,
		passkeyService:      passkeyService,
	}
}

