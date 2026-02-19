import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Asset } from '@/lib/types'

const mockAssets: Asset[] = [
  { 
    id: '1', 
    symbol: 'BTC', 
    name: '比特币', 
    balance: '2.5432', 
    value: '$128,450.32', 
    price: '$50,500.00', 
    change24h: '+3.24%', 
    color: 'bg-orange-500', 
    decimals: 8, 
    chain: 'Bitcoin' 
  },
  { 
    id: '2', 
    symbol: 'ETH', 
    name: '以太坊', 
    balance: '15.832', 
    value: '$45,230.15', 
    price: '$2,856.00', 
    change24h: '+1.78%', 
    color: 'bg-gray-700', 
    decimals: 18, 
    chain: 'Ethereum' 
  },
  { 
    id: '3', 
    symbol: 'SOL', 
    name: 'Solana', 
    balance: '125.5', 
    value: '$18,450.00', 
    price: '$147.00', 
    change24h: '+5.42%', 
    color: 'bg-purple-600', 
    decimals: 9, 
    chain: 'Solana' 
  },
  { 
    id: '4', 
    symbol: 'USDC', 
    name: 'USD Coin', 
    balance: '50,000', 
    value: '$50,000.00', 
    price: '$1.00', 
    change24h: '0.00%', 
    color: 'bg-blue-500', 
    decimals: 6, 
    chain: 'Ethereum' 
  },
]

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
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json<ApiResponse<Asset[]>>({
      success: true,
      data: mockAssets,
      message: '获取资产列表成功'
    })
  } catch (error) {
    console.error('获取资产错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}