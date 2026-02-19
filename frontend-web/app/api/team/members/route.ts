import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, TeamMember } from '@/lib/types'

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    email: 'alice@company.com',
    name: 'Alice Johnson',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15T10:30:00Z',
    lastActive: '2025-02-14T09:15:00Z',
    permissions: ['view', 'spend', 'approve', 'manage']
  },
  {
    id: '2',
    email: 'bob@company.com',
    name: 'Bob Smith',
    role: 'approver',
    status: 'active',
    joinedAt: '2024-02-20T14:20:00Z',
    lastActive: '2025-02-14T08:45:00Z',
    permissions: ['view', 'approve']
  },
  {
    id: '3',
    email: 'charlie@company.com',
    name: 'Charlie Brown',
    role: 'spender',
    status: 'active',
    joinedAt: '2024-03-10T11:10:00Z',
    lastActive: '2025-02-13T16:30:00Z',
    permissions: ['view', 'spend']
  },
  {
    id: '4',
    email: 'diana@company.com',
    name: 'Diana Prince',
    role: 'viewer',
    status: 'pending',
    joinedAt: '2025-02-01T09:00:00Z',
    permissions: ['view']
  },
  {
    id: '5',
    email: 'edward@company.com',
    name: 'Edward Chen',
    role: 'spender',
    status: 'suspended',
    joinedAt: '2024-04-05T13:45:00Z',
    lastActive: '2025-01-30T10:20:00Z',
    permissions: ['view', 'spend']
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
    await new Promise(resolve => setTimeout(resolve, 400))

    return NextResponse.json<ApiResponse<TeamMember[]>>({
      success: true,
      data: mockTeamMembers,
      message: '获取团队成员成功'
    })
  } catch (error) {
    console.error('获取团队成员错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}