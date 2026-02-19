'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Wallet, 
  FileText, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical,
  Search,
  Filter,
  Mail,
  Shield,
  Key,
  AlertCircle
} from 'lucide-react'
import { TeamMember, TeamWallet, ApprovalRequest, ApiResponse } from '@/lib/types'
import { teamApi } from '@/lib/api-client'

// 模拟数据
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

const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: '1',
    type: 'transaction',
    status: 'pending',
    initiator: {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@company.com'
    },
    data: {
      to: '0x9876543210abcdef1234567890abcdef12345678',
      amount: '2.5',
      asset: 'ETH',
      memo: '供应商付款'
    },
    approvals: [
      { memberId: '1', name: 'Alice Johnson', approved: true, timestamp: '2025-02-14T10:30:00Z', comment: '确认金额正确' },
      { memberId: '2', name: 'Bob Smith', approved: false }
    ],
    requiredApprovals: 2,
    currentApprovals: 1,
    createdAt: '2025-02-14T09:45:00Z',
    expiresAt: '2025-02-15T09:45:00Z'
  },
  {
    id: '2',
    type: 'member_invite',
    status: 'pending',
    initiator: {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com'
    },
    data: {
      email: 'frank@company.com',
      role: 'spender',
      permissions: ['view', 'spend']
    },
    approvals: [
      { memberId: '2', name: 'Bob Smith', approved: true, timestamp: '2025-02-13T16:20:00Z' }
    ],
    requiredApprovals: 1,
    currentApprovals: 1,
    createdAt: '2025-02-13T15:30:00Z',
    expiresAt: '2025-02-15T15:30:00Z'
  },
  {
    id: '3',
    type: 'wallet_creation',
    status: 'approved',
    initiator: {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com'
    },
    data: {
      name: 'Polygon测试钱包',
      chain: 'Polygon',
      requiredApprovals: 2
    },
    approvals: [
      { memberId: '2', name: 'Bob Smith', approved: true, timestamp: '2025-02-12T11:10:00Z' },
      { memberId: '3', name: 'Charlie Brown', approved: true, timestamp: '2025-02-12T11:45:00Z' }
    ],
    requiredApprovals: 2,
    currentApprovals: 2,
    createdAt: '2025-02-12T10:00:00Z'
  }
]

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'wallets' | 'approvals'>('members')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamWallets, setTeamWallets] = useState<TeamWallet[]>([])
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState({ email: '', role: 'spender' })
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false)
  const [newWalletData, setNewWalletData] = useState({ name: '', chain: 'Ethereum', requiredApprovals: 2 })

  // 加载数据
  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setLoading(true)
    try {
      // 实际API调用（当前注释使用模拟数据）
      // const membersResponse = await teamApi.getTeamMembers()
      // const walletsResponse = await teamApi.getTeamWallets()
      // const approvalsResponse = await teamApi.getApprovalRequests()
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTeamMembers(mockTeamMembers)
      setTeamWallets(mockTeamWallets)
      setApprovalRequests(mockApprovalRequests)
    } catch (error) {
      console.error('加载团队数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤成员
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  // 过滤钱包
  const filteredWallets = teamWallets.filter(wallet => 
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 过滤审批请求
  const filteredApprovals = approvalRequests.filter(request => 
    request.type.includes(searchTerm.toLowerCase()) ||
    request.initiator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.initiator.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 发送邀请
  const handleSendInvite = async () => {
    if (!inviteData.email.trim()) return
    
    try {
      // 实际API调用
      // await teamApi.inviteMember(inviteData)
      
      // 模拟成功
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: inviteData.email,
        name: inviteData.email.split('@')[0],
        role: inviteData.role as any,
        status: 'pending',
        joinedAt: new Date().toISOString(),
        permissions: inviteData.role === 'admin' 
          ? ['view', 'spend', 'approve', 'manage']
          : inviteData.role === 'approver'
          ? ['view', 'approve']
          : inviteData.role === 'spender'
          ? ['view', 'spend']
          : ['view']
      }
      
      setTeamMembers(prev => [...prev, newMember])
      setShowInviteModal(false)
      setInviteData({ email: '', role: 'spender' })
    } catch (error) {
      console.error('发送邀请失败:', error)
    }
  }

  // 创建团队钱包
  const handleCreateWallet = async () => {
    if (!newWalletData.name.trim()) return
    
    try {
      // 实际API调用
      // await teamApi.createTeamWallet(newWalletData)
      
      // 模拟成功
      const newWallet: TeamWallet = {
        id: Date.now().toString(),
        name: newWalletData.name,
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        chain: newWalletData.chain,
        balance: '$0.00',
        requiredApprovals: newWalletData.requiredApprovals,
        members: [{ id: '1', role: 'admin' }],
        createdAt: new Date().toISOString()
      }
      
      setTeamWallets(prev => [...prev, newWallet])
      setShowCreateWalletModal(false)
      setNewWalletData({ name: '', chain: 'Ethereum', requiredApprovals: 2 })
    } catch (error) {
      console.error('创建钱包失败:', error)
    }
  }

  // 审批请求
  const handleApproveRequest = async (requestId: string) => {
    try {
      // 实际API调用
      // await teamApi.approveRequest(requestId, {})
      
      setApprovalRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { 
                ...req, 
                status: req.currentApprovals + 1 >= req.requiredApprovals ? 'approved' : 'pending',
                currentApprovals: req.currentApprovals + 1,
                approvals: req.approvals.map(approval => 
                  approval.memberId === '1' // 假设当前用户ID为1
                    ? { ...approval, approved: true, timestamp: new Date().toISOString() }
                    : approval
                )
              }
            : req
        )
      )
    } catch (error) {
      console.error('审批请求失败:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      // 实际API调用
      // await teamApi.rejectRequest(requestId, '用户拒绝')
      
      setApprovalRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'rejected' }
            : req
        )
      )
    } catch (error) {
      console.error('拒绝请求失败:', error)
    }
  }

  // 角色颜色映射
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-300'
      case 'approver': return 'bg-blue-500/20 text-blue-300'
      case 'spender': return 'bg-green-500/20 text-green-300'
      case 'viewer': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300'
      case 'suspended': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  // 请求类型颜色映射
  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-blue-500/20 text-blue-300'
      case 'member_invite': return 'bg-purple-500/20 text-purple-300'
      case 'wallet_creation': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  // 请求状态颜色映射
  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300'
      case 'approved': return 'bg-green-500/20 text-green-300'
      case 'rejected': return 'bg-red-500/20 text-red-300'
      case 'expired': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和统计 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">团队协作</h1>
            <p className="text-gray-400 mt-2">管理团队成员、多签钱包和审批流程</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all flex items-center space-x-2"
            >
              <UserPlus size={18} />
              <span>邀请成员</span>
            </button>
            <button 
              onClick={() => setShowCreateWalletModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center space-x-2"
            >
              <Wallet size={18} />
              <span>创建团队钱包</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">团队成员</p>
                <p className="text-2xl font-bold text-white mt-1">{teamMembers.length}</p>
              </div>
              <Users className="text-primary-400" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {teamMembers.filter(m => m.status === 'active').length} 个活跃
            </p>
          </div>
          <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">团队钱包</p>
                <p className="text-2xl font-bold text-white mt-1">{teamWallets.length}</p>
              </div>
              <Wallet className="text-blue-400" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              总余额: $241,130.75
            </p>
          </div>
          <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">待审批请求</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {approvalRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <FileText className="text-yellow-400" size={24} />
            </div>
            <p className="text-yellow-400 text-sm mt-2">需要您关注的请求</p>
          </div>
          <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">安全评分</p>
                <p className="text-2xl font-bold text-white mt-1">92%</p>
              </div>
              <Shield className="text-green-400" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">团队配置安全</p>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="border-b border-secondary-700 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-1 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'members'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users size={18} />
            <span>团队成员</span>
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`pb-3 px-1 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'wallets'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Wallet size={18} />
            <span>团队钱包</span>
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 px-1 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'approvals'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FileText size={18} />
            <span>审批请求</span>
            {approvalRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {approvalRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="搜索成员、钱包或请求..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          {activeTab === 'members' && (
            <>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white"
              >
                <option value="all">所有角色</option>
                <option value="admin">管理员</option>
                <option value="approver">审批者</option>
                <option value="spender">支出者</option>
                <option value="viewer">查看者</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white"
              >
                <option value="all">所有状态</option>
                <option value="active">活跃</option>
                <option value="pending">待处理</option>
                <option value="suspended">已暂停</option>
              </select>
            </>
          )}
          <button className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white hover:bg-secondary-700 transition-colors flex items-center space-x-2">
            <Filter size={16} />
            <span>更多筛选</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      ) : (
        <>
          {/* 团队成员标签 */}
          {activeTab === 'members' && (
            <div className="bg-secondary-800 rounded-lg border border-secondary-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">成员</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">角色</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">状态</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">加入时间</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">最后活跃</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-secondary-700/50 hover:bg-secondary-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                              <span className="text-white font-bold">{member.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role === 'admin' ? '管理员' :
                             member.role === 'approver' ? '审批者' :
                             member.role === 'spender' ? '支出者' : '查看者'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                            {member.status === 'active' ? '活跃' :
                             member.status === 'pending' ? '待处理' : '已暂停'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {member.lastActive ? new Date(member.lastActive).toLocaleDateString('zh-CN') : '从未'}
                        </td>
                        <td className="py-3 px-4">
                          <button className="p-1 hover:bg-secondary-700 rounded transition-colors">
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto mb-4" size={48} />
                  <p>没有找到匹配的成员</p>
                </div>
              )}
            </div>
          )}

          {/* 团队钱包标签 */}
          {activeTab === 'wallets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWallets.map((wallet) => (
                <div key={wallet.id} className="bg-secondary-800 rounded-lg border border-secondary-700 p-5 hover:border-primary-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{wallet.name}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-gray-400 text-sm">{wallet.chain}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-primary-400 text-sm font-medium">{wallet.requiredApprovals}/{wallet.members.length} 签名</span>
                      </div>
                    </div>
                    <Wallet className="text-blue-400" size={24} />
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-1">钱包地址</p>
                    <div className="flex items-center justify-between bg-secondary-900 rounded px-3 py-2">
                      <code className="text-gray-300 text-sm font-mono truncate">
                        {wallet.address}
                      </code>
                      <button className="text-primary-400 hover:text-primary-300 text-sm font-medium ml-2">
                        复制
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <p className="text-gray-400 text-sm mb-1">余额</p>
                    <p className="text-2xl font-bold text-white">{wallet.balance}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-2">访问成员</p>
                    <div className="flex items-center">
                      {wallet.members.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="h-8 w-8 rounded-full bg-secondary-700 border-2 border-secondary-800 -ml-2 first:ml-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-300">
                            {member.id === '1' ? 'A' : member.id === '2' ? 'B' : 'C'}
                          </span>
                        </div>
                      ))}
                      {wallet.members.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-secondary-700 border-2 border-secondary-800 -ml-2 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-300">
                            +{wallet.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredWallets.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Wallet className="mx-auto mb-4" size={48} />
                  <p>没有找到匹配的钱包</p>
                </div>
              )}
            </div>
          )}

          {/* 审批请求标签 */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {filteredApprovals.map((request) => (
                <div key={request.id} className="bg-secondary-800 rounded-lg border border-secondary-700 p-5 hover:border-secondary-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getRequestTypeColor(request.type)}`}>
                        {request.type === 'transaction' ? (
                          <Key size={20} />
                        ) : request.type === 'member_invite' ? (
                          <UserPlus size={20} />
                        ) : (
                          <Wallet size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">
                          {request.type === 'transaction' ? '交易审批请求' :
                           request.type === 'member_invite' ? '成员邀请审批' : '钱包创建审批'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          发起人: {request.initiator.name} ({request.initiator.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRequestStatusColor(request.status)}`}>
                        {request.status === 'pending' ? '待审批' :
                         request.status === 'approved' ? '已批准' :
                         request.status === 'rejected' ? '已拒绝' : '已过期'}
                      </span>
                      <button className="p-1 hover:bg-secondary-700 rounded transition-colors">
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 请求详情 */}
                  <div className="mb-4">
                    {request.type === 'transaction' && (
                      <div className="bg-secondary-900/50 rounded p-3">
                        <p className="text-gray-300 mb-1">向 {request.data.to.slice(0, 12)}...{request.data.to.slice(-8)} 发送</p>
                        <div className="flex items-center justify-between">
                          <p className="text-white font-bold">{request.data.amount} {request.data.asset}</p>
                          <p className="text-gray-400 text-sm">{request.data.memo}</p>
                        </div>
                      </div>
                    )}
                    {request.type === 'member_invite' && (
                      <div className="bg-secondary-900/50 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Mail size={16} className="text-gray-400" />
                          <p className="text-white">{request.data.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-400 text-sm">角色: {request.data.role}</span>
                          <span className="text-gray-400 text-sm">权限: {request.data.permissions.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    {request.type === 'wallet_creation' && (
                      <div className="bg-secondary-900/50 rounded p-3">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-white font-medium">{request.data.name}</p>
                            <p className="text-gray-400 text-sm">{request.data.chain}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-primary-400 font-medium">需要 {request.data.requiredApprovals} 个签名</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 审批进度 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">审批进度</p>
                      <p className="text-white text-sm">{request.currentApprovals}/{request.requiredApprovals} 已审批</p>
                    </div>
                    <div className="h-2 bg-secondary-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                        style={{ width: `${(request.currentApprovals / request.requiredApprovals) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>批准</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <XCircle size={18} />
                        <span>拒绝</span>
                      </button>
                    </div>
                  )}
                  
                  {/* 元信息 */}
                  <div className="mt-4 pt-4 border-t border-secondary-700/50 flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center space-x-4">
                      <span>创建时间: {new Date(request.createdAt).toLocaleString('zh-CN')}</span>
                      {request.expiresAt && (
                        <span className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>截止: {new Date(request.expiresAt).toLocaleString('zh-CN')}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.approvals.map((approval, idx) => (
                        <div key={idx} className="h-6 w-6 rounded-full bg-secondary-700 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {approval.approved ? '✓' : '?'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filteredApprovals.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>没有找到匹配的审批请求</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 邀请成员模态框 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">邀请新成员</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">邮箱地址</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="member@company.com"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">角色</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white"
                >
                  <option value="viewer">查看者 - 仅查看资产和交易</option>
                  <option value="spender">支出者 - 可发起交易</option>
                  <option value="approver">审批者 - 可审批交易</option>
                  <option value="admin">管理员 - 完全权限</option>
                </select>
              </div>
              
              <div className="bg-secondary-900/50 rounded p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">安全提示</p>
                    <p className="text-gray-400 text-xs mt-1">
                      新成员将收到邀请邮件，需要完成账户设置后才能访问团队资源。
                      请确保邮箱地址正确且属于可信成员。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSendInvite}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建团队钱包模态框 */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-800 rounded-lg border border-secondary-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">创建团队钱包</h3>
              <button
                onClick={() => setShowCreateWalletModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">钱包名称</label>
                <input
                  type="text"
                  value={newWalletData.name}
                  onChange={(e) => setNewWalletData({ ...newWalletData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如: 运营钱包、储备金钱包"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">区块链网络</label>
                <select
                  value={newWalletData.chain}
                  onChange={(e) => setNewWalletData({ ...newWalletData, chain: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white"
                >
                  <option value="Ethereum">Ethereum</option>
                  <option value="Solana">Solana</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Bitcoin">Bitcoin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">所需签名数</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newWalletData.requiredApprovals}
                    onChange={(e) => setNewWalletData({ ...newWalletData, requiredApprovals: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-white font-bold min-w-8 text-center">
                    {newWalletData.requiredApprovals}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  设置需要多少成员签名才能执行交易。更高的签名数提供更好的安全性。
                </p>
              </div>
              
              <div className="bg-secondary-900/50 rounded p-3">
                <div className="flex items-start space-x-2">
                  <Key size={16} className="text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-primary-400 text-sm font-medium">MPC钱包特性</p>
                    <p className="text-gray-400 text-xs mt-1">
                      此钱包将使用门限签名技术创建，私钥分片存储在不同成员设备中。
                      需要指定数量的成员签名才能完成交易，提供企业级安全性。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateWalletModal(false)}
                className="flex-1 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateWallet}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                创建钱包
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}