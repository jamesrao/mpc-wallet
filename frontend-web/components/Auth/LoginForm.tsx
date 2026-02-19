'use client'

import { useState } from 'react'
import { Fingerprint, Smartphone, Mail, Key, Eye, EyeOff, AlertCircle, Facebook } from 'lucide-react'
import FacebookLoginButton from './FacebookLoginButton'
import { PasskeyLogin } from './PasskeyLogin'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onForgotPassword?: () => void
  onFacebookSuccess?: (data: any) => void
  onFacebookError?: (error: string) => void
  onPasskeySuccess?: (userData: any, accessToken: string) => void
  onPasskeyError?: (error: string) => void
}

export default function LoginForm({ 
  onSwitchToRegister, 
  onForgotPassword, 
  onFacebookSuccess,
  onFacebookError,
  onPasskeySuccess,
  onPasskeyError
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'passkey' | 'password'>('passkey')
  const [isLoading, setIsLoading] = useState(false)
  const [showPasskeyLogin, setShowPasskeyLogin] = useState(false)

  const handlePasskeySuccess = (userData: any, accessToken: string) => {
    onPasskeySuccess?.(userData, accessToken)
  }

  const handlePasskeyError = (error: string) => {
    onPasskeyError?.(error)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // 模拟密码登录过程
    setTimeout(() => {
      setIsLoading(false)
      alert('密码登录成功！')
    }, 1500)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
          <Fingerprint className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
        <p className="text-gray-600 mt-2">选择您喜欢的登录方式</p>
      </div>

      {/* 登录方式选择 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-3 font-medium text-center ${loginMethod === 'passkey' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'}`}
          onClick={() => setLoginMethod('passkey')}
        >
          <Smartphone className="w-5 h-5 inline mr-2" />
          Passkey登录
        </button>
        <button
          className={`flex-1 py-3 font-medium text-center ${loginMethod === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'}`}
          onClick={() => setLoginMethod('password')}
        >
          <Key className="w-5 h-5 inline mr-2" />
          密码登录
        </button>
      </div>

      {/* Passkey登录 */}
      {loginMethod === 'passkey' && (
        <div className="space-y-6">
          {showPasskeyLogin ? (
            <PasskeyLogin
              onSuccess={handlePasskeySuccess}
              onError={handlePasskeyError}
              onCancel={() => setShowPasskeyLogin(false)}
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mr-4">
                  <Fingerprint className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">使用Passkey登录</h3>
                  <p className="text-sm text-gray-600">通过面部识别或指纹快速登录</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowPasskeyLogin(true)}
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      验证中...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2" />
                      使用Passkey登录
                    </>
                  )}
                </button>

                <div className="text-sm text-gray-500 text-center">
                  或使用已注册的设备进行验证
                </div>
              </div>
            </div>
          )}

          {!showPasskeyLogin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>安全提示：</strong>
                    Passkey使用设备的安全芯片存储密钥，确保您的账户安全。生物识别数据仅在本地处理，不会上传到服务器。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 密码登录 */}
      {loginMethod === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-primary pl-10"
                  placeholder="请输入注册邮箱"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  密码
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-primary pl-10 pr-10"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                30天内自动登录
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                登录中...
              </>
            ) : (
              '登录账户'
            )}
          </button>
        </form>
      )}

      {/* 其他选项 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 mb-4">还没有账户？</p>
          <button
            onClick={onSwitchToRegister}
            className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            创建新账户
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">其他登录方式</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {/* Facebook登录按钮 */}
            <FacebookLoginButton 
              onSuccess={onFacebookSuccess}
              onError={onFacebookError}
              text="使用Facebook账号登录"
              size="md"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Smartphone className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-700">短信验证</span>
              </button>
              <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-700">邮箱验证</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}