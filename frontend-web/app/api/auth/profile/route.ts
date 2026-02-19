import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // 从header获取token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '未授权访问', data: null },
        { status: 401 }
      )
    }

    // 模拟用户数据
    const mockUser = {
      id: 'user_123',
      email: 'user@company.com',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      role: 'user' as const,
      isVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
      twoFactorEnabled: false,
      securityScore: 85
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json<ApiResponse<typeof mockUser>>({
      success: true,
      data: mockUser,
      message: '获取用户信息成功'
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}