import PasskeyDemo from '@/components/PasskeyDemo'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PasskeyDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Passkey 无密码认证技术演示
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              体验基于 WebAuthn 标准的下一代身份验证技术。
              通过面部识别、指纹等生物识别方式，实现安全便捷的无密码登录。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主演示区域 */}
            <div className="lg:col-span-2">
              <div className="card shadow-xl">
                <PasskeyDemo />
              </div>
            </div>

            {/* 技术信息侧边栏 */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔐 技术原理
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></div>
                    <span>基于 W3C WebAuthn 标准</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></div>
                    <span>密钥存储在设备安全区域</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></div>
                    <span>使用公钥密码学替代密码</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></div>
                    <span>支持跨设备同步和备份</span>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 核心优势
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 mr-2"></div>
                    <span>消除密码泄露风险</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 mr-2"></div>
                    <span>防网络钓鱼攻击</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 mr-2"></div>
                    <span>无缝用户体验</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-success-500 mt-1.5 mr-2"></div>
                    <span>企业级安全标准</span>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📱 支持设备
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Apple 设备</p>
                      <p className="text-xs text-gray-500">Secure Enclave + Face ID / Touch ID</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Android 设备</p>
                      <p className="text-xs text-gray-500">Android Keystore + 指纹识别</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-medium">W</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Windows 设备</p>
                      <p className="text-xs text-gray-500">TPM 2.0 + Windows Hello</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 技术对比表格 */}
          <div className="mt-12 card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              与传统认证方式对比
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left font-medium text-gray-900">对比项目</th>
                    <th className="py-3 text-left font-medium text-gray-900">传统密码</th>
                    <th className="py-3 text-left font-medium text-gray-900">短信验证码</th>
                    <th className="py-3 text-left font-medium text-gray-900">Passkey 认证</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 font-medium text-gray-900">安全级别</td>
                    <td className="py-3 text-gray-600">低 - 易被钓鱼、泄露</td>
                    <td className="py-3 text-gray-600">中 - SIM卡交换攻击</td>
                    <td className="py-3 text-success-600 font-medium">高 - 设备硬件绑定</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-900">用户体验</td>
                    <td className="py-3 text-gray-600">差 - 需要记忆复杂密码</td>
                    <td className="py-3 text-gray-600">中 - 需要等待短信</td>
                    <td className="py-3 text-success-600 font-medium">优 - 生物识别一键登录</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-900">防钓鱼能力</td>
                    <td className="py-3 text-gray-600">无 - 用户可能输入到假网站</td>
                    <td className="py-3 text-gray-600">弱 - 可能转发验证码</td>
                    <td className="py-3 text-success-600 font-medium">强 - 域名绑定自动验证</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-900">恢复机制</td>
                    <td className="py-3 text-gray-600">重置密码邮件/SMS</td>
                    <td className="py-3 text-gray-600">依赖手机号码</td>
                    <td className="py-3 text-gray-600">云端同步 + 备用设备</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-900">合规要求</td>
                    <td className="py-3 text-gray-600">密码策略、定期更换</td>
                    <td className="py-3 text-gray-600">电信业务许可</td>
                    <td className="py-3 text-gray-600">GDPR隐私保护、FIDO2认证</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 行动号召 */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                准备好为您的产品集成 Passkey 了吗？
              </h3>
              <p className="text-gray-700 mb-6">
                我们的技术团队提供完整的 Passkey 集成解决方案，
                帮助您快速实现无密码认证，提升用户体验和安全性。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="btn-primary"
                >
                  返回首页
                </Link>
                <button className="btn-secondary">
                  联系技术团队
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}