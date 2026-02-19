import axios from 'axios'

// API基础配置 - 指向后端API服务
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error.response?.data || { message: '请求失败' })
  }
)

// 用户相关API
export const authApi = {
  // 登录 - 暂时使用前端模拟API（后续可改为后端认证）
  login: (data: { email: string; password: string }) => 
    apiClient.post('/auth/login', data),
  
  // 注册 - 调用后端创建用户端点
  register: (data: { email: string; username: string }) => 
    apiClient.post('/users', data),
  
  logout: () => apiClient.post('/auth/logout'),
  
  // 获取用户信息 - 调用后端获取用户端点
  getProfile: (userId: string) => apiClient.get(`/users/${userId}`),
  
  // 更新用户信息 - 调用后端更新用户端点
  updateProfile: (userId: string, data: { username?: string; email?: string }) => 
    apiClient.put(`/users/${userId}`, data),
}

// 钱包管理API
export const walletApi = {
  // 创建钱包
  createWallet: (data: { user_id: string; name: string; chain_type: string; threshold: number; total_shares: number }) =>
    apiClient.post('/wallets', data),
  
  // 获取钱包信息
  getWallet: (walletId: string) => apiClient.get(`/wallets/${walletId}`),
  
  // 获取钱包余额
  getWalletBalance: (walletId: string, token?: string) => 
    apiClient.get(`/wallets/${walletId}/balance`, { params: { token } }),
  
  // 获取钱包交易记录
  getWalletTransactions: (walletId: string) => 
    apiClient.get(`/wallets/${walletId}/transactions`),
}

// 资产管理API（模拟数据，后续可替换为真实数据）
export const assetApi = {
  getAssets: () => Promise.resolve({
    success: true,
    data: [
      {
        id: '1',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '4.72',
        value: '$16,540.80',
        price: '$3,506.95',
        change24h: '+2.8%',
        color: '#627EEA',
        decimals: 18,
        chain: 'ethereum'
      },
      {
        id: '2',
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: '0.42',
        value: '$28,451.40',
        price: '$67,741.90',
        change24h: '+1.5%',
        color: '#F7931A',
        decimals: 8,
        chain: 'bitcoin'
      },
      {
        id: '3',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '125,000',
        value: '$125,000.00',
        price: '$1.00',
        change24h: '0.0%',
        color: '#2775CA',
        decimals: 6,
        chain: 'ethereum'
      }
    ]
  }),
  
  getAssetDetail: (symbol: string) => Promise.resolve({
    success: true,
    data: {
      id: '1',
      symbol,
      name: symbol === 'ETH' ? 'Ethereum' : symbol === 'BTC' ? 'Bitcoin' : 'USD Coin',
      balance: symbol === 'ETH' ? '4.72' : symbol === 'BTC' ? '0.42' : '125,000',
      value: symbol === 'ETH' ? '$16,540.80' : symbol === 'BTC' ? '$28,451.40' : '$125,000.00',
      price: symbol === 'ETH' ? '$3,506.95' : symbol === 'BTC' ? '$67,741.90' : '$1.00',
      change24h: symbol === 'ETH' ? '+2.8%' : symbol === 'BTC' ? '+1.5%' : '0.0%',
      color: symbol === 'ETH' ? '#627EEA' : symbol === 'BTC' ? '#F7931A' : '#2775CA',
      decimals: symbol === 'ETH' ? 18 : symbol === 'BTC' ? 8 : 6,
      chain: symbol === 'ETH' || symbol === 'USDC' ? 'ethereum' : 'bitcoin'
    }
  }),
  
  getTotalBalance: () => Promise.resolve({
    success: true,
    data: { total: '$241,130.47', change24h: '+2.8%' }
  }),
  
  getTransactionHistory: (params?: { page?: number; limit?: number }) =>
    Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          type: 'send',
          asset: 'ETH',
          amount: '0.5',
          to: '0x742d35Cc6634C0532925a3b8B9C4B5f2F',
          hash: '0x123...abc',
          status: 'completed',
          timestamp: '2023-10-15T14:30:00Z',
          fee: '0.0012'
        }
      ]
    }),
  
  getPortfolioAnalytics: () => Promise.resolve({
    success: true,
    data: {
      totalValue: '$241,130.47',
      totalChange24h: '+2.8%',
      assetDistribution: [
        { symbol: 'ETH', name: 'Ethereum', value: '$16,540.80', percentage: 6.8, color: '#627EEA' },
        { symbol: 'BTC', name: 'Bitcoin', value: '$28,451.40', percentage: 11.8, color: '#F7931A' },
        { symbol: 'USDC', name: 'USD Coin', value: '$125,000.00', percentage: 51.8, color: '#2775CA' }
      ],
      recentTransactions: [],
      performanceHistory: []
    }
  }),
}

// 交易相关API
export const transactionApi = {
  // 发送交易 - 调用后端链交易端点
  sendTransaction: (data: {
    from: string
    to: string
    value: string
    data?: string
  }) => apiClient.post('/chain/transaction', data),
  
  // 接收交易 - 模拟功能（前端展示）
  receiveTransaction: (data: { asset: string; amount?: string }) =>
    Promise.resolve({
      success: true,
      data: { address: '0x742d35Cc6634C0532925a3b8B9C4B5f2F', qrCode: 'mock_qr_code' }
    }),
  
  // 资产交换 - 模拟功能
  swapAssets: (data: { fromAsset: string; toAsset: string; amount: string }) =>
    Promise.resolve({
      success: true,
      data: { transactionId: 'mock_swap_tx_id', estimatedOutput: data.amount }
    }),
  
  // 获取交易状态 - 调用后端链交易查询端点
  getTransactionStatus: (txHash: string) => apiClient.get(`/chain/transaction/${txHash}`),
  
  // 获取费用估算 - 模拟功能
  getFeeEstimate: (data: { asset: string; to: string; amount: string }) =>
    Promise.resolve({
      success: true,
      data: { fee: '0.0012', priority: 'medium' }
    }),
}

// 安全设置API（模拟数据，后续可替换为真实数据）
export const securityApi = {
  getSecuritySettings: () => Promise.resolve({
    success: true,
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
      loginAlerts: true,
      transactionAlerts: true,
      withdrawalWhitelist: false,
      ipWhitelist: [],
      sessionTimeout: 60,
      biometricEnabled: true,
      passkeyEnabled: true
    }
  }),
  
  updateSecuritySettings: (data: any) => Promise.resolve({
    success: true,
    data: { success: true, message: '安全设置已更新' }
  }),
  
  getTwoFactorStatus: () => Promise.resolve({
    success: true,
    data: { enabled: true, method: 'authenticator' }
  }),
  
  enableTwoFactor: (data: any) => Promise.resolve({
    success: true,
    data: { success: true, secret: 'MOCK_SECRET', qrCode: 'mock_qr_code' }
  }),
  
  disableTwoFactor: () => Promise.resolve({
    success: true,
    data: { success: true, message: '双因素认证已禁用' }
  }),
  
  getLoginHistory: (params?: { page?: number; limit?: number }) =>
    Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          timestamp: '2024-01-15T14:30:00Z',
          device: 'MacBook Pro',
          ipAddress: '192.168.1.100',
          location: '上海',
          status: 'success'
        }
      ]
    }),
  
  getDevices: () => Promise.resolve({
    success: true,
    data: [
      {
        id: '1',
        name: 'MacBook Pro',
        type: 'desktop',
        os: 'macOS 14.2',
        browser: 'Chrome 121',
        lastActive: '2024-01-15T14:30:00Z',
        ipAddress: '192.168.1.100',
        isCurrent: true
      }
    ]
  }),
  
  revokeDevice: (deviceId: string) => Promise.resolve({
    success: true,
    data: { success: true, message: '设备已撤销' }
  }),
}

// 团队协作API（模拟数据，后续可替换为真实数据）
export const teamApi = {
  getTeamMembers: () => Promise.resolve({
    success: true,
    data: [
      {
        id: '1',
        email: 'alice@company.com',
        name: 'Alice Johnson',
        role: 'admin',
        status: 'active',
        joinedAt: '2024-01-15T10:30:00Z',
        lastActive: '2025-02-14T09:15:00Z',
        permissions: ['view', 'spend', 'approve', 'manage']
      },
      {
        id: '2',
        email: 'bob@company.com',
        name: 'Bob Smith',
        role: 'approver',
        status: 'active',
        joinedAt: '2024-02-20T14:20:00Z',
        lastActive: '2025-02-14T08:45:00Z',
        permissions: ['view', 'approve']
      }
    ]
  }),
  
  inviteMember: (data: { email: string; role: string }) =>
    Promise.resolve({
      success: true,
      data: { success: true, invitationId: 'mock_invitation_id' }
    }),
  
  updateMemberRole: (memberId: string, role: string) =>
    Promise.resolve({
      success: true,
      data: { success: true, message: '角色已更新' }
    }),
  
  removeMember: (memberId: string) =>
    Promise.resolve({
      success: true,
      data: { success: true, message: '成员已移除' }
    }),
  
  getTeamWallets: () => Promise.resolve({
    success: true,
    data: [
      {
        id: '1',
        name: '公司运营钱包',
        address: '0x742d35Cc6634C0532925a3b8B9C4B5f2F',
        chain: 'ethereum',
        balance: '12.5 ETH',
        requiredApprovals: 2,
        members: [
          { id: '1', role: 'admin' },
          { id: '2', role: 'approver' }
        ],
        createdAt: '2024-01-10T08:00:00Z'
      }
    ]
  }),
  
  createTeamWallet: (data: any) => Promise.resolve({
    success: true,
    data: { success: true, walletId: 'mock_wallet_id' }
  }),
  
  getApprovalRequests: (params?: { status?: string; page?: number; limit?: number }) =>
    Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          type: 'transaction',
          status: 'pending',
          initiator: {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@company.com'
          },
          data: { amount: '1.5 ETH', to: '0x123...' },
          approvals: [],
          requiredApprovals: 2,
          currentApprovals: 0,
          createdAt: '2025-02-14T09:00:00Z'
        }
      ]
    }),
  
  approveRequest: (requestId: string, data: any) =>
    Promise.resolve({
      success: true,
      data: { success: true, message: '请求已批准' }
    }),
  
  rejectRequest: (requestId: string, reason: string) =>
    Promise.resolve({
      success: true,
      data: { success: true, message: '请求已拒绝' }
    }),
}

// MPC服务API（通过后端API调用）
export const mpcApi = {
  // 初始化密钥生成
  initiateKeyGeneration: (data: { participants: string[]; threshold: number; total_shares: number }) =>
    apiClient.post('/mpc/keygen', data),
  
  // 获取密钥生成状态
  getKeyGenerationStatus: (sessionId: string) => apiClient.get(`/mpc/keygen/${sessionId}`),
  
  // 初始化签名
  initiateSigning: (data: { message: string; participants: string[]; session_id?: string }) =>
    apiClient.post('/mpc/sign', data),
  
  // 获取签名状态
  getSigningStatus: (sessionId: string) => apiClient.get(`/mpc/sign/${sessionId}`),
  
  // 密钥备份（模拟功能）
  backupKeyShare: (data: any) => Promise.resolve({
    success: true,
    data: { success: true, backupId: 'mock_backup_id' }
  }),
  
  // 密钥恢复（模拟功能）
  recoverKeyShare: (data: any) => Promise.resolve({
    success: true,
    data: { success: true, recovered: true }
  }),
}

// 导出axios实例供自定义请求使用
export default apiClient