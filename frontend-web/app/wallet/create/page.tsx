'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, Key, Shield, CheckCircle, AlertCircle, Zap, Users, Globe } from 'lucide-react'
import Link from 'next/link'

export default function CreateWalletPage() {
  const [step, setStep] = useState<'type' | 'details' | 'security' | 'confirm' | 'success'>('type')
  const [walletType, setWalletType] = useState<'personal' | 'team' | 'multi'>('personal')
  const [walletName, setWalletName] = useState('')
  const [selectedChains, setSelectedChains] = useState<string[]>([])
  const [requiredSignatures, setRequiredSignatures] = useState(2)
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔷' },
    { id: 'solana', name: 'Solana', icon: '🟣' },
    { id: 'polygon', name: 'Polygon', icon: '💜' },
    { id: 'bnb', name: 'BNB Chain', icon: '🟡' },
    { id: 'bitcoin', name: 'Bitcoin', icon: '🟠' },
  ]

  const handleChainToggle = (chainId: string) => {
    setSelectedChains(prev => 
      prev.includes(chainId) 
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    )
  }

  const handleNextStep = () => {
    setError('')
    
    if (step === 'type') {
      if (!walletType) {
        setError('请选择钱包类型')
        return
      }
      setStep('details')
    } else if (step === 'details') {
      if (!walletName.trim()) {
        setError('请输入钱包名称')
        return
      }
      if (selectedChains.length === 0) {
        setError('请至少选择一个区块链网络')
        return
      }
      setStep('security')
    } else if (step === 'security') {
      if (walletType === 'team' && teamMembers.length === 0) {
        setError('请至少添加一个团队成员')
        return
      }
      setStep('confirm')
    } else if (step === 'confirm') {
      handleCreateWallet()
    }
  }

  const handlePrevStep = () => {
    setError('')
    if (step === 'details') setStep('type')
    else if (step === 'security') setStep('details')
    else if (step === 'confirm') setStep('security')
  }

  const handleCreateWallet = async () => {
    setIsLoading(true)
    setError('')

    try {
      // 模拟钱包创建API调用
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 模拟成功
      setStep('success')
    } catch (err) {
      setError('钱包创建失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = () => {
    const newMember = `member${teamMembers.length + 1}@company.com`
    setTeamMembers(prev => [...prev, newMember])
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">钱包创建成功！</h3>
            <p className="text-gray-300 mb-6">您的 {walletType === 'personal' ? '个人' : walletType === 'team' ? '团队' : '多签'} 钱包已成功创建</p>
            
            <div className="bg-secondary-900/50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">钱包名称:</span>
                <span className="text-white font-medium">{walletName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">支持网络:</span>
                <span className="text-white font-medium">{selectedChains.length} 个网络</span>
              </div>
              {walletType !== 'personal' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">所需签名:</span>
                  <span className="text-white font-medium">{requiredSignatures}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                查看钱包
              </button>
              <Link 
                href="/transactions/send"
                className="block w-full bg-secondary-800 hover:bg-secondary-700 text-white text-center py-3 px-6 rounded-lg transition-colors"
              >
                开始交易
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 to-gray-900">
      {/* 导航栏 */}
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
            </div>
            <div className="text-gray-400 text-sm">
              步骤 {['type', 'details', 'security', 'confirm'].indexOf(step) + 1}/4
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">创建新钱包</h1>
            <p className="text-gray-400">选择钱包类型并配置安全设置</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* 步骤内容 */}
          <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-8">
            {/* 钱包类型选择 */}
            {step === 'type' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">选择钱包类型</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setWalletType('personal')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      walletType === 'personal' 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-secondary-700 hover:border-primary-500/50'
                    }`}
                  >
                    <Wallet className="w-8 h-8 text-primary-400 mb-3" />
                    <h3 className="text-white font-bold mb-2">个人钱包</h3>
                    <p className="text-gray-400 text-sm">单用户管理，适合个人使用</p>
                  </button>
                  
                  <button
                    onClick={() => setWalletType('team')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      walletType === 'team' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-secondary-700 hover:border-blue-500/50'
                    }`}
                  >
                    <Users className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-white font-bold mb-2">团队钱包</h3>
                    <p className="text-gray-400 text-sm">多用户协作，需要多人审批</p>
                  </button>
                  
                  <button
                    onClick={() => setWalletType('multi')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      walletType === 'multi' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-secondary-700 hover:border-purple-500/50'
                    }`}
                  >
                    <Key className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-white font-bold mb-2">多签钱包</h3>
                    <p className="text-gray-400 text-sm">高级安全，需要指定数量签名</p>
                  </button>
                </div>
              </div>
            )}

            {/* 钱包详情 */}
            {step === 'details' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">配置钱包详情</h2>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">钱包名称</label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="例如：主钱包、运营钱包、储备金钱包"
                    className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-3">支持的区块链网络</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {chains.map(chain => (
                      <button
                        key={chain.id}
                        onClick={() => handleChainToggle(chain.id)}
                        className={`p-3 rounded-lg border transition-all flex items-center space-x-2 ${
                          selectedChains.includes(chain.id)
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-secondary-700 hover:border-primary-500/50'
                        }`}
                      >
                        <span className="text-xl">{chain.icon}</span>
                        <span className="text-white text-sm">{chain.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 安全设置 */}
            {step === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">安全配置</h2>
                
                {walletType !== 'personal' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-3">
                      所需签名数: {requiredSignatures}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={requiredSignatures}
                      onChange={(e) => setRequiredSignatures(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      设置需要多少成员签名才能执行交易。更高的签名数提供更好的安全性。
                    </p>
                  </div>
                )}
                
                {walletType === 'team' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-3">团队成员</label>
                    <div className="space-y-2">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary-900 rounded-lg">
                          <span className="text-white">{member}</span>
                          <button className="text-gray-400 hover:text-red-400">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddMember}
                      className="mt-2 text-primary-400 hover:text-primary-300 text-sm"
                    >
                      + 添加团队成员
                    </button>
                  </div>
                )}
                
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-blue-300 font-medium mb-2">MPC安全特性</p>
                      <ul className="text-blue-400/80 text-sm space-y-1">
                        <li>• 私钥分片存储，永不完整出现</li>
                        <li>• 基于门限签名技术，无需种子短语</li>
                        <li>• 支持多链资产管理</li>
                        <li>• 企业级安全审计和合规</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 确认创建 */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">确认钱包信息</h2>
                
                <div className="bg-secondary-900/50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">钱包类型:</span>
                      <span className="text-white font-medium">
                        {walletType === 'personal' ? '个人钱包' : 
                         walletType === 'team' ? '团队钱包' : '多签钱包'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">钱包名称:</span>
                      <span className="text-white font-medium">{walletName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">支持网络:</span>
                      <span className="text-white font-medium">
                        {selectedChains.map(id => 
                          chains.find(c => c.id === id)?.name
                        ).join(', ')}
                      </span>
                    </div>
                    {walletType !== 'personal' && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">所需签名:</span>
                        <span className="text-white font-medium">{requiredSignatures}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-medium mb-2">重要提醒</p>
                      <p className="text-yellow-400/80 text-sm">
                        钱包创建后无法更改类型和签名设置。请仔细确认所有信息。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-between mt-8 pt-6 border-t border-secondary-700">
              {step !== 'type' ? (
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  上一步
                </button>
              ) : (
                <Link 
                  href="/dashboard"
                  className="px-6 py-3 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  取消
                </Link>
              )}
              
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                <span>
                  {step === 'confirm' 
                    ? (isLoading ? '创建中...' : '确认创建')
                    : '下一步'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}