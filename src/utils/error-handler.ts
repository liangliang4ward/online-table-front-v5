import type { App } from 'vue'
import config from '@/config'

interface ErrorInfo {
  err: Error
  vm?: any
  info?: string
}

class ErrorHandler {
  private app: App | null = null

  /**
   * 初始化错误处理器
   */
  setup(app: App) {
    this.app = app
    this.setupVueErrorHandler()
    this.setupPromiseErrorHandler()
    this.setupJavaScriptErrorHandler()
  }

  /**
   * Vue 错误处理器
   */
  private setupVueErrorHandler() {
    if (!this.app) return

    this.app.config.errorHandler = (err: unknown, vm: any, info: string) => {
      const errorInfo: ErrorInfo = {
        err: err instanceof Error ? err : new Error(String(err)),
        vm,
        info
      }

      this.handleError(errorInfo, 'Vue Error')
    }
  }

  /**
   * Promise 错误处理器
   */
  private setupPromiseErrorHandler() {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        err: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      }

      this.handleError(errorInfo, 'Promise Error')

      // 阻止默认行为（控制台打印错误）
      event.preventDefault()
    })
  }

  /**
   * JavaScript 错误处理器
   */
  private setupJavaScriptErrorHandler() {
    window.addEventListener('error', (event: ErrorEvent) => {
      // 忽略资源加载错误
      if (event.target !== window) {
        return
      }

      const errorInfo: ErrorInfo = {
        err: event.error instanceof Error ? event.error : new Error(event.message),
        info: `${event.filename}:${event.lineno}:${event.colno}`
      }

      this.handleError(errorInfo, 'JavaScript Error')
    })
  }

  /**
   * 统一错误处理
   */
  private handleError(errorInfo: ErrorInfo, errorType: string) {
    const { err, vm, info } = errorInfo

    // 开发环境：打印详细错误信息
    if (config.enableLog) {
      console.error(`[${errorType}]`, {
        message: err.message,
        stack: err.stack,
        vm,
        info,
        timestamp: new Date().toISOString()
      })
    }

    // 生产环境：可以上报到监控系统
    // 例如：Sentry、自建监控系统等
    if (config.env === 'production') {
      this.reportError(errorInfo, errorType)
    }

    // 可以根据错误类型进行特定处理
    this.handleSpecificError(err)
  }

  /**
   * 处理特定错误
   */
  private handleSpecificError(err: Error) {
    // 网络错误
    if (err.message.includes('Network Error') || err.message.includes('timeout')) {
      console.warn('网络错误，请检查网络连接')
    }

    // API 错误
    if (err.message.includes('401')) {
      console.warn('认证失败，请重新登录')
    }

    if (err.message.includes('403')) {
      console.warn('权限不足')
    }

    if (err.message.includes('404')) {
      console.warn('资源不存在')
    }

    if (err.message.includes('500')) {
      console.warn('服务器错误')
    }
  }

  /**
   * 上报错误到监控系统（示例）
   */
  private reportError(errorInfo: ErrorInfo, errorType: string) {
    // 这里可以集成 Sentry、自建监控系统等
    // 示例：
    /*
    Sentry.captureException(errorInfo.err, {
      tags: {
        errorType,
        environment: config.env
      },
      extra: {
        vm: errorInfo.vm,
        info: errorInfo.info
      }
    })
    */

    // 暂时只在生产环境打印简要错误
    console.error(`[${errorType}] ${errorInfo.err.message}`)
  }
}

// 创建单例
const errorHandler = new ErrorHandler()

export function setupErrorHandler(app: App) {
  errorHandler.setup(app)
}

export default errorHandler