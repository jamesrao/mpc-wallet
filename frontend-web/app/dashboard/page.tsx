'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart,
  RefreshCw,
  Shield,
  Users,
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react'
import { assetApi } from '@/lib/api-client'
import { Asset, Transaction, PortfolioAnalytics } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions' | 'analytics'>('assets')
  const [isLoading, setIsLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState('$241,130.47')
  const [totalChange, setTotalChange] = useState('+2.8%')
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [analytics, setAnalytics] = useState<PortfolioAnalytics>({
    totalValue: '$241,130.47',
    totalChange24h: '+2.8%',
    assetDistribution: [],
    recentTransactions: [],
    performanceHistory: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // 实际API调用
      const [assetsResponse, balanceResponse, transactionsResponse] = await Promise.all([
        assetApi.getAssets(),
        assetApi.getTotalBalance(),
        assetApi.getTransactionHistory({ page: 1, limit: 4 })
      ])
      
      // 更新资产数据
      if (assetsResponse.success) {
        setAssets(assetsResponse.data)
      }
      
      // 更新总资产余额
      if (balanceResponse.success) {
        setTotalBalance(balanceResponse.data.total)
        setTotalChange(balanceResponse.data.change24h)
      }
      
      // 更新交易数据
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data as Transaction[])
      }
      
      // 更新分析数据（基于资产数据计算）
      if (assetsResponse.success) {
        const totalValue = assetsResponse.data.reduce((sum, asset) => {
          const value = parseFloat(asset.value.replace(/[$,]/g, ''))
          return sum + value
        }, 0)
        
        const assetDistribution = assetsResponse.data.map(asset => {
          const value = parseFloat(asset.value.replace(/[$,]/g, ''))
          const percentage = (value / totalValue) * 100
          return {
            symbol: asset.symbol,
            name: asset.name,
            value: asset.value,
            percentage: parseFloat(percentage.toFixed(1)),
            color: asset.color
          }
        })
        
        setAnalytics({
          totalValue: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalChange24h: totalChange,
          assetDistribution,
          recentTransactions: transactionsResponse.success ? (transactionsResponse.data as Transaction[]).slice(0, 3) : [],
          performanceHistory: [
            { date: '2024-01-01', value: `$${(totalValue * 0.95).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { date: '2024-01-05', value: `$${(totalValue * 0.97).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { date: '2024-01-10', value: `$${(totalValue * 0.98).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { date: '2024-01-15', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          ]
        })
      }
      
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果API调用失败，使用模拟数据作为后备
      setAssets([
        { 
          id: '1', 
          symbol: 'BTC', 
          name: '比特币', 
          balance: '2.5432', 
          value: '$128,450.32', 
          price: '$50,500.00', 
          change24h: '+3.24%', 
          color: 'bg-orange-500', 
          decimals: 8, 
          chain: 'Bitcoin' 
        },
        { 
          id: '2', 
          symbol: 'ETH', 
          name: '以太坊', 
          balance: '15.832', 
          value: '$45,230.15', 
          price: '$2,856.00', 
          change24h: '+1.78%', 
          color: 'bg-gray-700', 
          decimals: 18, 
          chain: 'Ethereum' 
        },
        { 
          id: '3', 
          symbol: 'SOL', 
          name: 'Solana', 
          balance: '125.5', 
          value: '$18,450.00', 
          price: '$147.00', 
          change24h: '+5.42%', 
          color: 'bg-purple-600', 
          decimals: 9, 
          chain: 'Solana' 
        },
        { 
          id: '4', 
          symbol: 'USDC', 
          name: 'USD Coin', 
          balance: '50,000', 
          value: '$50,000.00', 
          price: '$1.00', 
          change24h: '0.00%', 
          color: 'bg-blue-500', 
          decimals: 6, 
          chain: 'Ethereum' 
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 to-gray-900">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 border-b border-secondary-700 bg-secondary-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-white">MPC钱包</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-primary-400 font-medium">仪表板</Link>
                <Link href="/transactions" className="text-gray-300 hover:text-primary-400 transition-colors">交易</Link>
                <Link href="/security" className="text-gray-300 hover:text-primary-400 transition-colors">安全</Link>
                <Link href="/team" className="text-gray-300 hover:text-primary-400 transition-colors">团队</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-primary-400">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-300 hover:text-primary-400">
                <Settings className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和操作 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">资产管理仪表板</h1>
              <p className="text-gray-400 mt-1">实时查看和管理您的数字资产</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-300 hover:text-primary-400 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                href="/transactions/send"
                className="btn-primary flex items-center"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                发送
              </Link>
              <Link 
                href="/transactions/receive"
                className="btn-secondary flex items-center"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                接收
              </Link>
            </div>
          </div>

          {/* 总资产卡片 */}
          <div className="bg-gradient-to-r from-primary-900/20 to-accent-900/20 rounded-2xl p-6 border border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-2">总资产价值</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{totalBalance}</span>
                  <span className="ml-4 text-success-400 font-medium flex items-center">
                    <TrendingUp className="w-5 h-5 mr-1" />
                    {totalChange} 今日
                  </span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{assets.length}</div>
                  <div className="text-sm text-gray-400">资产种类</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{transactions.length}</div>
                  <div className="text-sm text-gray-400">总交易数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-sm text-gray-400">支持链</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：资产和交易 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 选项卡 */}
            <div className="flex border-b border-secondary-700">
              <button
                className={`px-4 py-3 font-medium ${activeTab === 'assets' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('assets')}
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                我的资产
              </button>
              <button
                className={`px-4 py-3 font-medium ${activeTab === 'transactions' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('transactions')}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                最近交易
              </button>
              <button
                className={`px-4 py-3 font-medium ${activeTab === 'analytics' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('analytics')}
              >
                <PieChart className="w-4 h-4 inline mr-2" />
                分析
              </button>
            </div>

            {/* 资产表格 */}
            {activeTab === 'assets' && (
              <div className="bg-secondary-800 rounded-2xl border border-secondary-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">资产详情</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assets.map((asset) => (
                        <div 
                          key={asset.id} 
                          className="flex items-center justify-between p-4 hover:bg-secondary-700/50 rounded-xl transition-colors"
                        >
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full ${asset.color} flex items-center justify-center mr-4`}>
                              <span className="text-white font-bold">{asset.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-white">{asset.name}</div>
                              <div className="text-sm text-gray-400">余额: {asset.balance} {asset.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{asset.value}</div>
                            <div className={`text-sm ${asset.change24h.startsWith('+') ? 'text-success-400' : 'text-danger-400'}`}>
                              {asset.change24h}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-secondary-700 p-4">
                  <Link 
                    href="/assets"
                    className="text-primary-400 hover:text-primary-300 font-medium flex items-center justify-center"
                  >
                    查看全部资产
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}

            {/* 交易表格 */}
            {activeTab === 'transactions' && (
              <div className="bg-secondary-800 rounded-2xl border border-secondary-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">最近交易</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between p-4 hover:bg-secondary-700/50 rounded-xl transition-colors"
                        >
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full ${
                              tx.type === 'send' ? 'bg-danger-900/30 text-danger-400' :
                              tx.type === 'receive' ? 'bg-success-900/30 text-success-400' :
                              'bg-primary-900/30 text-primary-400'
                            } flex items-center justify-center mr-4`}>
                              {tx.type === 'send' ? <ArrowUpRight className="w-6 h-6" /> :
                               tx.type === 'receive' ? <ArrowDownRight className="w-6 h-6" /> :
                               <RefreshCw className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="font-semibold text-white capitalize">{tx.type} · {tx.asset}</div>
                              <div className="text-sm text-gray-400 truncate max-w-[200px]">
                                {tx.hash || tx.to || tx.from}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{tx.amount}</div>
                            <div className={`text-sm ${
                              tx.status === 'completed' ? 'text-success-400' :
                              tx.status === 'pending' ? 'text-warning-400' :
                              'text-danger-400'
                            }`}>
                              {tx.status === 'completed' ? '已完成' :
                               tx.status === 'pending' ? '处理中' :
                               '失败'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-secondary-700 p-4">
                  <Link 
                    href="/transactions"
                    className="text-primary-400 hover:text-primary-300 font-medium flex items-center justify-center"
                  >
                    查看全部交易
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}

            {/* 分析内容 */}
            {activeTab === 'analytics' && (
              <div className="bg-secondary-800 rounded-2xl border border-secondary-700 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">投资组合分析</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* 资产分布 */}
                      <div>
                        <h4 className="font-medium text-gray-300 mb-4">资产分布</h4>
                        <div className="space-y-3">
                          {analytics.assetDistribution.map((asset) => (
                            <div key={asset.symbol} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full ${asset.color} mr-2`}></div>
                                  <span className="text-gray-300">{asset.symbol}</span>
                                </div>
                                <div className="text-white font-medium">
                                  {asset.value} ({asset.percentage}%)
                                </div>
                              </div>
                              <div className="w-full bg-secondary-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${asset.color}`}
                                  style={{ width: `${asset.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 性能历史 */}
                      <div>
                        <h4 className="font-medium text-gray-300 mb-4">资产价值变化</h4>
                        <div className="bg-secondary-900/50 rounded-xl p-4">
                          <div className="space-y-2">
                            {analytics.performanceHistory.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">{item.date}</span>
                                <span className="font-medium text-white">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：快速操作和统计 */}
          <div className="space-y-6">
            {/* 快速操作卡片 */}
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">快速操作</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/transactions/send"
                  className="flex flex-col items-center justify-center p-4 bg-secondary-700 hover:bg-secondary-600 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-danger-900/30 flex items-center justify-center mb-2">
                    <ArrowUpRight className="w-5 h-5 text-danger-400" />
                  </div>
                  <span className="text-sm font-medium text-white">发送</span>
                </Link>
                <Link 
                  href="/transactions/receive"
                  className="flex flex-col items-center justify-center p-4 bg-secondary-700 hover:bg-secondary-600 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-success-900/30 flex items-center justify-center mb-2">
                    <ArrowDownRight className="w-5 h-5 text-success-400" />
                  </div>
                  <span className="text-sm font-medium text-white">接收</span>
                </Link>
                <Link 
                  href="/swap"
                  className="flex flex-col items-center justify-center p-4 bg-secondary-700 hover:bg-secondary-600 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-900/30 flex items-center justify-center mb-2">
                    <RefreshCw className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-white">兑换</span>
                </Link>
                <Link 
                  href="/staking"
                  className="flex flex-col items-center justify-center p-4 bg-secondary-700 hover:bg-secondary-600 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center mb-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white">质押</span>
                </Link>
              </div>
            </div>

            {/* 安全状态卡片 */}
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">安全状态</h3>
                <Shield className="w-5 h-5 text-success-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">双重认证</span>
                  <span className="badge-success">已启用</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Passkey登录</span>
                  <span className="badge-success">已设置</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">登录提醒</span>
                  <span className="badge-success">开启中</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">设备管理</span>
                  <span className="badge-warning">1个设备</span>
                </div>
              </div>
              <Link 
                href="/security"
                className="mt-4 w-full py-2 bg-secondary-700 hover:bg-secondary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                查看安全设置
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {/* 团队协作卡片 */}
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">团队协作</h3>
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">团队成员</span>
                  <span className="text-sm text-white font-medium">3人</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">团队钱包</span>
                  <span className="text-sm text-white font-medium">2个</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">待审批请求</span>
                  <span className="badge-warning">2个</span>
                </div>
              </div>
              <Link 
                href="/team"
                className="mt-4 w-full py-2 bg-secondary-700 hover:bg-secondary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                管理团队
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}