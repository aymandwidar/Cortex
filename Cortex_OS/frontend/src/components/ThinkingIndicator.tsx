import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Calculator, Code, MessageCircle } from 'lucide-react'
import { useAgent } from '../contexts/AgentContext'

const agentConfig = {
  logic: { 
    icon: Brain, 
    name: 'DeepSeek R1', 
    color: 'text-purple-300',
    description: 'Deep reasoning in progress...'
  },
  math: { 
    icon: Calculator, 
    name: 'Qwen 2.5 72B', 
    color: 'text-cyan-300',
    description: 'Calculating step by step...'
  },
  code: { 
    icon: Code, 
    name: 'Llama 3.3 70B', 
    color: 'text-emerald-300',
    description: 'Generating code solution...'
  },
  chat: { 
    icon: MessageCircle, 
    name: 'Llama 3.1 8B', 
    color: 'text-slate-300',
    description: 'Thinking...'
  },
  auto: { 
    icon: Brain, 
    name: 'Auto-routing', 
    color: 'text-indigo-300',
    description: 'Selecting best agent...'
  }
}

export default function ThinkingIndicator() {
  const { currentAgent, thinkingStartTime } = useAgent()
  const [elapsedTime, setElapsedTime] = useState(0)

  const agent = currentAgent ? agentConfig[currentAgent] : agentConfig.auto
  const Icon = agent.icon

  useEffect(() => {
    if (!thinkingStartTime) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - thinkingStartTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [thinkingStartTime])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Icon size={20} className={agent.color} />
        </motion.div>
      </div>

      {/* Thinking Content */}
      <div className="flex-1">
        <div className="nano-panel p-6 bg-gradient-to-r from-purple-400/8 to-cyan-400/8 border-purple-400/15">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="nano-badge-logic">
                {agent.name}
              </span>
              <span className="text-white/60 text-xs font-medium tracking-wide">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Thinking Animation */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 bg-white/80 rounded-full shadow-sm"
                />
              ))}
            </div>

            <span className="text-white font-medium text-sm">
              {agent.description}
            </span>
          </div>

          {/* Waveform Visualization */}
          <div className="mt-4 flex items-center gap-1 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, Math.random() * 24 + 4, 4],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className="w-1 bg-gradient-to-t from-purple-500/40 to-blue-500/40 rounded-full"
              />
            ))}
          </div>

          {/* Performance Hint */}
          {currentAgent === 'logic' && elapsedTime > 10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-white/50 italic"
            >
              DeepSeek R1 is performing deep reasoning - this may take longer for complex problems
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}