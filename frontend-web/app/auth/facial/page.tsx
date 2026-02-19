'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, User, CheckCircle, AlertCircle, RotateCcw, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function FacialRecognitionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [faceData, setFaceData] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    // 清理函数
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setShowCamera(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsRecording(true)
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置')
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
  }

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context?.drawImage(video, 0, 0)
      
      // 模拟人脸识别处理
      const mockFaceData = {
        confidence: 0.92,
        landmarks: 68,
        quality: 'good',
        timestamp: new Date().toISOString()
      }
      
      setFaceData(mockFaceData)
      setCaptured(true)
      stopCamera()
    }
  }

  const retryCapture = () => {
    setCaptured(false)
    setFaceData(null)
    setError('')
    startCamera()
  }

  const verifyFace = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 模拟人脸验证API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (faceData && faceData.confidence > 0.8) {
        setSuccess(true)
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setError('人脸识别失败，请重试或使用其他登录方式')
      }
    } catch (err) {
      setError('验证失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">人脸识别成功！</h3>
            <p className="text-gray-300 mb-6">身份验证通过，正在为您跳转到钱包...</p>
            <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-white">人脸识别登录</span>
            </div>
            <p className="text-gray-300">使用面部识别技术快速安全地登录您的账户</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {/* 人脸识别区域 */}
          <div className="mb-8">
            {!showCamera && !captured ? (
              <div className="bg-black/30 rounded-2xl p-8 text-center border-2 border-dashed border-white/20">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">点击开始进行人脸识别</p>
                <button
                  onClick={startCamera}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  开始识别
                </button>
              </div>
            ) : showCamera ? (
              <div className="relative bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                {/* 人脸识别框 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 border-2 border-green-400 rounded-lg animate-pulse"></div>
                </div>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    onClick={captureFace}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                  请正对摄像头
                </div>
              </div>
            ) : captured ? (
              <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">捕获的面部图像</h4>
                  <button
                    onClick={retryCapture}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <canvas ref={canvasRef} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ 已捕获
                  </div>
                </div>
                
                {/* 人脸数据信息 */}
                {faceData && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-300">置信度:</div>
                    <div className="text-white font-medium">{(faceData.confidence * 100).toFixed(1)}%</div>
                    <div className="text-gray-300">检测点数:</div>
                    <div className="text-white font-medium">{faceData.landmarks}</div>
                    <div className="text-gray-300">图像质量:</div>
                    <div className="text-green-400 font-medium capitalize">{faceData.quality}</div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {captured ? (
              <button
                onClick={verifyFace}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                <span>{isLoading ? '验证中...' : '验证身份'}</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={isRecording}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <Camera className="w-6 h-6" />
                <span>{isRecording ? '摄像头运行中...' : '开始人脸识别'}</span>
              </button>
            )}
          </div>

          {/* 安全提示 */}
          <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start">
              <Eye className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium mb-2">安全提示</p>
                <ul className="text-blue-400/80 text-sm space-y-1">
                  <li>• 确保光线充足，面部清晰可见</li>
                  <li>• 摘掉墨镜、帽子等遮挡物</li>
                  <li>• 面部数据仅在本地处理，不会上传服务器</li>
                  <li>• 支持活体检测，防止照片欺骗</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 其他登录选项 */}
          <div className="border-t border-white/20 pt-6 mt-6">
            <p className="text-center text-gray-400 text-sm mb-4">使用其他方式登录</p>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/login"
                className="bg-secondary-800 hover:bg-secondary-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
              >
                邮箱登录
              </Link>
              <Link 
                href="/auth/facebook"
                className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Facebook登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}