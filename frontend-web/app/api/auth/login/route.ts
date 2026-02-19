import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 模拟验证
    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '邮箱和密码不能为空', data: null },
        { status: 400 }
      )
    }

    // 模拟成功登录
    const mockUser = {
      id: 'user_123',
      email,
      name: email.split('@')[0],
      role: 'user' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      token: 'mock_jwt_token_123456'
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json<ApiResponse<typeof mockUser>>({
      success: true,
      data: mockUser,
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}