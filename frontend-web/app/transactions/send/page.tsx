'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpRight, 
  Wallet, 
  Copy, 
  Scan, 
  Clock, 
  AlertCircle,
  ChevronDown,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { transactionApi, assetApi } from '@/lib/api-client'
import { Asset } from '@/lib/types'

export default function SendTransactionPage() {
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([
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

  const [formData, setFormData] = useState({
    asset: 'BTC',
    toAddress: '',
    amount: '',
    memo: '',
    feePriority: 'medium' as 'low' | 'medium' | 'high'
  })

  const [transactionDetails, setTransactionDetails] = useState({
    estimatedFee: '0.001 BTC',
    totalAmount: '0.5 BTC',
    estimatedTime: '10-30 分钟',
    networkStatus: '正常'
  })

  const [transactionResult, setTransactionResult] = useState({
    hash: '0xabc123def456ghi789jkl012mno345pqr678',
    status: 'pending',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      // 实际API调用
      // const data = await assetApi.getAssets()
      // setAssets(data)
    } catch (error) {
      console.error('加载资产失败:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMaxAmount = () => {
    const selectedAsset = assets.find(a => a.symbol === formData.asset)
    if (selectedAsset) {
      setFormData(prev => ({ ...prev, amount: selectedAsset.balance }))
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 简单验证
    if (!formData.toAddress || !formData.amount) {
      alert('请填写收款地址和金额')
      return
    }

    setIsLoading(true)
    try {
      // 实际API调用 - 获取费用估算
      // const feeEstimate = await transactionApi.getFeeEstimate({
      //   asset: formData.asset,
      //   to: formData.toAddress,
      //   amount: formData.amount
      // })
      
      // 模拟费用计算
      const estimatedFee = '0.001 BTC'
      const totalAmount = formData.amount
      
      setTransactionDetails({
        estimatedFee,
        totalAmount,
        estimatedTime: '10-30 分钟',
        networkStatus: '正常'
      })
      
      setStep('review')
    } catch (error) {
      console.error('获取交易详情失败:', error)
      alert('获取交易详情失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      // 实际API调用
      // const result = await transactionApi.sendTransaction({
      //   to: formData.toAddress,
      //   amount: formData.amount,
      //   asset: formData.asset,
      //   memo: formData.memo,
      //   feePriority: formData.feePriority
      // })
      
      // 模拟成功响应
      setTimeout(() => {
        setTransactionResult({
          hash: '0xabc123def456ghi789jkl012mno345pqr678',
          status: 'pending',
          timestamp: new Date().toISOString()
        })
        setStep('success')
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('发送交易失败:', error)
      alert('发送交易失败，请稍后重试')
      setIsLoading(false)
    }
  }

  const selectedAsset = assets.find(a => a.symbol === formData.asset)

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
                <Link href="/transactions" className="text-gray-300 hover:text-primary-400 transition-colors">交易记录</Link>
                <Link href="/security" className="text-gray-300 hover:text-primary-400 transition-colors">安全</Link>
                <Link href="/team" className="text-gray-300 hover:text-primary-400 transition-colors">团队</Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/transactions" className="text-gray-300 hover:text-primary-400">
                取消
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">发送交易</h1>
            <p className="text-gray-400 mt-2">安全地发送数字资产到其他地址</p>
          </div>

          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className={`flex items-center ${step === 'form' ? 'text-primary-400' : step === 'review' || step === 'success' ? 'text-success-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' ? 'bg-primary-600' : step === 'review' || step === 'success' ? 'bg-success-600' : 'bg-secondary-700'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">填写信息</span>
              </div>
              <div className={`h-0.5 w-16 ${step === 'review' || step === 'success' ? 'bg-success-600' : 'bg-secondary-700'}`}></div>
              <div className={`flex items-center ${step === 'review' ? 'text-primary-400' : step === 'success' ? 'text-success-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary-600' : step === 'success' ? 'bg-success-600' : 'bg-secondary-700'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">确认交易</span>
              </div>
              <div className={`h-0.5 w-16 ${step === 'success' ? 'bg-success-600' : 'bg-secondary-700'}`}></div>
              <div className={`flex items-center ${step === 'success' ? 'text-success-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-success-600' : 'bg-secondary-700'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">完成</span>
              </div>
            </div>
          </div>

          {/* 表单步骤 */}
          {step === 'form' && (
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <form onSubmit={handleReview} className="space-y-6">
                {/* 选择资产 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    选择资产
                  </label>
                  <div className="relative">
                    <select
                      name="asset"
                      value={formData.asset}
                      onChange={handleInputChange}
                      className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                    >
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.symbol}>
                          {asset.name} ({asset.symbol}) - 余额: {asset.balance}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedAsset && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-400">可用余额: {selectedAsset.balance} {selectedAsset.symbol}</span>
                      <button
                        type="button"
                        onClick={handleMaxAmount}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        全部发送
                      </button>
                    </div>
                  )}
                </div>

                {/* 收款地址 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    收款地址
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="toAddress"
                      value={formData.toAddress}
                      onChange={handleInputChange}
                      placeholder="请输入收款人的钱包地址"
                      className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.readText().then(text => setFormData(prev => ({ ...prev, toAddress: text })))}
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <Scan className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 金额 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    发送金额
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-2xl font-bold"
                  />
                  {selectedAsset && formData.amount && (
                    <div className="mt-2 text-sm text-gray-400">
                      约 ${(parseFloat(formData.amount) * parseFloat(selectedAsset.price.replace('$', ''))).toLocaleString()} USD
                    </div>
                  )}
                </div>

                {/* 手续费优先级 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    手续费优先级
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, feePriority: 'low' }))}
                      className={`py-3 rounded-lg ${formData.feePriority === 'low' ? 'bg-blue-900/30 border border-blue-700 text-blue-400' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'}`}
                    >
                      低速
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, feePriority: 'medium' }))}
                      className={`py-3 rounded-lg ${formData.feePriority === 'medium' ? 'bg-primary-900/30 border border-primary-700 text-primary-400' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'}`}
                    >
                      标准
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, feePriority: 'high' }))}
                      className={`py-3 rounded-lg ${formData.feePriority === 'high' ? 'bg-success-900/30 border border-success-700 text-success-400' : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'}`}
                    >
                      快速
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    {formData.feePriority === 'low' && '较低费用，处理时间可能较长'}
                    {formData.feePriority === 'medium' && '平衡费用与速度，推荐选择'}
                    {formData.feePriority === 'high' && '较高费用，最快处理速度'}
                  </div>
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    备注（可选）
                  </label>
                  <textarea
                    name="memo"
                    value={formData.memo}
                    onChange={handleInputChange}
                    placeholder="添加交易备注"
                    rows={3}
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 安全提示 */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-blue-300">安全提示：</strong>
                      <span className="text-blue-400/80">
                        请仔细核对收款地址。区块链交易不可逆转，一旦发送无法撤回。建议先发送小额测试交易。
                      </span>
                    </div>
                  </div>
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.toAddress || !formData.amount}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      计算费用...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5 mr-2" />
                      继续
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 确认步骤 */}
          {step === 'review' && (
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <div className="space-y-6">
                {/* 交易概览 */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-900/30 mb-4">
                    <ArrowUpRight className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">确认交易</h3>
                  <p className="text-gray-400">请仔细核对以下交易信息</p>
                </div>

                {/* 交易详情 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">发送资产</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${selectedAsset?.color} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{selectedAsset?.symbol.charAt(0)}</span>
                      </div>
                      <span className="text-white font-medium">{selectedAsset?.name} ({selectedAsset?.symbol})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">发送金额</span>
                    <span className="text-white text-xl font-bold">{formData.amount} {selectedAsset?.symbol}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">收款地址</span>
                    <span className="text-white font-mono text-sm truncate max-w-[200px]">
                      {formData.toAddress}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">预计手续费</span>
                    <span className="text-white font-medium">{transactionDetails.estimatedFee}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">预计处理时间</span>
                    <span className="text-white font-medium">{transactionDetails.estimatedTime}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">网络状态</span>
                    <span className="badge-success">{transactionDetails.networkStatus}</span>
                  </div>

                  {formData.memo && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">备注</span>
                      <span className="text-white font-medium">{formData.memo}</span>
                    </div>
                  )}
                </div>

                {/* 安全确认 */}
                <div className="bg-secondary-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="confirmTransaction"
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="confirmTransaction" className="text-sm text-gray-300">
                      我确认已仔细核对收款地址和金额，并理解此交易不可逆转。
                    </label>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="py-3 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 transition-colors font-medium"
                  >
                    返回修改
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                        处理中...
                      </>
                    ) : (
                      '确认发送'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 成功步骤 */}
          {step === 'success' && (
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <div className="text-center space-y-6">
                {/* 成功图标 */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-900/30 mb-4">
                  <CheckCircle className="w-10 h-10 text-success-400" />
                </div>

                {/* 成功信息 */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">交易已提交</h3>
                  <p className="text-gray-400">
                    您的交易已成功提交到区块链网络，正在等待确认。
                  </p>
                </div>

                {/* 交易哈希 */}
                <div className="bg-secondary-900/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">交易哈希</div>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-white font-mono text-sm truncate">
                      {transactionResult.hash}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(transactionResult.hash)}
                      className="p-1 text-gray-400 hover:text-gray-300"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    您可以在交易记录页面查看处理状态。
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/transactions"
                    className="py-3 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 transition-colors font-medium text-center"
                  >
                    查看交易记录
                  </Link>
                  <Link
                    href="/dashboard"
                    className="py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                  >
                    返回仪表板
                  </Link>
                </div>

                {/* 区块链浏览器链接 */}
                <div className="pt-4 border-t border-secondary-700">
                  <a
                    href={`https://etherscan.io/tx/${transactionResult.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                  >
                    在区块链浏览器中查看
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}