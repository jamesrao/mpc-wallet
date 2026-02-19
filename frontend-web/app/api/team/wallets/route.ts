import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, TeamWallet } from '@/lib/types'

const mockTeamWallets: TeamWallet[] = [
  {
    id: '1',
    name: '主运营钱包',
    address: '0x742d35Cc6634C0532925a3b844Bc9e11137e40f0',
    chain: 'Ethereum',
    balance: '$125,430.50',
    requiredApprovals: 2,
    members: [
      { id: '1', role: 'admin' },
      { id: '2', role: 'approver' },
      { id: '3', role: 'spender' }
    ],
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    name: '储备金钱包',
    address: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    chain: 'Ethereum',
    balance: '$75,200.00',
    requiredApprovals: 3,
    members: [
      { id: '1', role: 'admin' },
      { id: '2', role: 'approver' }
    ],
    createdAt: '2024-02-15T14:30:00Z'
  },
  {
    id: '3',
    name: 'Solana运营钱包',
    address: 'HxFLKUq2Ck8MvU9vFwt5Jq5r6t7s8t9u0v1w2x3y4z5',
    chain: 'Solana',
    balance: '$40,500.25',
    requiredApprovals: 1,
    members: [
      { id: '1', role: 'admin' },
      { id: '3', role: 'spender' }
    ],
    createdAt: '2024-03-05T09:15:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    // 验证token（演示中简化）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      // 为了演示，在没有token时也返回数据
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json<ApiResponse<TeamWallet[]>>({
      success: true,
      data: mockTeamWallets,
      message: '获取团队钱包成功'
    })
  } catch (error) {
    console.error('获取团队钱包错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '未授权访问', data: null },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // 模拟创建新钱包
    const newWallet: TeamWallet = {
      id: Date.now().toString(),
      name: data.name || '新钱包',
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      chain: data.chain || 'Ethereum',
      balance: '$0.00',
      requiredApprovals: data.requiredApprovals || 2,
      members: [{ id: '1', role: 'admin' }],
      createdAt: new Date().toISOString()
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json<ApiResponse<TeamWallet>>({
      success: true,
      data: newWallet,
      message: '创建团队钱包成功'
    })
  } catch (error) {
    console.error('创建团队钱包错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}