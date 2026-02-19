import { NextRequest, NextResponse } from 'next/server'

// 模拟用户数据
const mockUserData = {
  id: "user-123",
  username: "facebook_user",
  email: "user@example.com",
  mpc_public_key: "0x1234567890abcdef",
  passkey_enabled: true,
  meta_user_id: "fb_123456789"
}

const mockAccessToken = "mock_jwt_access_token_123456"

export async function POST(request: NextRequest) {
  try {
    const { user_id, credential } = await request.json()
    
    if (!user_id || !credential) {
      return NextResponse.json(
        { error: '用户ID和Passkey凭证是必需的' },
        { status: 400 }
      )
    }

    // 模拟后端API调用
    // 实际实现中这里应该调用后端服务验证Passkey
    console.log('收到Passkey认证请求:', { user_id, credential })

    // 模拟成功认证
    return NextResponse.json({
      user: mockUserData,
      access_token: mockAccessToken,
      expires_in: 24 * 60 * 60
    })

  } catch (error) {
    console.error('Passkey认证完成错误:', error)
    return NextResponse.json(
      { error: 'Passkey认证失败' },
      { status: 500 }
    )
  }
}