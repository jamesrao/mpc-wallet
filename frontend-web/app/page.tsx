import { Shield, Zap, Lock, Users, Smartphone, Globe, ArrowRight, CheckCircle, Play, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import PasskeyDemo from '@/components/PasskeyDemo'
import DashboardPreview from '@/components/DashboardPreview'
import EndToEndTest from '@/components/EndToEndTest'

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-24 pb-24">
      {/* Hero Section */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              基于MPC技术 · 企业级安全
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              下一代
              <span className="text-primary-400"> Web3钱包</span>
              <br />
              无密码，更安全
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              集成 Solana Passkey 无密码认证技术，支持人脸识别、指纹等生物识别方式。
              为企业级用户提供安全、易用、合规的数字资产管理解决方案。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary flex items-center justify-center">
                立即体验
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/passkey-demo" className="btn-secondary flex items-center justify-center">
                了解技术细节
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              为什么选择 MPC 钱包
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              借鉴 Zengo 等领先 MPC 钱包的用户体验设计，结合企业级安全需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">无种子短语风险</h3>
              <p className="text-gray-300">
                采用多方计算(MPC)技术，完全消除传统种子短语的泄露风险。私钥分片存储，永不完整出现。
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">生物识别登录</h3>
              <p className="text-gray-300">
                支持人脸识别、指纹等设备原生生物识别技术。注册即用，无需记忆复杂密码。
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">企业级多签</h3>
              <p className="text-gray-300">
                支持多级审批流程，符合企业合规要求。灵活的权限管理和审计跟踪。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Passkey Integration */}
      <section className="py-12 bg-gradient-to-b from-secondary-800 to-secondary-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-900/20 text-success-300 text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                集成 Solana Passkey 技术
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                真正的无密码体验
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">基于 WebAuthn 标准，使用设备安全区域存储密钥</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">支持跨设备同步，通过 iCloud/Google Password Manager 备份</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">防网络钓鱼攻击，域名绑定确保安全</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-success-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">交易确认无缝集成，生物识别自动签名</span>
                </li>
              </ul>
              <button className="btn-primary">
                了解 Passkey 技术细节
              </button>
            </div>
            <div className="bg-secondary-800 rounded-2xl shadow-xl p-8 border border-secondary-700">
              <PasskeyDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              企业级安全架构
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              专为跨境电商供应链金融平台设计的多层安全防护
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="w-10 h-10 rounded-lg bg-primary-900/20 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">实时风控</h3>
              <p className="text-gray-300 text-sm">
                基于机器学习的交易监控系统，实时检测异常行为并自动阻断。
              </p>
            </div>
            <div className="card">
              <div className="w-10 h-10 rounded-lg bg-primary-900/20 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">多链支持</h3>
              <p className="text-gray-300 text-sm">
                支持 Ethereum、Polygon、BNB Chain、Solana 等多条主流区块链。
              </p>
            </div>
            <div className="card">
              <div className="w-10 h-10 rounded-lg bg-primary-900/20 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">合规审计</h3>
              <p className="text-gray-300 text-sm">
                完整的操作日志和审计跟踪，满足 GDPR、AML 等合规要求。
              </p>
            </div>
            <div className="card">
              <div className="w-10 h-10 rounded-lg bg-primary-900/20 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">团队协作</h3>
              <p className="text-gray-300 text-sm">
                支持角色权限管理、多级审批流程和团队钱包共享。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-12 bg-gradient-to-b from-secondary-800 to-secondary-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              直观的资产管理界面
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              借鉴 Zengo 钱包的简洁设计理念，提供清晰易懂的资产概览和操作入口
            </p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* 端到端测试 */}
      <section className="py-16 bg-gradient-to-b from-secondary-800 to-secondary-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              端到端功能测试
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              测试当前可用的服务功能：MPC核心服务、区块链连接、前端界面
            </p>
          </div>
          
          {/* 信息提示 */}
          <div className="mb-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-300">注意：模拟测试模式</h3>
                <div className="mt-1 text-sm text-blue-400">
                  <p>当前后端服务正在开发中，端到端测试使用模拟数据展示功能流程。</p>
                  <p className="mt-1">所有5个测试步骤将显示为通过状态，演示完整的MPC钱包工作流程。</p>
                </div>
              </div>
            </div>
          </div>
          
          <EndToEndTest />
          
          {/* 后续步骤 */}
          <div className="mt-8 pt-6 border-t border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-3">下一步计划</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                前端界面和用户体验已完善
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                端到端测试框架已建立
              </li>
              <li className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                MPC服务API开发中（当前仅健康检查可用）
              </li>
              <li className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                区块链中间件服务待修复
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center card bg-gradient-to-r from-primary-900/20 to-accent-900/20 border-primary-700">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              准备好体验下一代 Web3 钱包了吗？
            </h2>
            <p className="text-gray-300 mb-8">
              注册即可享受无密码登录、企业级安全保护和专业的客户支持。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                免费开始使用
              </button>
              <button className="btn-secondary">
                预约演示
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}