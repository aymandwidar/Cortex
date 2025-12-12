import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Camera, ChevronDown, Thermometer } from 'lucide-react'
import { useAgent, type AgentType } from '../contexts/AgentContext'

const agentOptions = [
  { id: 'auto' as const, label: 'Auto Select', color: 'bg-gradient-to-r from-purple-500 to-cyan-500' },
  { id: 'logic' as const, label: 'Logic Agent', color: 'bg-purple-500' },
  { id: 'math' as const, label: 'Math Agent', color: 'bg-cyan-500' },
  { id: 'code' as const, label: 'Code Agent', color: 'bg-emerald-500' },
  { id: 'chat' as const, label: 'Chat Agent', color: 'bg-slate-500' },
]

export default function SmartInput() {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('auto')
  const [temperature, setTemperature] = useState(0.7)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { sendMessage, isThinking } = useAgent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isThinking) return

    const content = input.trim()
    setInput('')
    
    await sendMessage(content, selectedAgent === 'auto' ? undefined : selectedAgent, undefined, temperature)
  }

  const selectedAgentOption = agentOptions.find(opt => opt.id === selectedAgent)

  return (
    <div className="space-y-3">
      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="nano-panel p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Chat Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>
          
          {/* Temperature Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/80 text-sm">Temperature</label>
              <span className="text-white/60 text-sm">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="nano-panel p-3 flex items-center gap-3">
          {/* Agent Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white transition-all ${selectedAgentOption?.color} hover:opacity-80`}
            >
              <span>{selectedAgentOption?.label}</span>
              <ChevronDown size={16} className={showAgentSelector ? "rotate-180" : ""} />
            </button>

            {showAgentSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute bottom-full mb-2 left-0 nano-panel p-2 min-w-48 z-10"
              >
                {agentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgent(option.id)
                      setShowAgentSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-white hover:bg-white/10 ${
                      selectedAgent === option.id ? "bg-white/20" : ""
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${option.color}`} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`nano-button p-2 transition-all ${showSettings ? "text-white bg-white/10" : "text-white/70 hover:text-white"}`}
            title="Chat settings"
          >
            <Thermometer size={20} />
          </button>

          {/* Camera Button */}
          <button
            type="button"
            className="nano-button p-2 text-white/70 hover:text-white"
            title="Upload image"
          >
            <Camera size={20} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 nano-input border-0 bg-transparent text-white placeholder-white/40 outline-none px-4 py-3 font-medium tracking-wide"
            disabled={isThinking}
          />

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={!input.trim() || isThinking}
            className={`nano-button p-3 transition-all ${
              !input.trim() || isThinking
                ? "opacity-50 cursor-not-allowed"
                : "text-white hover:bg-white/15"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isThinking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}