import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json(
        { error: 'Passkey凭证是必需的' },
        { status: 400 }
      )
    }

    // 模拟后端API调用
    // 实际实现中这里应该调用后端服务验证和保存Passkey
    console.log('收到Passkey凭证:', credential)

    // 模拟成功响应
    return NextResponse.json({
      message: 'Passkey注册成功',
      success: true
    })

  } catch (error) {
    console.error('Passkey注册完成错误:', error)
    return NextResponse.json(
      { error: 'Passkey注册失败' },
      { status: 500 }
    )
  }
}