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
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // 检查错误
    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: errorDescription || 'Facebook认证失败', data: null },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '缺少授权码', data: null },
        { status: 400 }
      )
    }

    // 1. 用授权码换取访问令牌
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_CONFIG.appId,
      client_secret: FACEBOOK_CONFIG.appSecret,
      redirect_uri: FACEBOOK_CONFIG.redirectUri,
      code,
      grant_type: 'authorization_code'
    })

    const tokenResponse = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${tokenParams.toString()}`)
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      throw new Error(`Facebook令牌获取失败: ${tokenResponse.status} - ${errorData}`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error('无法获取访问令牌')
    }

    // 2. 获取用户信息
    const userInfoParams = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,name,email,picture'
    })

    const userInfoResponse = await fetch(`https://graph.facebook.com/v20.0/me?${userInfoParams.toString()}`)
    
    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.text()
      throw new Error(`Facebook用户信息获取失败: ${userInfoResponse.status} - ${errorData}`)
    }

    const facebookUser = await userInfoResponse.json()

    // 3. 模拟后端API调用（实际项目中应该调用真实的后端API）
    // 这里我们模拟与后端的交互
    const backendResponse = await handleBackendAuthentication(facebookUser)

    return NextResponse.json<ApiResponse<typeof backendResponse>>({
      success: true,
      data: backendResponse,
      message: 'Facebook认证成功'
    })

  } catch (error) {
    console.error('Facebook回调处理错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : '处理失败', data: null },
      { status: 500 }
    )
  }
}

// 模拟后端认证处理
async function handleBackendAuthentication(facebookUser: any) {
  // 在实际项目中，这里应该调用后端API进行用户认证
  // 模拟后端API调用
  await new Promise(resolve => setTimeout(resolve, 500))

  // 检查用户是否存在，创建或返回用户信息
  const existingUser = await checkExistingUser(facebookUser.id)
  
  if (existingUser) {
    // 用户已存在，返回现有用户信息
    return {
      user: existingUser,
      access_token: generateMockJWT(existingUser.id),
      expires_in: 24 * 60 * 60, // 24小时
      is_new_user: false
    }
  } else {
    // 新用户，创建用户记录
    const newUser = await createNewUser(facebookUser)
    return {
      user: newUser,
      access_token: generateMockJWT(newUser.id),
      expires_in: 24 * 60 * 60, // 24小时
      is_new_user: true,
      wallet: {
        id: 'wallet_' + Math.random().toString(36).substr(2, 9),
        address: '0x' + Math.random().toString(16).substr(2, 40),
        chain_type: 'ethereum'
      }
    }
  }
}

// 模拟检查现有用户
async function checkExistingUser(facebookId: string) {
  // 模拟数据库查询
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 这里应该查询数据库，检查是否存在该Facebook用户
  // 为了演示，我们随机返回用户或null
  const exists = Math.random() > 0.5
  
  if (exists) {
    return {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      facebook_id: facebookId,
      email: 'user@example.com',
      name: 'Existing User',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=existing',
      mpc_public_key: '0x' + Math.random().toString(16).substr(2, 40),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  
  return null
}

// 模拟创建新用户
async function createNewUser(facebookUser: any) {
  // 模拟数据库插入
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    facebook_id: facebookUser.id,
    email: facebookUser.email || `${facebookUser.id}@facebook.com`,
    name: facebookUser.name,
    picture: facebookUser.picture?.data?.url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=new',
    mpc_public_key: null, // 新用户还没有MPC钱包
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// 模拟生成JWT令牌
function generateMockJWT(userId: string) {
  const mockToken = Buffer.from(JSON.stringify({
    uid: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
  })).toString('base64')
  
  return `mock_jwt_${mockToken}`
}