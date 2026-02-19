import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MPC企业级Web3钱包 - 安全、易用、无密码',
  description: '基于门限签名(MPC)技术的企业级Web3钱包，集成Solana Passkey无密码认证，支持人脸识别、指纹等生物识别方式，为跨境电商区块链供应链金融平台提供安全可靠的数字资产管理解决方案。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-secondary-900 text-gray-100 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-secondary-700 bg-secondary-800/80 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-xl font-bold text-white">MPC钱包</span>
                </div>
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="/" className="text-gray-300 hover:text-primary-400 transition-colors">首页</a>
                  <a href="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">资产</a>
                  <a href="/transactions" className="text-gray-300 hover:text-primary-400 transition-colors">交易</a>
                  <a href="/security" className="text-gray-300 hover:text-primary-400 transition-colors">安全</a>
                  <a href="/team" className="text-gray-300 hover:text-primary-400 transition-colors">团队</a>
                </nav>
                <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all">
                  开始使用
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-secondary-700 bg-secondary-800 py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500"></div>
                    <span className="font-bold text-white">MPC企业级Web3钱包</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">© 2026 浙大实验室密码学研究成果转化</p>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-primary-400">隐私政策</a>
                  <a href="#" className="text-gray-400 hover:text-primary-400">服务条款</a>
                  <a href="#" className="text-gray-400 hover:text-primary-400">帮助中心</a>
                  <a href="#" className="text-gray-400 hover:text-primary-400">联系我们</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}