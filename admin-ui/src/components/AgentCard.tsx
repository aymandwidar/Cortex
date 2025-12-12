import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Brain, Calculator, Code, MessageCircle, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Message } from '../contexts/AgentContext'
import { cn } from '../utils/cn'

interface AgentCardProps {
  message: Message
}

const agentConfig = {
  logic: { 
    icon: Brain, 
    name: 'Logic Agent', 
    model: 'DeepSeek R1',
    color: 'agent-badge-logic',
    gradient: 'from-purple-500/30 to-violet-600/30 border-purple-400/50'
  },
  math: { 
    icon: Calculator, 
    name: 'Math Agent', 
    model: 'Qwen 2.5 72B',
    color: 'agent-badge-math',
    gradient: 'from-cyan-500/30 to-blue-600/30 border-cyan-400/50'
  },
  code: { 
    icon: Code, 
    name: 'Code Agent', 
    model: 'Llama 3.3 70B',
    color: 'agent-badge-code',
    gradient: 'from-emerald-500/30 to-green-600/30 border-emerald-400/50'
  },
  chat: { 
    icon: MessageCircle, 
    name: 'Chat Agent', 
    model: 'Llama 3.1 8B',
    color: 'agent-badge-chat',
    gradient: 'from-slate-500/30 to-gray-600/30 border-slate-400/50'
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
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-gradient-to-r from-indigo-500 to-purple-600" 
          : agent 
            ? `bg-gradient-to-r ${agent.gradient}` 
            : "bg-gradient-to-r from-gray-500/20 to-slate-600/20"
      )}>
        <Icon size={20} className="text-white" />
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser && "flex flex-col items-end"
      )}>
        {/* Header */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              agent?.color || "agent-badge-chat"
            )}>
              {agent?.name || 'Assistant'}
            </span>
            {agent && (
              <span className="text-white/80 text-xs font-medium">
                {agent.model}
              </span>
            )}
            <span className="text-white/60 text-xs">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "glass-card relative",
          isUser 
            ? "bg-gradient-to-r from-indigo-500/25 to-purple-600/25 border-indigo-400/40" 
            : agent 
              ? `bg-gradient-to-r ${agent.gradient}`
              : "bg-gradient-to-r from-slate-500/25 to-gray-600/25 border-slate-400/40"
        )}>
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
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto my-3">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-black/20 px-2 py-1 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
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