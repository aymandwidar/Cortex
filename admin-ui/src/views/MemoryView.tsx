import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, Clock } from 'lucide-react'

export default function MemoryView() {
  // Mock memory data - in real app this would come from API
  const memoryInsights = [
    {
      id: 1,
      type: 'correlation',
      title: 'Pattern Detected',
      description: 'Math problems → DeepSeek routing accuracy: 94%',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      source: 'cortex-os',
      confidence: 0.94
    },
    {
      id: 2,
      type: 'optimization',
      title: 'Performance Insight',
      description: 'Code generation tasks complete 40% faster with Llama 3.3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      source: 'cortex-os',
      confidence: 0.87
    },
    {
      id: 3,
      type: 'learning',
      title: 'User Preference',
      description: 'Prefers detailed step-by-step explanations for math',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      source: 'cortex-os',
      confidence: 0.92
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation': return Zap
      case 'optimization': return TrendingUp
      case 'learning': return Brain
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'correlation': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
      case 'optimization': return 'from-green-500/20 to-emerald-500/20 border-green-400/30'
      case 'learning': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
      default: return 'from-purple-500/20 to-violet-500/20 border-purple-400/30'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-white/10 p-4">
        <h1 className="text-xl font-semibold text-white">Memory DNA</h1>
        <p className="text-white/60 text-sm">Intelligence insights and learning patterns</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">127</div>
                <div className="text-white/60 text-sm">Insights Generated</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">94%</div>
                <div className="text-white/60 text-sm">Routing Accuracy</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2.3s</div>
                <div className="text-white/60 text-sm">Avg Response Time</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Memory Insights */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Insights</h2>
          
          {memoryInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card bg-gradient-to-r ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <Clock size={12} />
                        <span>{insight.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">
                        Source: {insight.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60">Confidence:</span>
                        <div className="w-16 h-2 bg-black/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.confidence * 100}%` }}
                            transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                          />
                        </div>
                        <span className="text-xs text-white/80 font-medium">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {memoryInsights.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="glass-panel p-8 max-w-md mx-auto">
              <Brain size={48} className="text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Insights Yet</h3>
              <p className="text-white/60">
                Start chatting with the AI agents to generate memory insights and learning patterns.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}