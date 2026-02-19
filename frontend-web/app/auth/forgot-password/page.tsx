'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Key, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 模拟发送验证码API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟成功
      setStep('code')
      setCountdown(60) // 60秒倒计时
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (err) {
      setError('发送验证码失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('请输入6位验证码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 模拟验证码验证API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟成功
      setStep('reset')
    } catch (err) {
      setError('验证码错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError('密码长度至少8位')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 模拟重置密码API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟成功
      setStep('success')
    } catch (err) {
      setError('密码重置失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = () => {
    if (countdown > 0) return
    
    handleSendCode()
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">密码重置成功！</h3>
            <p className="text-gray-300 mb-6">您的密码已成功重置，请使用新密码登录</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                立即登录
              </button>
              <Link 
                href="/"
                className="block w-full bg-secondary-800 hover:bg-secondary-700 text-white text-center py-3 px-6 rounded-lg transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-white">找回密码</span>
            </div>
            <p className="text-gray-300">
              {step === 'email' && '请输入您的邮箱地址以接收验证码'}
              {step === 'code' && `验证码已发送至 ${email}`}
              {step === 'reset' && '请设置新的登录密码'}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  (step === 'email' && num === 1) || 
                  (step === 'code' && num <= 2) || 
                  (step === 'reset' && num <= 3)
                    ? 'bg-primary-600 text-white' 
                    : 'bg-secondary-800 text-gray-400'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    (step === 'code' && num === 1) || 
                    (step === 'reset' && num <= 2)
                      ? 'bg-primary-600' 
                      : 'bg-secondary-800'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* 表单内容 */}
          <div className="space-y-6">
            {/* 邮箱输入 */}
            {step === 'email' && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入您的邮箱地址"
                    className="w-full pl-10 pr-4 py-3 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={isLoading || !validateEmail(email)}
                  className="w-full mt-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isLoading ? '发送中...' : '发送验证码'}
                </button>
              </div>
            )}

            {/* 验证码输入 */}
            {step === 'code' && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-primary-400 hover:text-primary-300 disabled:text-gray-500 text-sm"
                  >
                    {countdown > 0 ? `${countdown}秒后重发` : '重新发送验证码'}
                  </button>
                  <button
                    onClick={handleVerifyCode}
                    disabled={isLoading || code.length !== 6}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? '验证中...' : '验证'}
                  </button>
                </div>
              </div>
            )}

            {/* 密码重置 */}
            {step === 'reset' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少8位）"
                    className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full px-4 py-3 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {isLoading ? '重置中...' : '重置密码'}
                </button>
              </div>
            )}
          </div>

          {/* 安全提示 */}
          <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium mb-2">安全提示</p>
                <ul className="text-blue-400/80 text-sm space-y-1">
                  <li>• 请使用强密码，包含字母、数字和特殊字符</li>
                  <li>• 验证码有效期为10分钟</li>
                  <li>• 重置密码后，所有设备将需要重新登录</li>
                  <li>• 如有疑问，请联系客服 support@mpcwallet.com</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 返回登录 */}
          <div className="border-t border-white/20 pt-6 mt-6">
            <Link 
              href="/login"
              className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录页面
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}