'use client'

import { useState } from 'react'
import { Facebook, Loader } from 'lucide-react'

interface FacebookLoginButtonProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FacebookLoginButton({ 
  onSuccess, 
  onError, 
  text = "使用Facebook账号登录",
  size = 'md'
}: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    
    try {
      // 1. 获取Facebook认证URL
      const response = await fetch('/api/auth/facebook/start')
      
      if (!response.ok) {
        throw new Error('无法启动Facebook认证')
      }
      
      const { auth_url, state } = await response.json()
      
      if (!auth_url) {
        throw new Error('Facebook认证配置错误')
      }
      
      // 存储state用于安全验证
      localStorage.setItem('facebook_auth_state', state)
      
      // 2. 重定向到Facebook认证页面
      window.location.href = auth_url
      
    } catch (error) {
      console.error('Facebook登录失败:', error)
      onError?.(error instanceof Error ? error.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  }

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className={`
        w-full bg-[#1877F2] text-white rounded-lg 
        hover:bg-[#166FE5] transition-colors 
        disabled:opacity-50 disabled:cursor-not-allowed 
        flex items-center justify-center font-medium
        ${sizeClasses[size]}
      `}
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          连接中...
        </>
      ) : (
        <>
          <Facebook className="w-5 h-5 mr-2" />
          {text}
        </>
      )}
    </button>
  )
}