'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Facebook, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react'

interface FacebookCallbackHandlerProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export default function FacebookCallbackHandler({ onSuccess, onError }: FacebookCallbackHandlerProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('正在处理Facebook认证...')
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setStatus('error')
        setMessage(errorDescription || 'Facebook认证失败')
        onError?.(errorDescription || '认证失败')
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('缺少授权码')
        onError?.('缺少授权码')
        return
      }

      try {
        // 处理Facebook回调
        const response = await fetch(`/api/auth/facebook/callback?code=${encodeURIComponent(code)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '认证处理失败')
        }

        const data = await response.json()
        
        setStatus('success')
        setMessage('Facebook认证成功！')
        setUserData(data)
        
        // 存储认证信息
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        
        onSuccess?.(data)
        
        // 3秒后自动跳转
        setTimeout(() => {
          if (data.is_new_user) {
            router.push('/passkey-setup')
          } else {
            router.push('/dashboard')
          }
        }, 3000)
        
      } catch (error) {
        console.error('Facebook回调处理失败:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : '处理失败')
        onError?.(error instanceof Error ? error.message : '处理失败')
      }
    }

    handleCallback()
  }, [searchParams, router, onSuccess, onError])

  const handleContinue = () => {
    if (userData?.is_new_user) {
      router.push('/passkey-setup')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1877F2] flex items-center justify-center mx-auto mb-4">
              <Facebook className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {status === 'loading' ? '正在认证' : 
               status === 'success' ? '认证成功' : '认证失败'}
            </h2>
          </div>

          <div className="text-center space-y-6">
            {/* 状态图标 */}
            <div className="flex justify-center">
              {status === 'loading' && (
                <Loader className="w-12 h-12 text-blue-500 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-12 h-12 text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>

            {/* 消息 */}
            <div className="space-y-2">
              <p className="text-lg text-gray-700">{message}</p>
              {status === 'success' && userData?.is_new_user && (
                <p className="text-sm text-gray-600">
                  检测到您是首次使用Facebook登录，接下来将引导您设置Passkey以获得最高级别的安全保护。
                </p>
              )}
            </div>

            {/* 用户信息（成功时显示） */}
            {status === 'success' && userData?.user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {userData.user.picture && (
                    <img 
                      src={userData.user.picture} 
                      alt="用户头像" 
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{userData.user.name}</p>
                    <p className="text-sm text-gray-600">{userData.user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {status === 'success' && (
              <button
                onClick={handleContinue}
                className="w-full py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors flex items-center justify-center font-medium"
              >
                {userData?.is_new_user ? '设置Passkey' : '进入钱包'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  返回登录页面
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重试
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}