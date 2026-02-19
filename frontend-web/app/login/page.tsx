'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'
import LoginForm from '@/components/Auth/LoginForm'
import RegisterForm from '@/components/Auth/RegisterForm'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleLoginSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleRegisterSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  const handleFacebookSuccess = (data: any) => {
    console.log('Facebook登录成功:', data)
    if (data.is_new_user) {
      // 新用户需要设置Passkey
      router.push('/passkey-setup')
    } else {
      // 现有用户直接进入仪表板
      router.push('/dashboard')
    }
  }

  const handleFacebookError = (error: string) => {
    console.error('Facebook登录失败:', error)
    // 可以在这里显示错误提示
    alert(`Facebook登录失败: ${error}`)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">登录成功！</h3>
            <p className="text-gray-600 mb-6">正在为您跳转到钱包首页...</p>
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 导航栏 */}
      <nav className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold text-white">MPC Wallet</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* 左侧品牌区域 */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <div className="max-w-lg text-center">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-8">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              下一代 Web3 钱包
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              基于MPC技术，集成Passkey无密码认证
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-gray-300">无种子短语风险</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-gray-300">生物识别登录</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-gray-300">企业级多签安全</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <span className="text-gray-300">Facebook账号无缝对接</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧表单区域 */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* 切换标签 */}
              <div className="flex border-b border-gray-200 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-4 font-medium text-center ${
                    isLogin 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  登录账户
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-4 font-medium text-center ${
                    !isLogin 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  注册账户
                </button>
              </div>

              {/* 表单内容 */}
              {isLogin ? (
                <LoginForm 
                  onSwitchToRegister={() => setIsLogin(false)}
                  onForgotPassword={() => {/* 处理忘记密码 */}}
                  onFacebookSuccess={handleFacebookSuccess}
                  onFacebookError={handleFacebookError}
                />
              ) : (
                <RegisterForm 
                  onSwitchToLogin={() => setIsLogin(true)}
                  onRegisterSuccess={handleRegisterSuccess}
                />
              )}
            </div>

            {/* 底部信息 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                使用即表示您同意我们的
                <a href="#" className="text-primary-400 hover:text-primary-300 ml-1">服务条款</a>
                和
                <a href="#" className="text-primary-400 hover:text-primary-300 ml-1">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}