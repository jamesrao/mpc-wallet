import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // 逐步增加到20个用户
    { duration: '1m', target: 20 },    // 保持20用户1分钟
    { duration: '30s', target: 0 },     // 逐步降为0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%请求响应时间小于500ms
    http_req_failed: ['rate<0.01'],    // 错误率小于1%
  },
};

export default function() {
  // 健康检查接口
  const healthRes = http.get('http://localhost:3000/health');
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  // 用户注册接口（模拟负载）
  const registerPayload = JSON.stringify({
    username: `testuser_${Math.random().toString(36).substring(7)}`,
    email: `test${Math.random().toString(36).substring(7)}@example.com`,
    password: 'Test123!'
  });
  
  const registerRes = http.post('http://localhost:3000/api/register', registerPayload, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(registerRes, {
    'register status is 201': (r) => r.status === 201,
  });
  
  sleep(1);
}