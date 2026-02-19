import { NextRequest, NextResponse } from 'next/server'

// 模拟Passkey认证开始
const mockAuthOptions = {
  challenge: {
    data: Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
  },
  timeout: 60000,
  userVerification: "required"
}

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()
    
    if (!user_id) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      )
    }

    // 模拟后端API调用
    // 实际实现中这里应该调用后端服务获取用户的Passkey列表
    const options = {
      ...mockAuthOptions,
      challenge: {
        data: Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
      }
    }

    return NextResponse.json(options)

  } catch (error) {
    console.error('Passkey认证开始错误:', error)
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    )
  }
}