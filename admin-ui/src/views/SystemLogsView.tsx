import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle, CheckCircle, Info, XCircle, Filter } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  source: string
  details?: any
}

export default function SystemLogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock log data - in real app this would come from API
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 30),
        level: 'success',
        message: 'Math Agent successfully processed calculation request',
        source: 'orchestrator',
        details: { model: 'qwen/qwen-2.5-72b-instruct', responseTime: '2.3s' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        level: 'info',
        message: 'User authenticated with master key',
        source: 'auth',
        details: { userId: 'cortex-os-user' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        level: 'warning',
        message: 'DeepSeek R1 response time exceeded 30 seconds',
        source: 'worker_logic',
        details: { responseTime: '34.2s', timeout: '30s' }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        level: 'error',
        message: 'OpenRouter API rate limit exceeded',
        source: 'litellm',
        details: { retryAfter: '60s', model: 'deepseek/deepseek-r1' }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        level: 'info',
        message: 'System startup completed successfully',
        source: 'system',
        details: { version: '2.6.0', agents: 4 }
      }
    ]

    setLogs(mockLogs)

    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          message: [
            'Agent routing completed successfully',
            'New API key generated',
            'Memory insight generated',
            'User session refreshed'
          ][Math.floor(Math.random() * 4)],
          source: ['orchestrator', 'auth', 'memory', 'session'][Math.floor(Math.random() * 4)]
        }
        
        setLogs(prev => [newLog, ...prev].slice(0, 50)) // Keep only last 50 logs
      }, 10000) // Add new log every 10 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success': return CheckCircle
      case 'warning': return AlertCircle
      case 'error': return XCircle
      case 'info': 
      default: return Info
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-400 bg-green-500/20 border-green-400/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-400/30'
      case 'info':
      default: return 'text-blue-400 bg-blue-500/20 border-blue-400/30'
    }
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">System Logs</h1>
            <p className="text-white/60 text-sm">Real-time system activity and diagnostics</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto Refresh Toggle */}
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>

            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="glass-input text-sm pr-8 appearance-none cursor-pointer"
              >
                <option value="all">All Logs</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <Filter size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', count: logs.length, color: 'text-white' },
            { label: 'Errors', count: logs.filter(l => l.level === 'error').length, color: 'text-red-400' },
            { label: 'Warnings', count: logs.filter(l => l.level === 'warning').length, color: 'text-yellow-400' },
            { label: 'Success', count: logs.filter(l => l.level === 'success').length, color: 'text-green-400' }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {filteredLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="glass-panel p-8 max-w-md mx-auto">
                <Activity size={48} className="text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Logs Found</h3>
                <p className="text-white/60">
                  {filter === 'all' 
                    ? 'No system activity to display yet.'
                    : `No ${filter} logs found. Try changing the filter.`
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => {
                const Icon = getLogIcon(log.level)
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-panel p-4 border ${getLogColor(log.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={20} className="flex-shrink-0 mt-0.5" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{log.message}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>{log.source}</span>
                            <span>•</span>
                            <span>{log.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-white/70 text-sm cursor-pointer hover:text-white">
                              View Details
                            </summary>
                            <pre className="mt-2 bg-black/20 p-3 rounded text-xs font-mono text-white/80 overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}