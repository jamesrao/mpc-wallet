'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowDownRight, 
  Copy, 
  QrCode, 
  Share2, 
  CheckCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { assetApi } from '@/lib/api-client'
import { Asset } from '@/lib/types'

export default function ReceiveTransactionPage() {
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
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

  const [walletAddress, setWalletAddress] = useState('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b')
  const [qrCodeData, setQrCodeData] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  useEffect(() => {
    loadAssets()
    generateQrCode()
  }, [selectedAsset, amount, memo])

  const loadAssets = async () => {
    try {
      // 实际API调用
      // const data = await assetApi.getAssets()
      // setAssets(data)
    } catch (error) {
      console.error('加载资产失败:', error)
    }
  }

  const generateQrCode = () => {
    // 生成二维码数据
    const data = {
      asset: selectedAsset,
      address: walletAddress,
      amount: amount || undefined,
      memo: memo || undefined
    }
    const jsonString = JSON.stringify(data)
    setQrCodeData(jsonString)
    
    // 生成分享链接
    const params = new URLSearchParams()
    params.set('asset', selectedAsset)
    params.set('address', walletAddress)
    if (amount) params.set('amount', amount)
    if (memo) params.set('memo', memo)
    
    const link = `${window.location.origin}/receive?${params.toString()}`
    setGeneratedLink(link)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('分享链接已复制到剪贴板')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `向我的${selectedAsset}钱包付款`,
          text: `我的${selectedAsset}钱包地址：${walletAddress}`,
          url: generatedLink,
        })
      } catch (error) {
        console.log('分享取消:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const selectedAssetData = assets.find(a => a.symbol === selectedAsset)

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
                返回
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">接收资产</h1>
            <p className="text-gray-400 mt-2">分享您的钱包地址或二维码来接收付款</p>
          </div>

          <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
            <div className="space-y-8">
              {/* 选择资产 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  选择要接收的资产
                </label>
                <div className="relative">
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
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
              </div>

              {/* 金额输入（可选） */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  收款金额（可选）
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {selectedAsset}
                  </div>
                </div>
                {selectedAssetData && amount && (
                  <div className="mt-2 text-sm text-gray-400">
                    约 ${(parseFloat(amount) * parseFloat(selectedAssetData.price.replace('$', ''))).toLocaleString()} USD
                  </div>
                )}
              </div>

              {/* 备注（可选） */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  备注（可选）
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="付款目的或备注"
                  className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 钱包地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {selectedAsset} 钱包地址
                </label>
                <div className="bg-secondary-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-white font-mono text-sm truncate flex-1">
                      {walletAddress}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 text-gray-400 hover:text-primary-400"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-success-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {copied ? '已复制到剪贴板' : '点击复制地址'}
                  </div>
                </div>
              </div>

              {/* 二维码 */}
              <div className="text-center">
                <div className="inline-block bg-white p-4 rounded-xl">
                  {/* 模拟二维码 */}
                  <div className="w-64 h-64 bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <QrCode className="w-32 h-32 text-gray-800 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 font-mono">
                        {selectedAsset} Address
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px] mx-auto">
                        {walletAddress.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  扫描二维码即可向此地址付款
                </p>
              </div>

              {/* 分享选项 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">分享选项</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 py-3 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-300" />
                    <span className="text-gray-300">复制链接</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-white">分享</span>
                  </button>
                </div>
              </div>

              {/* 网络信息 */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <div className="text-sm">
                  <strong className="text-blue-300">重要提示：</strong>
                  <ul className="mt-2 space-y-1 text-blue-400/80">
                    <li>• 请确保对方使用正确的网络 ({selectedAssetData?.chain}) 发送资产</li>
                    <li>• 仅向此地址发送 {selectedAsset} 资产</li>
                    <li>• 发送其他资产可能导致永久丢失</li>
                    <li>• 建议先发送小额测试交易</li>
                  </ul>
                </div>
              </div>

              {/* 资产网络信息 */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">{selectedAsset} 网络信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">网络</div>
                    <div className="text-white font-medium">{selectedAssetData?.chain}</div>
                  </div>
                  <div className="bg-secondary-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">精度</div>
                    <div className="text-white font-medium">{selectedAssetData?.decimals} 位小数</div>
                  </div>
                  <div className="bg-secondary-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">推荐矿工费</div>
                    <div className="text-white font-medium">标准</div>
                  </div>
                  <div className="bg-secondary-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">确认时间</div>
                    <div className="text-white font-medium">10-30 分钟</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/transactions"
                  className="py-3 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 transition-colors font-medium text-center"
                >
                  返回交易记录
                </Link>
                <Link
                  href="/dashboard"
                  className="py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                >
                  返回仪表板
                </Link>
              </div>

              {/* 区块链浏览器链接 */}
              <div className="text-center pt-4 border-t border-secondary-700">
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                >
                  在区块链浏览器中查看地址
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}