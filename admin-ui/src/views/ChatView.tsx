import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgent } from '../contexts/AgentContext'
import SmartInput from '../components/SmartInput'
import AgentCard from '../components/AgentCard'
import ThinkingIndicator from '../components/ThinkingIndicator'

export default function ChatView() {
  const { messages, isThinking } = useAgent()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-nav border-b border-white/10 p-4">
        <h1 className="text-xl font-semibold text-white">Intelligence Chat</h1>
        <p className="text-white/60 text-sm">Multi-agent conversation interface</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="glass-panel p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to Cortex OS</h2>
              <p className="text-white/70 mb-6">
                Your intelligent operating system powered by multiple AI agents. 
                Ask questions, solve problems, or just have a conversation.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass-panel p-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mb-2"></div>
                  <div className="text-white/90 font-medium">Logic Agent</div>
                  <div className="text-white/60">DeepSeek R1</div>
                </div>
                <div className="glass-panel p-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mb-2"></div>
                  <div className="text-white/90 font-medium">Math Agent</div>
                  <div className="text-white/60">Qwen 2.5 72B</div>
                </div>
                <div className="glass-panel p-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mb-2"></div>
                  <div className="text-white/90 font-medium">Code Agent</div>
                  <div className="text-white/60">Llama 3.3 70B</div>
                </div>
                <div className="glass-panel p-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mb-2"></div>
                  <div className="text-white/90 font-medium">Chat Agent</div>
                  <div className="text-white/60">Llama 3.1 8B</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <AgentCard key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isThinking && <ThinkingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <SmartInput />
      </div>
    </div>
  )
}