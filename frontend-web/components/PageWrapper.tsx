'use client'

import { ReactNode, Suspense } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Loader2 } from 'lucide-react'

interface PageWrapperProps {
  children: ReactNode
  loadingText?: string
}

export function PageWrapper({ children, loadingText = "加载中..." }: PageWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-900 via-purple-900 to-blue-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-lg">{loadingText}</p>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// 更新布局组件，添加统一的错误处理
export function LayoutWithErrorHandling({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}