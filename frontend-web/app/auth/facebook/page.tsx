'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Facebook, Shield, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FacebookAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callback = searchParams.get('callback') || '/dashboard'

  useEffect(() => {
    // 模拟Facebook SDK加载
    const timer = setTimeout(() => {
      // 这里可以加载实际的Facebook SDK
      console.log('Facebook SDK loaded')
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 模拟Facebook登录流程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟成功响应
      const mockUserData = {
        id: '123456789',
        name: '张三',
        email: 'zhangsan@example.com',
        picture: 'https://example.com/avatar.jpg',
        is_new_user: true
      }
      
      setUserData(mockUserData)
      setSuccess(true)
      
      // 如果是新用户，跳转到Passkey设置页面
      setTimeout(() => {
        if (mockUserData.is_new_user) {
          router.push('/passkey-setup?source=facebook')
        } else {
          router.push(callback)
        }
      }, 2000)
      
    } catch (err) {
      setError('Facebook登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualRedirect = () => {
    // 模拟Facebook OAuth重定向
    const redirectUrl = `${window.location.origin}/auth/facebook/callback?code=facebook_auth_code&state=random_state`
    window.location.href = redirectUrl
  }

  if (success && userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Facebook登录成功！</h3>
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">{userData.name.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{userData.name}</div>
                  <div className="text-gray-300 text-sm">{userData.email}</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm">
                {userData.is_new_user 
                  ? '检测到您是首次使用，正在为您设置Passkey...' 
                  : '正在为您跳转到钱包...'}
              </div>
            </div>
            <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          {/* 品牌标识 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-white">MPC钱包</span>
            </div>
            <p className="text-gray-300">通过Facebook快速登录您的钱包账户</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* Facebook登录按钮 */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 mb-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Facebook className="w-6 h-6" />
            )}
            <span>{isLoading ? '登录中...' : '使用Facebook登录'}</span>
          </button>

          {/* 手动重定向按钮（开发模式） */}
          <button
            onClick={handleManualRedirect}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 text-sm mb-6"
          >
            模拟OAuth重定向（开发测试）
          </button>

          {/* 功能特性 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm">一键快速登录，无需记住密码</span>
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm">自动同步头像和基本信息</span>
            </div>
            <div className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-sm">企业级安全保护您的账户</span>
            </div>
          </div>

          {/* 其他登录选项 */}
          <div className="border-t border-white/20 pt-6">
            <p className="text-center text-gray-400 text-sm mb-4">或者使用其他方式登录</p>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/login"
                className="bg-secondary-800 hover:bg-secondary-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
              >
                邮箱登录
              </Link>
              <Link 
                href="/passkey-demo"
                className="bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
              >
                Passkey登录
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* 隐私声明 */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              使用Facebook登录即表示您同意我们的
              <a href="#" className="text-primary-400 hover:text-primary-300 ml-1">服务条款</a>
              和
              <a href="#" className="text-primary-400 hover:text-primary-300 ml-1">隐私政策</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}