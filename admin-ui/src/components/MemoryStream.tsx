import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, TrendingUp, Clock, Eye } from 'lucide-react'

interface MemoryInsight {
  id: string
  type: 'correlation' | 'optimization' | 'learning' | 'pattern'
  title: string
  description: string
  timestamp: Date
  confidence: number
  source: string
}

export default function MemoryStream() {
  // Mock real-time memory insights
  const insights: MemoryInsight[] = [
    {
      id: '1',
      type: 'pattern',
      title: 'Agent Selection Pattern',
      description: 'Math problems consistently routed to Qwen 2.5 with 96% accuracy',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      confidence: 0.96,
      source: 'orchestrator'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Response Time Optimization',
      description: 'DeepSeek R1 responses 15% faster after prompt optimization',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      confidence: 0.89,
      source: 'performance'
    },
    {
      id: '3',
      type: 'learning',
      title: 'User Preference Detected',
      description: 'Prefers detailed mathematical explanations with step-by-step breakdowns',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      confidence: 0.92,
      source: 'user-behavior'
    },
    {
      id: '4',
      type: 'correlation',
      title: 'Model Performance Correlation',
      description: 'Complex reasoning tasks show 23% better results with DeepSeek R1',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      confidence: 0.87,
      source: 'analytics'
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation': return Zap
      case 'optimization': return TrendingUp
      case 'learning': return Brain
      case 'pattern': return Eye
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'correlation': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30 text-yellow-100'
      case 'optimization': return 'from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-100'
      case 'learning': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-100'
      case 'pattern': return 'from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-100'
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/30 text-gray-100'
    }
  }

  return (
    <div className="h-full flex flex-col glass-nav border-l border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={20} className="text-white" />
          <h2 className="text-lg font-semibold text-white">Memory Stream</h2>
        </div>
        <p className="text-white/60 text-sm">Live intelligence insights</p>
      </div>

      {/* Live Indicator */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 font-medium">Live</span>
          <span className="text-white/60">• {insights.length} insights</span>
        </div>
      </div>

      {/* Insights Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-panel p-4 bg-gradient-to-r ${getInsightColor(insight.type)} hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm leading-tight">{insight.title}</h3>
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Clock size={10} />
                        <span>{insight.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs opacity-90 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-70 capitalize">
                        {insight.source.replace('-', ' ')}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.confidence * 100}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                            className="h-full bg-white/60 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Real-time Activity Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-400/20"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                />
              ))}
            </div>
            <span className="text-indigo-200 text-xs">
              Analyzing conversation patterns...
            </span>
          </div>
        </motion.div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-white">94%</div>
            <div className="text-white/60 text-xs">Accuracy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">2.1s</div>
            <div className="text-white/60 text-xs">Avg Time</div>
          </div>
        </div>
      </div>
    </div>
  )
}