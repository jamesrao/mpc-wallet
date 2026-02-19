'use client'

import { TrendingUp, Wallet, Clock, ArrowUpRight, ArrowDownRight, PieChart, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('assets')

  const assets = [
    { name: '比特币 (BTC)', symbol: 'BTC', balance: '2.5432', value: '$128,450.32', change: '+3.24%', color: 'bg-orange-500' },
    { name: '以太坊 (ETH)', symbol: 'ETH', balance: '15.832', value: '$45,230.15', change: '+1.78%', color: 'bg-gray-700' },
    { name: 'Solana (SOL)', symbol: 'SOL', balance: '125.5', value: '$18,450.00', change: '+5.42%', color: 'bg-purple-600' },
    { name: 'USDC', symbol: 'USDC', balance: '50,000', value: '$50,000.00', change: '0.00%', color: 'bg-blue-500' },
  ]

  const recentTransactions = [
    { id: 1, type: '发送', asset: 'BTC', amount: '0.5 BTC', to: '0x8f9c...b2a4', time: '2分钟前', status: '已完成' },
    { id: 2, type: '兑换', asset: 'ETH', amount: '10 ETH → USDC', to: '兑换池', time: '1小时前', status: '已完成' },
    { id: 3, type: '接收', asset: 'SOL', amount: '25 SOL', from: '0x3a5d...e7f9', time: '3小时前', status: '已完成' },
    { id: 4, type: '质押', asset: 'ETH', amount: '5 ETH', to: '质押合约', time: '1天前', status: '进行中' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Dashboard Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">资产管理仪表板</h3>
            <p className="text-gray-600">实时资产概览和操作入口</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className="btn-primary flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              发送
            </button>
            <button className="btn-secondary flex items-center">
              <ArrowDownRight className="w-4 h-4 mr-2" />
              接收
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">总资产价值</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">$241,130.47</span>
                <span className="ml-3 text-success-600 font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.8% 今日
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600">资产种类</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">交易数量</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'assets' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('assets')}
          >
            <Wallet className="w-4 h-4 inline mr-2" />
            资产
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'transactions' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('transactions')}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            最近交易
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'analytics' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart className="w-4 h-4 inline mr-2" />
            分析
          </button>
        </div>

        {/* Assets Table */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${asset.color} flex items-center justify-center mr-4`}>
                    <span className="text-white font-bold">{asset.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-600">余额: {asset.balance}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{asset.value}</div>
                  <div className={`text-sm ${asset.change.startsWith('+') ? 'text-success-600' : 'text-gray-600'}`}>
                    {asset.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${tx.type === '发送' ? 'bg-danger-50 text-danger-600' : tx.type === '接收' ? 'bg-success-50 text-success-600' : 'bg-primary-50 text-primary-600'} flex items-center justify-center mr-4`}>
                    {tx.type === '发送' ? <ArrowUpRight className="w-5 h-5" /> :
                      tx.type === '接收' ? <ArrowDownRight className="w-5 h-5" /> :
                        <RefreshCw className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{tx.type} · {tx.asset}</div>
                    <div className="text-sm text-gray-600">{tx.to || tx.from}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{tx.amount}</div>
                  <div className="text-sm text-gray-600">{tx.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">资产分布</h4>
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${asset.color} mr-2`}></div>
                      <span className="text-gray-700">{asset.symbol}</span>
                    </div>
                    <span className="font-medium text-gray-900">{asset.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">交易统计</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>发送交易</span>
                    <span>8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-danger-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>接收交易</span>
                    <span>12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>兑换交易</span>
                    <span>5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">快速操作</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-2">
                <ArrowUpRight className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">发送</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center mb-2">
                <ArrowDownRight className="w-5 h-5 text-success-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">接收</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center mb-2">
                <RefreshCw className="w-5 h-5 text-warning-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">兑换</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">分析</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}