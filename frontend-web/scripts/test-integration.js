// 前端-后端联调测试脚本
// 可以直接在浏览器控制台运行，或通过脚本执行

class IntegrationTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000'
    this.testResults = []
  }

  // 测试API连通性
  async testApiConnectivity() {
    const endpoints = [
      '/api/v1/health',
      '/api/v1/auth/status',
      '/api/v1/wallets',
      '/api/v1/assets'
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const result = {
          endpoint,
          status: response.status,
          ok: response.ok,
          timestamp: new Date().toISOString()
        }
        
        this.testResults.push(result)
        console.log(`✅ ${endpoint}: ${response.status} ${response.ok ? 'OK' : 'FAILED'}`)
      } catch (error) {
        console.error(`❌ ${endpoint}: ${error.message}`)
        this.testResults.push({
          endpoint,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  // 测试页面路由
  async testPageRoutes() {
    const routes = [
      '/',
      '/dashboard',
      '/login',
      '/auth/facebook',
      '/auth/facial',
      '/auth/forgot-password',
      '/wallet/create',
      '/transactions',
      '/transactions/send',
      '/transactions/receive'
    ]

    for (const route of routes) {
      try {
        const response = await fetch(`${this.baseUrl}${route}`, {
          method: 'GET'
        })
        
        const result = {
          route,
          status: response.status,
          ok: response.ok,
          timestamp: new Date().toISOString()
        }
        
        this.testResults.push(result)
        console.log(`🌐 ${route}: ${response.status} ${response.ok ? 'OK' : 'NOT FOUND'}`)
      } catch (error) {
        console.error(`❌ ${route}: ${error.message}`)
        this.testResults.push({
          route,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  // 生成测试报告
  generateReport() {
    const passed = this.testResults.filter(r => r.ok).length
    const failed = this.testResults.filter(r => !r.ok).length
    const total = this.testResults.length
    
    console.log('\n📊 测试报告')
    console.log('==============')
    console.log(`✅ 通过: ${passed}`)
    console.log(`❌ 失败: ${failed}`)
    console.log(`📈 成功率: ${((passed / total) * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n📋 失败详情:')
      this.testResults.filter(r => !r.ok).forEach(r => {
        console.log(`   - ${r.endpoint || r.route}: ${r.error || 'HTTP ' + r.status}`)
      })
    }
    
    return {
      passed,
      failed,
      total,
      successRate: (passed / total) * 100,
      details: this.testResults
    }
  }

  // 运行完整测试套件
  async runFullTest() {
    console.log('🚀 开始前端-后端联调测试...')
    console.log('==============================')
    
    await this.testApiConnectivity()
    await this.testPageRoutes()
    
    return this.generateReport()
  }
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationTester
}

// 浏览器环境下的使用方法
if (typeof window !== 'undefined') {
  window.IntegrationTester = IntegrationTester
  
  // 添加一个简单的测试按钮到页面
  function addTestButton() {
    const button = document.createElement('button')
    button.textContent = '🧪 运行联调测试'
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #10b981;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `
    
    button.onclick = async () => {
      const tester = new IntegrationTester()
      await tester.runFullTest()
    }
    
    document.body.appendChild(button)
  }
  
  // 页面加载后添加测试按钮
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTestButton)
  } else {
    addTestButton()
  }
}

// 命令行使用方法
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new IntegrationTester()
  tester.runFullTest().then(report => {
    process.exit(report.failed > 0 ? 1 : 0)
  })
}