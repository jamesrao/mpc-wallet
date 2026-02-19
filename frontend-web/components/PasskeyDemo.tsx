'use client'

import { useState } from 'react'
import { Fingerprint, UserCheck, Smartphone, Shield } from 'lucide-react'

export default function PasskeyDemo() {
  const [step, setStep] = useState(1)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const steps = [
    {
      id: 1,
      title: '选择Passkey登录',
      icon: <Smartphone className="w-6 h-6" />,
      description: '在登录页面选择"使用Passkey登录"选项',
    },
    {
      id: 2,
      title: '生物识别验证',
      icon: <Fingerprint className="w-6 h-6" />,
      description: '使用设备的人脸识别或指纹进行身份验证',
    },
    {
      id: 3,
      title: '自动签名',
      icon: <Shield className="w-6 h-6" />,
      description: '系统自动使用安全存储的密钥对交易进行签名',
    },
    {
      id: 4,
      title: '登录成功',
      icon: <UserCheck className="w-6 h-6" />,
      description: '无需密码即可访问您的钱包账户',
    },
  ]

  const simulateAuthentication = () => {
    setIsAuthenticating(true)
    // 模拟生物识别认证过程
    setTimeout(() => {
      if (step < 4) {
        setStep(step + 1)
      }
      setIsAuthenticating(false)
    }, 1000)
  }

  const resetDemo = () => {
    setStep(1)
    setIsAuthenticating(false)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Passkey 认证流程演示</h3>
        <p className="text-gray-600">体验无密码登录的便捷与安全</p>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200"></div>
        <div className="relative flex justify-between">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= s.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {s.icon}
              </div>
              <span className={`text-sm font-medium ${step >= s.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mr-3">
            {steps[step - 1].icon}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{steps[step - 1].title}</h4>
            <p className="text-gray-600">{steps[step - 1].description}</p>
          </div>
        </div>

        {step === 2 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">生物识别验证</span>
              <Fingerprint className="w-5 h-5 text-primary-600" />
            </div>
            <div className="h-32 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-gray-600">请使用指纹或面部识别</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">交易签名</span>
              <Shield className="w-5 h-5 text-success-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">交易哈希</span>
                <span className="text-sm font-mono text-gray-900 truncate">0x7f9c...b2a4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">签名状态</span>
                <span className="badge-success">已签名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">安全级别</span>
                <span className="text-sm text-success-600 font-medium">设备级安全</span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-success-50 to-success-100 rounded-lg border border-success-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <h5 className="text-xl font-bold text-gray-900 text-center mb-2">登录成功！</h5>
            <p className="text-gray-700 text-center">
              您已通过Passkey无密码认证成功登录钱包。
              现在可以安全地管理您的数字资产。
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-between">
        <button
          onClick={resetDemo}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isAuthenticating}
        >
          重置演示
        </button>
        {step < 4 ? (
          <button
            onClick={simulateAuthentication}
            disabled={isAuthenticating}
            className="btn-primary px-6 py-2"
          >
            {isAuthenticating ? '验证中...' : '下一步'}
          </button>
        ) : (
          <button
            onClick={resetDemo}
            className="btn-primary px-6 py-2"
          >
            重新开始
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <Shield className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
          <p>
            Passkey使用设备的安全区域(如TPM、Secure Enclave)存储密钥，确保私钥永不离开您的设备。
            所有生物识别数据仅在本地处理，不会上传到服务器。
          </p>
        </div>
      </div>
    </div>
  )
}