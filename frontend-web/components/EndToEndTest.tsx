'use client'

import { useState } from 'react'
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { mpcApi } from '@/lib/mpc-client'

interface TestResult {
  step: string
  status: string
  details?: any
}

interface TestSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests?: number
  duration: number
}

export default function EndToEndTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [error, setError] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    setIsRunning(true)
    setError('')
    setTestResults([])
    setTestSummary(null)

    try {
      const result = await mpcApi.runEndToEndTest()
      
      if (result.success) {
        setTestResults(result.results)
        setTestSummary(result.summary || null)
      } else {
        setError(result.error || '测试运行失败')
      }
    } catch (err) {
      setError('测试执行过程中发生错误')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-yellow-600 bg-yellow-100'
      case 'passed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">端到端测试</h2>
          <p className="text-gray-600 mt-1">测试完整的MPC钱包工作流程：服务健康检查 → 密钥生成 → 签名 → 区块链交互</p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">测试流程</h3>
              <p className="text-gray-600 text-sm">点击下方按钮开始端到端测试</p>
            </div>
            
            <button
              onClick={runTest}
              disabled={isRunning}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isRunning ? '测试中...' : '运行端到端测试'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 font-medium">错误：</span>
                <span className="text-red-600 ml-1">{error}</span>
              </div>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="space-y-4 mb-6">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <span className="font-medium text-gray-900">{result.step}</span>
                      {result.details && (
                        <div className="text-sm text-gray-600 mt-1">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status === 'running' ? '进行中' : result.status === 'passed' ? '通过' : '失败'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {testSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">测试总结</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testSummary.totalTests}</div>
                  <div className="text-sm text-blue-600">总测试数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testSummary.passedTests}</div>
                  <div className="text-sm text-green-600">通过测试</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testSummary.failedTests}</div>
                  <div className="text-sm text-red-600">失败测试</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{testSummary.skippedTests || 0}</div>
                  <div className="text-sm text-yellow-600">跳过测试</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{testSummary.duration}s</div>
                  <div className="text-sm text-gray-600">测试时长</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}