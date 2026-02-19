import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

// Facebook认证配置
const FACEBOOK_CONFIG = {
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback'
}

export async function GET(request: NextRequest) {
  try {
    // 检查是否配置了Facebook应用
    if (!FACEBOOK_CONFIG.appId || !FACEBOOK_CONFIG.appSecret) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Facebook认证未配置', data: null },
        { status: 503 }
      )
    }

    // 生成随机state用于安全验证
    const state = Math.random().toString(36).substring(2, 15)
    
    // 构建Facebook OAuth URL
    const params = new URLSearchParams({
      client_id: FACEBOOK_CONFIG.appId,
      redirect_uri: FACEBOOK_CONFIG.redirectUri,
      state,
      scope: 'email,public_profile',
      response_type: 'code'
    })

    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`

    return NextResponse.json<ApiResponse<{ auth_url: string; state: string }>>({
      success: true,
      data: {
        auth_url: authUrl,
        state
      },
      message: 'Facebook认证URL生成成功'
    })

  } catch (error) {
    console.error('Facebook认证启动错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}