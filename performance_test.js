const http = require('http');
const { performance } = require('perf_hooks');

// 性能测试配置
const CONFIG = {
  baseURL: 'http://localhost:3000',
  concurrentUsers: 10,
  requestsPerUser: 100,
  endpoints: [
    { method: 'GET', path: '/health', name: '健康检查' },
    { method: 'POST', path: '/api/v1/users', name: '用户注册', 
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      })
    },
    { method: 'GET', path: '/api/v1/chain/balance/0x742d35Cc6634C0532925a3b844Bc454e4438f44e', name: '余额查询' },
    { method: 'POST', path: '/api/v1/contract/escrow/create', name: '创建托管合约',
      body: JSON.stringify({
        seller: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        arbitrator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        deadline: Math.floor(Date.now() / 1000) + 86400
      })
    }
  ]
};

class PerformanceTester {
  constructor(config) {
    this.config = config;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTime: 0,
      responseTimes: [],
      throughput: 0
    };
  }

  // 单个HTTP请求
  async makeRequest(endpoint) {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': endpoint.body ? Buffer.byteLength(endpoint.body) : 0
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            responseTime,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        resolve({
          success: false,
          error: error.message,
          responseTime
        });
      });

      if (endpoint.body) {
        req.write(endpoint.body);
      }
      
      req.end();
    });
  }

  // 单个虚拟用户测试
  async runVirtualUser(userId) {
    const userResults = [];
    
    for (let i = 0; i < this.config.requestsPerUser; i++) {
      const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
      
      const result = await this.makeRequest(endpoint);
      userResults.push({
        userId,
        requestId: i,
        endpoint: endpoint.name,
        ...result
      });
      
      // 随机延迟模拟真实用户行为
      await this.delay(Math.random() * 100);
    }
    
    return userResults;
  }

  // 并发测试
  async runConcurrentTest() {
    console.log('🚀 开始性能压力测试...');
    console.log(`配置: ${this.config.concurrentUsers}个并发用户, 每个用户${this.config.requestsPerUser}个请求`);
    
    const startTime = performance.now();
    
    // 创建并发用户
    const userPromises = [];
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      userPromises.push(this.runVirtualUser(i));
    }
    
    // 等待所有用户完成
    const allResults = await Promise.all(userPromises);
    const endTime = performance.now();
    
    // 分析结果
    this.analyzeResults(allResults, endTime - startTime);
    this.printReport();
  }

  // 分析测试结果
  analyzeResults(allResults, totalTime) {
    let totalRequests = 0;
    let successfulRequests = 0;
    const responseTimes = [];

    allResults.flat().forEach(result => {
      totalRequests++;
      
      if (result.success) {
        successfulRequests++;
      }
      
      responseTimes.push(result.responseTime);
    });

    this.results = {
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      totalTime,
      responseTimes,
      throughput: totalRequests / (totalTime / 1000) // 请求/秒
    };
  }

  // 生成性能报告
  printReport() {
    const results = this.results;
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const maxResponseTime = Math.max(...results.responseTimes);
    const minResponseTime = Math.min(...results.responseTimes);
    
    // 计算百分位响应时间
    const sortedTimes = [...results.responseTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    console.log('\n📊 性能测试报告');
    console.log('='.repeat(50));
    console.log(`总请求数: ${results.totalRequests}`);
    console.log(`成功请求: ${results.successfulRequests}`);
    console.log(`失败请求: ${results.failedRequests}`);
    console.log(`成功率: ${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%`);
    console.log(`\n⏱️ 响应时间统计:`);
    console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  最小响应时间: ${minResponseTime.toFixed(2)}ms`);
    console.log(`  最大响应时间: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`  P95响应时间: ${p95.toFixed(2)}ms`);
    console.log(`  P99响应时间: ${p99.toFixed(2)}ms`);
    console.log(`\n📈 吞吐量:`);
    console.log(`  总吞吐量: ${results.throughput.toFixed(2)} 请求/秒`);
    console.log(`  测试时长: ${(results.totalTime / 1000).toFixed(2)}秒`);
    
    // 性能评级
    let performanceRating = '优秀';
    if (avgResponseTime > 1000) {
      performanceRating = '需要优化';
    } else if (avgResponseTime > 500) {
      performanceRating = '良好';
    } else if (avgResponseTime > 200) {
      performanceRating = '一般';
    }
    
    console.log(`\n🏆 性能评级: ${performanceRating}`);
    
    // 建议
    if (results.failedRequests > 0) {
      console.log(`\n⚠️ 建议: 检查失败请求的原因，优化错误处理`);
    }
    
    if (avgResponseTime > 1000) {
      console.log(`⚠️ 建议: 响应时间过长，需要优化代码性能`);
    }
    
    if (results.throughput < 10) {
      console.log(`⚠️ 建议: 吞吐量较低，考虑增加服务器资源`);
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行测试
async function main() {
  try {
    const tester = new PerformanceTester(CONFIG);
    await tester.runConcurrentTest();
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  main();
}

module.exports = { PerformanceTester, CONFIG };