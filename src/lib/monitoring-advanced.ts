// Monitoring avancé pour SmartManager
interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: {
    userId?: string
    tenantId?: string
    route?: string
    method?: string
    statusCode?: number
    duration?: number
    error?: string
    metadata?: Record<string, any>
  }
}

interface MetricData {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface PerformanceMetrics {
  requestCount: number
  errorCount: number
  averageResponseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
}

class SmartManagerMonitoring {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private metrics: Map<string, MetricData[]> = new Map()
  private performanceMetrics: PerformanceMetrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  }
  private startTime: number = Date.now()

  constructor() {
    this.setupMetricsCollection()
  }

  private setupMetricsCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics()
    }, 30000)

    setInterval(() => {
      this.cleanupOldMetrics()
    }, 300000)
  }

  private createLog(level: LogEntry['level'], message: string, context?: LogEntry['context']): void {
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }

    this.logs.push(log)
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           level === 'debug' ? console.debug : console.info
      consoleMethod(`[${level.toUpperCase()}] ${message}`, context)
    }

    this.sendToExternalService(log)
  }

  private sendToExternalService(log: LogEntry): void {
    if (process.env.MONITORING_ENDPOINT) {
      fetch(process.env.MONITORING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_TOKEN}`
        },
        body: JSON.stringify({
          log,
          service: 'smartmanager',
          environment: process.env.NODE_ENV,
          timestamp: Date.now()
        })
      }).catch(error => {
        console.error('Erreur envoi monitoring:', error)
      })
    }
  }

  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    this.recordMetric('memory_heap_used', memoryUsage.heapUsed)
    this.recordMetric('memory_heap_total', memoryUsage.heapTotal)
    this.recordMetric('memory_external', memoryUsage.external)
    this.recordMetric('memory_rss', memoryUsage.rss)

    this.recordMetric('cpu_user', cpuUsage.user)
    this.recordMetric('cpu_system', cpuUsage.system)

    this.performanceMetrics.memoryUsage = memoryUsage
    this.performanceMetrics.cpuUsage = cpuUsage
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - 300000

    for (const [name, metricArray] of this.metrics.entries()) {
      const filtered = metricArray.filter(metric => metric.timestamp > cutoffTime)
      this.metrics.set(name, filtered)
    }
  }

  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricArray = this.metrics.get(name)!
    metricArray.push(metric)

    if (metricArray.length > 1000) {
      metricArray.shift()
    }

    this.sendToMonitoringService(metric)
  }

  private sendToMonitoringService(metric: MetricData): void {
    if (process.env.MONITORING_ENDPOINT) {
      fetch(process.env.MONITORING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_TOKEN}`
        },
        body: JSON.stringify({
          metric,
          service: 'smartmanager',
          environment: process.env.NODE_ENV,
          timestamp: Date.now()
        })
      }).catch(error => {
        console.error('Erreur envoi métriques:', error)
      })
    }
  }

  private updateAverageResponseTime(duration: number): void {
    const totalRequests = this.performanceMetrics.requestCount
    const currentAverage = this.performanceMetrics.averageResponseTime
    
    this.performanceMetrics.averageResponseTime = 
      (currentAverage * (totalRequests - 1) + duration) / totalRequests
  }

  private getHealthStatus(errorRate: number, avgResponseTime: number): 'healthy' | 'warning' | 'critical' {
    if (errorRate > 10 || avgResponseTime > 2000) {
      return 'critical'
    } else if (errorRate > 5 || avgResponseTime > 1000) {
      return 'warning'
    } else {
      return 'healthy'
    }
  }

  public info(message: string, context?: LogEntry['context']): void {
    this.createLog('info', message, context)
  }

  public warn(message: string, context?: LogEntry['context']): void {
    this.createLog('warn', message, context)
  }

  public error(message: string, context?: LogEntry['context']): void {
    this.createLog('error', message, context)
  }

  public debug(message: string, context?: LogEntry['context']): void {
    this.createLog('debug', message, context)
  }

  public recordRequest(endpoint: string, duration: number, statusCode: number): void {
    this.performanceMetrics.requestCount++
    
    if (statusCode >= 400) {
      this.performanceMetrics.errorCount++
    }

    this.recordMetric('api_request_duration', duration, {
      endpoint,
      status_code: statusCode.toString()
    })

    this.recordMetric('api_request_count', 1, {
      endpoint,
      status_code: statusCode.toString()
    })

    this.updateAverageResponseTime(duration)
  }

  public getMetrics(): PerformanceMetrics & { uptime: number } {
    return {
      ...this.performanceMetrics,
      uptime: Date.now() - this.startTime
    }
  }

  public generateHealthReport(): any {
    const metrics = this.getMetrics()
    const errorRate = metrics.requestCount > 0 
      ? (metrics.errorCount / metrics.requestCount) * 100 
      : 0

    return {
      status: this.getHealthStatus(errorRate, metrics.averageResponseTime),
      metrics: {
        uptime: metrics.uptime,
        requestCount: metrics.requestCount,
        errorCount: metrics.errorCount,
        errorRate: errorRate.toFixed(2) + '%',
        averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
        memoryUsage: {
          heapUsed: (metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
          heapTotal: (metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + 'MB',
          rss: (metrics.memoryUsage.rss / 1024 / 1024).toFixed(2) + 'MB'
        }
      },
      timestamp: new Date().toISOString()
    }
  }

  public middleware(): any {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now()
      
      const originalSend = res.send
      res.send = function(data: any) {
        const duration = Date.now() - startTime
        monitoring.recordRequest(req.path, duration, res.statusCode)
        originalSend.call(this, data)
      }

      next()
    }
  }
}

export const monitoring = new SmartManagerMonitoring()

export const recordApiCall = (endpoint: string, duration: number, statusCode: number): void => {
  monitoring.recordRequest(endpoint, duration, statusCode)
}

export const recordError = (error: Error, context?: Record<string, any>): void => {
  monitoring.error(error.message, {
    error: error.stack,
    ...context
  })
}

export const recordMetric = (name: string, value: number, tags?: Record<string, string>): void => {
  monitoring.recordMetric(name, value, tags)
}

export const getHealthReport = (): any => {
  return monitoring.generateHealthReport()
}
