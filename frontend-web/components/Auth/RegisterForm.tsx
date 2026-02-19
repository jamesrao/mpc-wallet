'use client'

import { useState } from 'react'
import { UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onRegisterSuccess?: () => void
}

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'info' | 'passkey' | 'complete'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 简单验证
    if (formData.password !== formData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }
    
    if (!formData.termsAccepted) {
      alert('请同意服务条款和隐私政策')
      return
    }

    setIsLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setIsLoading(false)
      setStep('passkey')
    }, 1000)
  }

  const handlePasskeySetup = async () => {
    setIsLoading(true)
    // 模拟Passkey设置过程
    setTimeout(() => {
      setIsLoading(false)
      setStep('complete')
      if (onRegisterSuccess) {
        setTimeout(onRegisterSuccess, 500)
      }
    }, 1500)
  }

  const passwordStrength = (password: string) => {
    if (password.length === 0) return 0
    if (password.length < 8) return 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
      return 100
    }
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
      return 75
    }
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      return 50
    }
    return 25
  }

  const strength = passwordStrength(formData.password)
  const strengthColor = strength < 50 ? 'bg-red-500' : strength < 75 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">创建您的账户</h2>
        <p className="text-gray-600 mt-2">享受安全、便捷的无密码钱包体验</p>
      </div>

      {/* 注册步骤指示器 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}>
            1
          </div>
          <div className={`h-1 flex-1 ${step !== 'info' ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex-1 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'passkey' ? 'bg-primary-600 text-white' : step === 'complete' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          <div className={`h-1 flex-1 ${step === 'complete' ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex-1 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'complete' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            3
          </div>
        </div>
      </div>

      {/* 步骤1：基本信息 */}
      {step === 'info' && (
        <form onSubmit={handleInfoSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-primary pl-10"
                  placeholder="请输入常用邮箱"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设置密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-primary pl-10 pr-10"
                  placeholder="请设置登录密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* 密码强度指示器 */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>密码强度</span>
                    <span>{strength}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${strengthColor}`}
                      style={{ width: `${strength}%` }}
                    ></div>
                  </div>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li className={`flex items-center ${formData.password.length >= 8 ? 'text-success-600' : ''}`}>
                      <CheckCircle className={`w-4 h-4 mr-1 ${formData.password.length >= 8 ? 'text-success-500' : 'text-gray-400'}`} />
                      至少8个字符
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-success-600' : ''}`}>
                      <CheckCircle className={`w-4 h-4 mr-1 ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'text-success-500' : 'text-gray-400'}`} />
                      包含大小写字母
                    </li>
                    <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-success-600' : ''}`}>
                      <CheckCircle className={`w-4 h-4 mr-1 ${/\d/.test(formData.password) ? 'text-success-500' : 'text-gray-400'}`} />
                      包含数字
                    </li>
                    <li className={`flex items-center ${/[!@#$%^&*]/.test(formData.password) ? 'text-success-600' : ''}`}>
                      <CheckCircle className={`w-4 h-4 mr-1 ${/[!@#$%^&*]/.test(formData.password) ? 'text-success-500' : 'text-gray-400'}`} />
                      包含特殊字符
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-primary pl-10"
                  placeholder="请再次输入密码"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">两次输入的密码不一致</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                我已阅读并同意
                <a href="#" className="text-primary-600 hover:text-primary-700">《服务条款》</a>
                和
                <a href="#" className="text-primary-600 hover:text-primary-700">《隐私政策》</a>
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
                验证中...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                继续设置Passkey
              </>
            )}
          </button>
        </form>
      )}

      {/* 步骤2：Passkey设置 */}
      {step === 'passkey' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mr-4">
                <Fingerprint className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">设置Passkey</h3>
                <p className="text-sm text-gray-600">使用生物识别技术实现无密码登录</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">更安全</p>
                  <p className="text-sm text-gray-600">密钥存储在设备安全芯片中，无法被窃取</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">更方便</p>
                  <p className="text-sm text-gray-600">无需记忆密码，面部识别或指纹即可登录</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-success-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">防钓鱼</p>
                  <p className="text-sm text-gray-600">域名绑定确保不会被钓鱼网站欺骗</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePasskeySetup}
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  设置中...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 mr-2" />
                  设置Passkey
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>重要提示：</strong>
                  Passkey将与当前设备绑定。您可以在账户设置中添加更多设备。
                  建议设置备用登录方式以防设备丢失。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤3：注册完成 */}
      {step === 'complete' && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">注册成功！</h3>
          <p className="text-gray-600 mb-6">
            您的账户已创建完成，Passkey设置成功。
            现在可以开始安全地管理您的数字资产。
          </p>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">下一步建议</h4>
            <ul className="space-y-2 text-sm text-gray-600 text-left">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                探索资产管理仪表板
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                设置交易限额和安全选项
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                了解MPC安全技术优势
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                添加备用设备和联系人
              </li>
            </ul>
          </div>
          <button
            onClick={onRegisterSuccess}
            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            进入钱包首页
          </button>
        </div>
      )}

      {/* 底部链接 */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          已经有账户？
          <button
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium ml-1"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  )
}