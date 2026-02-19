'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Fingerprint, XCircle } from 'lucide-react'

interface PasskeyLoginProps {
  onSuccess: (userData: any, accessToken: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export function PasskeyLogin({ onSuccess, onError, onCancel }: PasskeyLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const startPasskeyAuthentication = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // 获取用户输入的用户名或邮箱
      const username = prompt('请输入您的用户名或邮箱:')
      if (!username) {
        throw new Error('请输入用户名或邮箱')
      }

      // 根据用户名获取用户ID
      const userResponse = await fetch(`/api/users/by-username?username=${encodeURIComponent(username)}`)
      if (!userResponse.ok) {
        throw new Error('用户不存在')
      }

      const userData = await userResponse.json()
      const userId = userData.id

      // 开始Passkey认证流程
      const authResponse = await fetch('/api/auth/passkey/authenticate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!authResponse.ok) {
        throw new Error('无法开始Passkey认证')
      }

      const options = await authResponse.json()

      // 调用WebAuthn API进行认证
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(options.challenge.data),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            id: new Uint8Array(cred.id),
            type: cred.type,
          })),
          timeout: options.timeout,
          userVerification: options.userVerification,
        },
      })

      if (!credential) {
        throw new Error('Passkey认证被取消')
      }

      // 完成认证
      const finishResponse = await fetch('/api/auth/passkey/authenticate/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          credential: credential,
        }),
      })

      if (!finishResponse.ok) {
        throw new Error('Passkey认证失败')
      }

      const result = await finishResponse.json()
      onSuccess(result.user, result.access_token)

    } catch (error) {
      console.error('Passkey认证错误:', error)
      const errorMsg = error instanceof Error ? error.message : '认证失败'
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
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
      return false
    }

    try {
      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!isAvailable) {
        setErrorMessage('您的设备不支持Passkey认证')
        return false
      }
      return true
    } catch (error) {
      setErrorMessage('无法检查Passkey支持状态')
      return false
    }
  }

  const handlePasskeyLogin = async () => {
    const isSupported = await checkPasskeySupport()
    if (isSupported) {
      await startPasskeyAuthentication()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Passkey登录
        </CardTitle>
        <CardDescription className="text-center">
          使用人脸识别、指纹识别或设备密码快速登录
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Passkey登录的优势：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>无需记忆密码</li>
            <li>更快速、更方便</li>
            <li>更高的安全性</li>
            <li>防止钓鱼攻击</li>
          </ul>
        </div>

        <div className="flex justify-between space-x-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              返回
            </Button>
          )}
          <Button 
            onClick={handlePasskeyLogin}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                使用Passkey登录
              </span>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          首次使用需要先设置Passkey
        </div>
      </CardContent>
    </Card>
  )
}