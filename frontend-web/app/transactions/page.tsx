'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { transactionApi } from '@/lib/api-client'
import { Transaction } from '@/lib/types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: '1', 
      type: 'send', 
      asset: 'BTC', 
      amount: '0.5 BTC', 
      from: '0x1a2b...c3d4',
      to: '0x8f9c...b2a4', 
      hash: '0xabc123...def456',
      status: 'completed', 
      timestamp: '2024-01-15T14:30:00Z',
      fee: '0.001 BTC',
      memo: '供应商付款'
    },
    { 
      id: '2', 
      type: 'swap', 
      asset: 'ETH', 
      amount: '10 ETH → USDC', 
      from: '0x1a2b...c3d4',
      to: '兑换池',
      hash: '0xdef456...ghi789',
      status: 'completed', 
      timestamp: '2024-01-14T11:20:00Z',
      fee: '0.02 ETH'
    },
    { 
      id: '3', 
      type: 'receive', 
      asset: 'SOL', 
      amount: '25 SOL', 
      from: '0x3a5d...e7f9',
      to: '0x1a2b...c3d4',
      hash: '0xghi789...jkl012',
      status: 'completed', 
      timestamp: '2024-01-13T09:15:00Z',
      fee: '0.001 SOL'
    },
    { 
      id: '4', 
      type: 'stake', 
      asset: 'ETH', 
      amount: '5 ETH', 
      from: '0x1a2b...c3d4',
      to: '质押合约',
      hash: '0xjkl012...mno345',
      status: 'pending', 
      timestamp: '2024-01-12T16:45:00Z',
      fee: '0.01 ETH'
    },
    { 
      id: '5', 
      type: 'send', 
      asset: 'USDC', 
      amount: '5,000 USDC', 
      from: '0x1a2b...c3d4',
      to: '0x9abc...def1', 
      hash: '0xmno345...pqr678',
      status: 'failed', 
      timestamp: '2024-01-11T10:05:00Z',
      fee: '2 USDC',
      memo: '支付失败'
    },
    { 
      id: '6', 
      type: 'receive', 
      asset: 'BTC', 
      amount: '0.2 BTC', 
      from: '0x7def...abc2',
      to: '0x1a2b...c3d4',
      hash: '0xpqr678...stu901',
      status: 'completed', 
      timestamp: '2024-01-10T08:30:00Z',
      fee: '0.0005 BTC'
    },
  ])

  const [filter, setFilter] = useState('all') // all, send, receive, swap, stake
  const [statusFilter, setStatusFilter] = useState('all') // all, completed, pending, failed
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      // 实际API调用
      // const data = await transactionApi.getTransactionHistory()
      // setTransactions(data)
      
      setTimeout(() => {
        setIsLoading(false)
      }, 600)
    } catch (error) {
      console.error('加载交易记录失败:', error)
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    // 类型过滤
    if (filter !== 'all' && tx.type !== filter) return false
    
    // 状态过滤
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.asset.toLowerCase().includes(query) ||
        tx.amount.toLowerCase().includes(query) ||
        (tx.hash && tx.hash.toLowerCase().includes(query)) ||
        (tx.memo && tx.memo.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'pending': return <Clock className="w-4 h-4 text-warning-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-danger-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4 text-danger-500" />
      case 'receive': return <ArrowDownRight className="w-4 h-4 text-success-500" />
      case 'swap': return <AlertCircle className="w-4 h-4 text-primary-500" />
      case 'stake': return <AlertCircle className="w-4 h-4 text-purple-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
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
                <Link href="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">仪表板</Link>
                <Link href="/transactions" className="text-primary-400 font-medium">交易记录</Link>
                <Link href="/security" className="text-gray-300 hover:text-primary-400 transition-colors">安全</Link>
                <Link href="/team" className="text-gray-300 hover:text-primary-400 transition-colors">团队</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/transactions/send" className="btn-primary">发送</Link>
              <Link href="/transactions/receive" className="btn-secondary">接收</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">交易记录</h1>
          <p className="text-gray-400 mt-1">查看和管理您的所有交易记录</p>
        </div>

        {/* 过滤和搜索 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索交易哈希、资产、金额..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 类型过滤 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilter('send')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'send' ? 'bg-danger-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                <ArrowUpRight className="w-4 h-4" />
                发送
              </button>
              <button
                onClick={() => setFilter('receive')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${filter === 'receive' ? 'bg-success-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                <ArrowDownRight className="w-4 h-4" />
                接收
              </button>
            </div>

            {/* 状态过滤 */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg ${statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                全部状态
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusFilter === 'completed' ? 'bg-success-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                <CheckCircle className="w-4 h-4" />
                已完成
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${statusFilter === 'pending' ? 'bg-warning-600 text-white' : 'bg-secondary-800 text-gray-300 hover:bg-secondary-700'}`}
              >
                <Clock className="w-4 h-4" />
                处理中
              </button>
            </div>
          </div>
        </div>

        {/* 交易表格 */}
        <div className="bg-secondary-800 rounded-2xl border border-secondary-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="py-4 px-6 text-left font-medium text-gray-400">类型</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">资产</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">金额</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">状态</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">时间</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">手续费</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">备注</th>
                  <th className="py-4 px-6 text-left font-medium text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      没有找到匹配的交易记录
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-secondary-700 hover:bg-secondary-700/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="capitalize text-white">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">{tx.asset}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-semibold">{tx.amount}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className={`text-sm ${
                            tx.status === 'completed' ? 'text-success-400' :
                            tx.status === 'pending' ? 'text-warning-400' :
                            'text-danger-400'
                          }`}>
                            {tx.status === 'completed' ? '已完成' :
                             tx.status === 'pending' ? '处理中' :
                             '失败'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-3 h-3" />
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-400 text-sm">{tx.fee || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-400 text-sm">{tx.memo || '-'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {tx.hash && (
                            <button 
                              onClick={() => navigator.clipboard.writeText(tx.hash!)}
                              className="text-primary-400 hover:text-primary-300 text-sm"
                            >
                              复制哈希
                            </button>
                          )}
                          <Link 
                            href={`/transactions/${tx.id}`}
                            className="text-gray-400 hover:text-gray-300 text-sm"
                          >
                            详情
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="border-t border-secondary-700 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                显示 {filteredTransactions.length} 条记录
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 disabled:opacity-50">
                  上一页
                </button>
                <button className="px-3 py-1 bg-primary-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600">
                  2
                </button>
                <button className="px-3 py-1 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600">
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 交易统计 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="text-sm text-gray-400 mb-1">总交易数</div>
            <div className="text-2xl font-bold text-white">{transactions.length}</div>
          </div>
          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="text-sm text-gray-400 mb-1">发送交易</div>
            <div className="text-2xl font-bold text-danger-400">
              {transactions.filter(tx => tx.type === 'send').length}
            </div>
          </div>
          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="text-sm text-gray-400 mb-1">接收交易</div>
            <div className="text-2xl font-bold text-success-400">
              {transactions.filter(tx => tx.type === 'receive').length}
            </div>
          </div>
          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="text-sm text-gray-400 mb-1">成功率</div>
            <div className="text-2xl font-bold text-success-400">
              {Math.round((transactions.filter(tx => tx.status === 'completed').length / transactions.length) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}