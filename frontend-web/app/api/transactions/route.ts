import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Transaction } from '@/lib/types'

const mockTransactions: Transaction[] = [
  { 
    id: '1', 
    type: 'send', 
    asset: 'BTC', 
    amount: '0.5 BTC', 
    from: '0x1a2b...c3d4',
    to: '0x8f9c...b2a4', 
    hash: '0xabc123...def456',
    status: 'completed', 
    timestamp: '2024-01-15T14:30:00Z',
    fee: '0.001 BTC',
    memo: '供应商付款'
  },
  { 
    id: '2', 
    type: 'swap', 
    asset: 'ETH', 
    amount: '10 ETH → USDC', 
    from: '0x1a2b...c3d4',
    to: '兑换池',
    hash: '0xdef456...ghi789',
    status: 'completed', 
    timestamp: '2024-01-14T11:20:00Z',
    fee: '0.02 ETH'
  },
  { 
    id: '3', 
    type: 'receive', 
    asset: 'SOL', 
    amount: '25 SOL', 
    from: '0x3a5d...e7f9',
    to: '0x1a2b...c3d4',
    hash: '0xghi789...jkl012',
    status: 'completed', 
    timestamp: '2024-01-13T09:15:00Z',
    fee: '0.001 SOL'
  },
  { 
    id: '4', 
    type: 'stake', 
    asset: 'ETH', 
    amount: '5 ETH', 
    from: '0x1a2b...c3d4',
    to: '质押合约',
    hash: '0xjkl012...mno345',
    status: 'pending', 
    timestamp: '2024-01-12T16:45:00Z',
    fee: '0.01 ETH'
  },
  { 
    id: '5', 
    type: 'send', 
    asset: 'USDC', 
    amount: '5,000 USDC', 
    from: '0x1a2b...c3d4',
    to: '0x4e5f...a6b7', 
    hash: '0xlmn456...opq789',
    status: 'completed', 
    timestamp: '2024-01-11T10:15:00Z',
    fee: '5 USDC',
    memo: '营销费用'
  },
]

export async function GET(request: NextRequest) {
  try {
    // 验证token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '未授权访问', data: null },
        { status: 401 }
      )
    }

    // 解析查询参数
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')

    // 过滤交易
    let filteredTransactions = mockTransactions
    if (type && type !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type)
    }
    if (status && status !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status)
    }

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 400))

    return NextResponse.json<ApiResponse<Transaction[]>>({
      success: true,
      data: paginatedTransactions,
      message: '获取交易记录成功',
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit)
      }
    })
  } catch (error) {
    console.error('获取交易错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}