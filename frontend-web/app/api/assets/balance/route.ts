import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // 验证token（演示中简化，允许无token访问）
    const authHeader = request.headers.get('authorization')
    // if (!authHeader) {
    //   return NextResponse.json<ApiResponse<null>>(
    //     { success: false, error: '未授权访问' },
    //     { status: 401 }
    //   )
    // }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    return NextResponse.json<ApiResponse<{ total: string; change24h: string }>>({
      success: true,
      data: {
        total: '$241,130.47',
        change24h: '+2.8%'
      },
      message: '获取总资产余额成功'
    })
  } catch (error) {
    console.error('获取资产余额错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}