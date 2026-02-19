import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, SecuritySettings } from '@/lib/types'

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'authenticator',
  loginAlerts: true,
  transactionAlerts: true,
  withdrawalWhitelist: false,
  ipWhitelist: ['192.168.1.1', '10.0.0.1'],
  sessionTimeout: 60,
  biometricEnabled: true,
  passkeyEnabled: true
}

export async function GET(request: NextRequest) {
  try {
    // 验证token（演示中简化）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      // 为了演示，在没有token时也返回数据
      // return NextResponse.json<ApiResponse<null>>(
      //   { success: false, error: '未授权访问' },
      //   { status: 401 }
      // )
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json<ApiResponse<SecuritySettings>>({
      success: true,
      data: mockSecuritySettings,
      message: '获取安全设置成功'
    })
  } catch (error) {
    console.error('获取安全设置错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '未授权访问', data: null },
        { status: 401 }
      )
    }

    const updates = await request.json()
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 400))

    return NextResponse.json<ApiResponse<SecuritySettings>>({
      success: true,
      data: { ...mockSecuritySettings, ...updates },
      message: '更新安全设置成功'
    })
  } catch (error) {
    console.error('更新安全设置错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}