import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, ArrowRight } from 'lucide-react'
import { useAgent } from '../contexts/AgentContext'
import SmartInput from '../components/SmartInput'
import AgentCard from '../components/AgentCard'
import ThinkingIndicator from '../components/ThinkingIndicator'

export default function ChatView() {
  const { messages, isThinking } = useAgent()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const apiKey = localStorage.getItem('cortex-api-key')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  return (
    <div className="h-full flex flex-col">
      {/* Header - Nano Style */}
      <div className="pb-6 border-b border-white/5">
        <div className="nano-label">Multi-Agent Interface</div>
        <h1 className="nano-title">Intelligence Chat</h1>
      </div>

      {/* Messages - Nano Style */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {!apiKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="nano-panel p-8 max-w-lg mx-auto text-center bg-yellow-500/5 border-yellow-500/20">
              <div className="halo-orb w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key size={32} className="text-white" />
              </div>
              <div className="nano-label mb-2 text-yellow-300">Setup Required</div>
              <h2 className="nano-title mb-4">Generate API Key</h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                To start chatting with the AI agents, you need to generate an API key first.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                <span>Go to Settings</span>
                <ArrowRight size={16} />
                <span>Generate Key</span>
                <ArrowRight size={16} />
                <span>Start Chatting</span>
              </div>
            </div>
          </motion.div>
        )}

        {apiKey && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="nano-panel p-12 max-w-lg mx-auto text-center">
              <div className="halo-orb w-20 h-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🧠</span>
              </div>
              <div className="nano-label mb-2">Welcome to</div>
              <h2 className="nano-title mb-4">Cortex Intelligence</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Multi-agent AI system with specialized reasoning capabilities. 
                Each agent excels in different domains of intelligence.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="nano-panel p-4 text-left">
                  <div className="halo-orb w-4 h-4 bg-purple-400 rounded-full mb-3"></div>
                  <div className="text-white font-medium tracking-wide">LOGIC AGENT</div>
                  <div className="text-white/50 text-xs">DeepSeek R1</div>
                </div>
                <div className="nano-panel p-4 text-left">
                  <div className="halo-orb w-4 h-4 bg-cyan-400 rounded-full mb-3"></div>
                  <div className="text-white font-medium tracking-wide">MATH AGENT</div>
                  <div className="text-white/50 text-xs">Qwen 2.5 72B</div>
                </div>
                <div className="nano-panel p-4 text-left">
                  <div className="halo-orb w-4 h-4 bg-emerald-400 rounded-full mb-3"></div>
                  <div className="text-white font-medium tracking-wide">CODE AGENT</div>
                  <div className="text-white/50 text-xs">Llama 3.3 70B</div>
                </div>
                <div className="nano-panel p-4 text-left">
                  <div className="halo-orb w-4 h-4 bg-slate-400 rounded-full mb-3"></div>
                  <div className="text-white font-medium tracking-wide">CHAT AGENT</div>
                  <div className="text-white/50 text-xs">Llama 3.1 8B</div>
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

      {/* Input - Nano Style */}
      <div className="pt-6 border-t border-white/5">
        <SmartInput />
      </div>
    </div>
  )
}