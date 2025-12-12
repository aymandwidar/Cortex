import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Brain, Calculator, Code, MessageCircle, User } from 'lucide-react'
import { Message } from '../contexts/AgentContext'

interface AgentCardProps {
  message: Message
}

const agentConfig = {
  logic: { 
    icon: Brain, 
    name: 'Logic Agent', 
    model: 'DeepSeek R1',
    gradient: 'from-purple-500/8 to-violet-600/8 border-purple-400/15'
  },
  math: { 
    icon: Calculator, 
    name: 'Math Agent', 
    model: 'Qwen 2.5 72B',
    gradient: 'from-cyan-500/8 to-blue-600/8 border-cyan-400/15'
  },
  code: { 
    icon: Code, 
    name: 'Code Agent', 
    model: 'Llama 3.3 70B',
    gradient: 'from-emerald-500/8 to-green-600/8 border-emerald-400/15'
  },
  chat: { 
    icon: MessageCircle, 
    name: 'Chat Agent', 
    model: 'Llama 3.1 8B',
    gradient: 'from-slate-500/8 to-gray-600/8 border-slate-400/15'
  },
}

export default function AgentCard({ message }: AgentCardProps) {
  const [showThinking, setShowThinking] = useState(false)
  
  const isUser = message.role === 'user'
  const agent = message.agent && message.agent in agentConfig ? agentConfig[message.agent as keyof typeof agentConfig] : null
  const Icon = agent?.icon || (isUser ? User : MessageCircle)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? "bg-gradient-to-r from-indigo-500 to-purple-600" 
          : agent 
            ? `bg-gradient-to-r ${agent.gradient}` 
            : "bg-gradient-to-r from-gray-500/20 to-slate-600/20"
      }`}>
        <Icon size={20} className="text-white" />
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {/* Header */}
        {!isUser && (
          <div className="flex items-center gap-3 mb-3">
            <span className={`nano-badge-${message.agent || 'chat'}`}>
              {agent?.name || 'Assistant'}
            </span>
            {agent && (
              <span className="text-white/60 text-xs font-medium tracking-wide">
                {agent.model}
              </span>
            )}
            <span className="text-white/40 text-xs tracking-wide">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`nano-panel p-6 relative ${
          isUser 
            ? "bg-gradient-to-r from-indigo-400/10 to-purple-500/10 border-indigo-400/20" 
            : agent 
              ? `bg-gradient-to-r ${agent.gradient}`
              : "bg-gradient-to-r from-slate-400/8 to-gray-500/8 border-slate-400/15"
        }`}>
          {/* Image */}
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="Uploaded content" 
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="markdown-content">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>

          {/* Thinking Process Toggle */}
          {message.thinking && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                <Brain size={16} />
                <span>View Thought Process</span>
                {showThinking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {showThinking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-black/20 rounded-lg border border-white/10"
                  >
                    <div className="text-white/60 text-sm font-mono whitespace-pre-wrap">
                      {message.thinking}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* User timestamp */}
        {isUser && (
          <div className="text-white/40 text-xs mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </motion.div>
  )
}