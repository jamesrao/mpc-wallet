'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Fingerprint, 
  Bell, 
  Clock, 
  Globe,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { securityApi } from '@/lib/api-client'
import { SecuritySettings, Device, LoginHistory } from '@/lib/types'

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'history' | 'settings'>('overview')
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    twoFactorMethod: 'authenticator',
    loginAlerts: true,
    transactionAlerts: true,
    withdrawalWhitelist: false,
    ipWhitelist: [],
    sessionTimeout: 60,
    biometricEnabled: true,
    passkeyEnabled: true
  })

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      os: 'macOS 14.2',
      browser: 'Chrome 121',
      lastActive: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
      isCurrent: true
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      os: 'iOS 17.2',
      browser: 'Safari',
      lastActive: '2024-01-14T11:20:00Z',
      ipAddress: '192.168.1.101',
      isCurrent: false
    },
    {
      id: '3',
      name: 'Windows Desktop',
      type: 'desktop',
      os: 'Windows 11',
      browser: 'Firefox 122',
      lastActive: '2024-01-10T09:15:00Z',
      ipAddress: '203.0.113.50',
      isCurrent: false
    }
  ])

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      device: 'MacBook Pro',
      ipAddress: '192.168.1.100',
      location: '上海, 中国',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-01-14T11:20:00Z',
      device: 'iPhone 15 Pro',
      ipAddress: '192.168.1.101',
      location: '上海, 中国',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-01-13T09:15:00Z',
      device: 'Windows Desktop',
      ipAddress: '203.0.113.50',
      location: '北京, 中国',
      status: 'failed',
      failureReason: '密码错误'
    },
    {
      id: '4',
      timestamp: '2024-01-12T08:45:00Z',
      device: 'MacBook Pro',
      ipAddress: '192.168.1.100',
      location: '上海, 中国',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-01-10T16:20:00Z',
      device: 'Android Phone',
      ipAddress: '198.51.100.23',
      location: '广州, 中国',
      status: 'failed',
      failureReason: '设备未授权'
    }
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [newDeviceName, setNewDeviceName] = useState('')

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    setIsLoading(true)
    try {
      // 实际API调用
      // const [settingsData, devicesData, historyData] = await Promise.all([
      //   securityApi.getSecuritySettings(),
      //   securityApi.getDevices(),
      //   securityApi.getLoginHistory()
      // ])
      
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    } catch (error) {
      console.error('加载安全数据失败:', error)
      setIsLoading(false)
    }
  }

  const handleToggleSetting = async (setting: keyof SecuritySettings) => {
    const newValue = !settings[setting]
    try {
      // 实际API调用
      // await securityApi.updateSecuritySettings({
      //   [setting]: newValue
      // })
      
      setSettings(prev => ({ ...prev, [setting]: newValue }))
    } catch (error) {
      console.error('更新设置失败:', error)
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('确定要撤销此设备的访问权限吗？')) return
    
    try {
      // 实际API调用
      // await securityApi.revokeDevice(deviceId)
      
      setDevices(prev => prev.filter(d => d.id !== deviceId))
      alert('设备已成功撤销')
    } catch (error) {
      console.error('撤销设备失败:', error)
    }
  }

  const handleUpdateTwoFactor = async () => {
    if (!twoFactorCode) {
      alert('请输入验证码')
      return
    }
    
    try {
      // 实际API调用
      // await securityApi.enableTwoFactor({ code: twoFactorCode })
      
      setSettings(prev => ({ ...prev, twoFactorEnabled: true }))
      setTwoFactorCode('')
      alert('双重认证已启用')
    } catch (error) {
      console.error('启用双重认证失败:', error)
    }
  }

  const handleDisableTwoFactor = async () => {
    if (!confirm('确定要禁用双重认证吗？这会降低账户安全性。')) return
    
    try {
      // 实际API调用
      // await securityApi.disableTwoFactor()
      
      setSettings(prev => ({ ...prev, twoFactorEnabled: false }))
      alert('双重认证已禁用')
    } catch (error) {
      console.error('禁用双重认证失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 to-gray-900">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 border-b border-secondary-700 bg-secondary-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-white">MPC钱包</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">仪表板</Link>
                <Link href="/transactions" className="text-gray-300 hover:text-primary-400 transition-colors">交易记录</Link>
                <Link href="/security" className="text-primary-400 font-medium">安全设置</Link>
                <Link href="/team" className="text-gray-300 hover:text-primary-400 transition-colors">团队</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">安全设置</h1>
            <p className="text-gray-400 mt-1">管理您的账户安全设置和访问权限</p>
          </div>

          {/* 安全评分卡片 */}
          <div className="mb-8">
            <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">安全评分</h3>
                  <p className="text-gray-400">基于您的安全设置评估</p>
                </div>
                <div className="relative">
                  <div className="w-24 h-24">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset="283"
                        style={{
                          strokeDashoffset: 283 - (283 * 85) / 100,
                          transform: 'rotate(-90deg)',
                          transformOrigin: 'center'
                        }}
                      />
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="24"
                        fontWeight="bold"
                      >
                        85%
                      </text>
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-success-400" />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-sm text-gray-400">活跃设备</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-400">5</div>
                  <div className="text-sm text-gray-400">安全功能启用</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2</div>
                  <div className="text-sm text-gray-400">失败登录</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-400">1</div>
                  <div className="text-sm text-gray-400">建议改进</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧导航 */}
            <div className="lg:col-span-1">
              <div className="bg-secondary-800 rounded-2xl border border-secondary-700 overflow-hidden">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'overview' ? 'bg-primary-900/30 text-primary-400 border-l-4 border-primary-500' : 'text-gray-300 hover:bg-secondary-700'}`}
                  >
                    <Shield className="w-5 h-5 mr-3" />
                    安全概览
                  </button>
                  <button
                    onClick={() => setActiveTab('devices')}
                    className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'devices' ? 'bg-primary-900/30 text-primary-400 border-l-4 border-primary-500' : 'text-gray-300 hover:bg-secondary-700'}`}
                  >
                    <Smartphone className="w-5 h-5 mr-3" />
                    设备管理
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'history' ? 'bg-primary-900/30 text-primary-400 border-l-4 border-primary-500' : 'text-gray-300 hover:bg-secondary-700'}`}
                  >
                    <Clock className="w-5 h-5 mr-3" />
                    登录历史
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-4 py-3 text-left ${activeTab === 'settings' ? 'bg-primary-900/30 text-primary-400 border-l-4 border-primary-500' : 'text-gray-300 hover:bg-secondary-700'}`}
                  >
                    <Lock className="w-5 h-5 mr-3" />
                    安全设置
                  </button>
                </nav>
              </div>
            </div>

            {/* 右侧内容 */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* 安全概览 */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* 双重认证 */}
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-primary-900/30 flex items-center justify-center mr-4">
                              <Lock className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">双重认证</h3>
                              <p className="text-sm text-gray-400">为您的账户添加额外保护层</p>
                            </div>
                          </div>
                          {settings.twoFactorEnabled ? (
                            <span className="badge-success">已启用</span>
                          ) : (
                            <span className="badge-warning">未启用</span>
                          )}
                        </div>
                        
                        {settings.twoFactorEnabled ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">认证方式</span>
                              <span className="text-white font-medium">
                                {settings.twoFactorMethod === 'authenticator' ? '身份验证器' :
                                 settings.twoFactorMethod === 'sms' ? '短信验证码' : '邮箱验证码'}
                              </span>
                            </div>
                            <button
                              onClick={handleDisableTwoFactor}
                              className="w-full py-2 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 transition-colors"
                            >
                              禁用双重认证
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-sm text-gray-400">
                              启用双重认证后，登录时需要除了密码之外的第二种验证方式。
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm text-gray-300">
                                输入验证器应用中的6位验证码
                              </label>
                              <input
                                type="text"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full bg-secondary-700 border border-secondary-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                              />
                            </div>
                            <button
                              onClick={handleUpdateTwoFactor}
                              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              启用双重认证
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 生物识别 */}
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-success-900/30 flex items-center justify-center mr-4">
                              <Fingerprint className="w-6 h-6 text-success-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">生物识别登录</h3>
                              <p className="text-sm text-gray-400">使用指纹或面部识别快速登录</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {settings.biometricEnabled && (
                              <span className="badge-success">指纹</span>
                            )}
                            {settings.passkeyEnabled && (
                              <span className="badge-primary">Passkey</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">指纹识别</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.biometricEnabled}
                                  onChange={() => handleToggleSetting('biometricEnabled')}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-600"></div>
                              </label>
                            </div>
                            <p className="text-xs text-gray-400">使用设备指纹传感器登录</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Passkey登录</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.passkeyEnabled}
                                  onChange={() => handleToggleSetting('passkeyEnabled')}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                              </label>
                            </div>
                            <p className="text-xs text-gray-400">无密码登录体验</p>
                          </div>
                        </div>
                      </div>

                      {/* 安全提醒 */}
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-warning-900/30 flex items-center justify-center mr-4">
                              <Bell className="w-6 h-6 text-warning-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">安全提醒</h3>
                              <p className="text-sm text-gray-400">接收账户活动通知</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">登录提醒</span>
                              <p className="text-xs text-gray-400">在新设备或位置登录时发送通知</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.loginAlerts}
                                onChange={() => handleToggleSetting('loginAlerts')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">交易提醒</span>
                              <p className="text-xs text-gray-400">大额交易或异常交易时发送通知</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.transactionAlerts}
                                onChange={() => handleToggleSetting('transactionAlerts')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 设备管理 */}
                  {activeTab === 'devices' && (
                    <div className="space-y-6">
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">已授权设备</h3>
                        
                        <div className="space-y-4">
                          {devices.map((device) => (
                            <div key={device.id} className="flex items-center justify-between p-4 bg-secondary-900/50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-secondary-700 flex items-center justify-center mr-4">
                                  <Smartphone className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{device.name}</span>
                                    {device.isCurrent && (
                                      <span className="badge-primary">当前设备</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {device.os} • {device.browser || device.type}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(device.lastActive).toLocaleString()} • {device.ipAddress}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                {!device.isCurrent && (
                                  <>
                                    <button className="p-2 text-gray-400 hover:text-primary-400">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleRevokeDevice(device.id)}
                                      className="p-2 text-gray-400 hover:text-danger-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">添加新设备</h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newDeviceName}
                              onChange={(e) => setNewDeviceName(e.target.value)}
                              placeholder="设备名称"
                              className="flex-1 bg-secondary-700 border border-secondary-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                              生成授权码
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                          <div className="text-sm">
                            <strong className="text-blue-300">设备安全提示：</strong>
                            <ul className="mt-2 space-y-1 text-blue-400/80">
                              <li>• 定期检查并撤销不再使用的设备</li>
                              <li>• 避免在公共设备上登录账户</li>
                              <li>• 启用设备授权码过期时间</li>
                              <li>• 发现可疑设备立即撤销</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 登录历史 */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">登录历史</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-secondary-700">
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">时间</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">设备</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">IP地址</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">位置</th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">状态</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loginHistory.map((login) => (
                                <tr key={login.id} className="border-b border-secondary-700/50">
                                  <td className="py-3 px-4 text-sm text-gray-300">
                                    {new Date(login.timestamp).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-300">{login.device}</td>
                                  <td className="py-3 px-4 text-sm text-gray-300">{login.ipAddress}</td>
                                  <td className="py-3 px-4 text-sm text-gray-300">{login.location || '-'}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      {login.status === 'success' ? (
                                        <>
                                          <CheckCircle className="w-4 h-4 text-success-400" />
                                          <span className="text-success-400 text-sm">成功</span>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-4 h-4 text-danger-400" />
                                          <span className="text-danger-400 text-sm">失败</span>
                                        </>
                                      )}
                                    </div>
                                    {login.failureReason && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {login.failureReason}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-400">
                            显示最近 {loginHistory.length} 条记录
                          </div>
                          <button className="text-primary-400 hover:text-primary-300 text-sm">
                            导出历史记录
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 安全设置 */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">账户安全设置</h3>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">会话超时时间</span>
                              <p className="text-sm text-gray-400">账户无操作后自动登出的时间</p>
                            </div>
                            <select
                              value={settings.sessionTimeout}
                              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                              className="bg-secondary-700 border border-secondary-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value={15}>15分钟</option>
                              <option value={30}>30分钟</option>
                              <option value={60}>1小时</option>
                              <option value={120}>2小时</option>
                              <option value={0}>从不超时</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">提现地址白名单</span>
                              <p className="text-sm text-gray-400">只允许向预先授权的地址提现</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.withdrawalWhitelist}
                                onChange={() => handleToggleSetting('withdrawalWhitelist')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-300">IP地址白名单</span>
                              <p className="text-sm text-gray-400">只允许从特定IP地址登录</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.ipWhitelist && settings.ipWhitelist.length > 0}
                                onChange={() => {
                                  if (settings.ipWhitelist && settings.ipWhitelist.length > 0) {
                                    setSettings(prev => ({ ...prev, ipWhitelist: [] }))
                                  } else {
                                    setSettings(prev => ({ ...prev, ipWhitelist: ['192.168.1.100'] }))
                                  }
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary-800 rounded-2xl border border-secondary-700 p-6">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-warning-400 mr-2 mt-0.5" />
                          <div className="text-sm">
                            <strong className="text-warning-300">安全建议：</strong>
                            <ul className="mt-2 space-y-1 text-warning-400/80">
                              <li>• 建议启用双重认证</li>
                              <li>• 定期更新密码</li>
                              <li>• 不要在公共WiFi下进行敏感操作</li>
                              <li>• 定期检查登录历史和设备</li>
                              <li>• 启用所有可用的安全提醒</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}