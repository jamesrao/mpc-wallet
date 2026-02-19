'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface PasskeySetupProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PasskeySetup({ userId, onSuccess, onCancel }: PasskeySetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const startPasskeyRegistration = async () => {
    if (!userId) {
      setErrorMessage('用户ID不存在')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus('registering')
    setErrorMessage('')

    try {
      // 开始Passkey注册流程
      const response = await fetch('/api/auth/passkey/register/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('无法开始Passkey注册')
      }

      const options = await response.json()

      // 调用WebAuthn API进行注册
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(options.challenge.data),
          rp: options.rp,
          user: {
            id: new Uint8Array(options.user.id),
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: options.timeout,
          attestation: options.attestation,
        },
      })

      if (!credential) {
        throw new Error('Passkey注册被取消')
      }

      // 完成注册
      const finishResponse = await fetch('/api/auth/passkey/register/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        body: JSON.stringify({
          credential: credential,
        }),
      })

      if (!finishResponse.ok) {
        throw new Error('Passkey注册失败')
      }

      setStatus('success')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)

    } catch (error) {
      console.error('Passkey注册错误:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const isPasskeySupported = () => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  }

  const checkPasskeySupport = async () => {
    if (!isPasskeySupported()) {
      setErrorMessage('您的浏览器不支持Passkey功能')
      setStatus('error')
      return false
    }

    try {
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!isAvailable) {
        setErrorMessage('您的设备不支持Passkey认证')
        setStatus('error')
        return false
      }
      return true
    } catch (error) {
      setErrorMessage('无法检查Passkey支持状态')
      setStatus('error')
      return false
    }
  }

  const handleSetupPasskey = async () => {
    const isSupported = await checkPasskeySupport()
    if (isSupported) {
      await startPasskeyRegistration()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">设置Passkey</CardTitle>
        <CardDescription className="text-center">
          设置Passkey后，您可以使用人脸识别、指纹识别或设备密码快速登录
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Passkey是一种安全的登录方式，可以替代传统的密码：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>使用生物识别（人脸、指纹）或设备密码</li>
                <li>无需记忆复杂密码</li>
                <li>更安全，防止钓鱼攻击</li>
                <li>跨设备同步</li>
              </ul>
            </div>
            
            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                稍后设置
              </Button>
              <Button 
                onClick={handleSetupPasskey}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '立即设置'}
              </Button>
            </div>
          </div>
        )}

        {status === 'registering' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p>正在设置Passkey，请按照设备提示操作...</p>
            <div className="text-sm text-muted-foreground">
              这可能需要几秒钟时间
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-medium">Passkey设置成功！</p>
            <p className="text-sm text-muted-foreground">
              您现在可以使用Passkey快速登录
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            
            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={handleSetupPasskey}
                className="flex-1"
                disabled={isLoading}
              >
                重试
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}