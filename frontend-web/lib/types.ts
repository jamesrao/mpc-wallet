// 用户类型
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin' | 'manager'
  isVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

// 资产类型
export interface Asset {
  id: string
  symbol: string
  name: string
  balance: string
  value: string
  price: string
  change24h: string
  color: string
  icon?: string
  decimals: number
  chain: string
}

// 交易类型
export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake'
  asset: string
  amount: string
  from?: string
  to?: string
  hash?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp: string
  fee?: string
  memo?: string
}

// 投资组合分析
export interface PortfolioAnalytics {
  totalValue: string
  totalChange24h: string
  assetDistribution: Array<{
    symbol: string
    name: string
    value: string
    percentage: number
    color: string
  }>
  recentTransactions: Transaction[]
  performanceHistory: Array<{
    date: string
    value: string
  }>
}

// 安全设置
export interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod?: 'authenticator' | 'sms' | 'email'
  loginAlerts: boolean
  transactionAlerts: boolean
  withdrawalWhitelist: boolean
  ipWhitelist?: string[]
  sessionTimeout: number // 分钟
  biometricEnabled: boolean
  passkeyEnabled: boolean
}

// 设备信息
export interface Device {
  id: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  os: string
  browser?: string
  lastActive: string
  ipAddress: string
  isCurrent: boolean
}

// 登录历史
export interface LoginHistory {
  id: string
  timestamp: string
  device: string
  ipAddress: string
  location?: string
  status: 'success' | 'failed'
  failureReason?: string
}

// 团队成员
export interface TeamMember {
  id: string
  email: string
  name: string
  role: 'viewer' | 'spender' | 'approver' | 'admin'
  status: 'active' | 'pending' | 'suspended'
  joinedAt: string
  lastActive?: string
  permissions: string[]
}

// 团队钱包
export interface TeamWallet {
  id: string
  name: string
  address: string
  chain: string
  balance: string
  requiredApprovals: number
  members: Array<{
    id: string
    role: string
  }>
  createdAt: string
}

// 审批请求
export interface ApprovalRequest {
  id: string
  type: 'transaction' | 'member_invite' | 'wallet_creation'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  initiator: {
    id: string
    name: string
    email: string
  }
  data: any
  approvals: Array<{
    memberId: string
    name: string
    approved: boolean
    timestamp?: string
    comment?: string
  }>
  requiredApprovals: number
  currentApprovals: number
  createdAt: string
  expiresAt?: string
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 交易请求
export interface SendTransactionRequest {
  to: string
  amount: string
  asset: string
  memo?: string
  feePriority?: 'low' | 'medium' | 'high'
}

export interface SwapRequest {
  fromAsset: string
  toAsset: string
  amount: string
  slippageTolerance?: number
}

// MPC相关类型
export interface KeyShare {
  id: string
  index: number
  status: 'active' | 'backed_up' | 'compromised'
  createdAt: string
  lastUsed?: string
}

export interface SignatureRequest {
  message: string
  hash: string
  chainId: number
  nonce?: number
}

export interface SignatureResponse {
  signature: string
  publicKey: string
  timestamp: string
}