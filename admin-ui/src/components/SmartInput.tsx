import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Camera, Mic, ChevronDown } from 'lucide-react'
import { useAgent, type AgentType } from '../contexts/AgentContext'
import { cn } from '../utils/cn'

const agentOptions = [
  { id: 'auto' as const, label: 'Auto Select', color: 'bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg' },
  { id: 'logic' as const, label: 'Logic Agent', color: 'bg-purple-500 shadow-lg shadow-purple-500/25' },
  { id: 'math' as const, label: 'Math Agent', color: 'bg-cyan-500 shadow-lg shadow-cyan-500/25' },
  { id: 'code' as const, label: 'Code Agent', color: 'bg-emerald-500 shadow-lg shadow-emerald-500/25' },
  { id: 'chat' as const, label: 'Chat Agent', color: 'bg-slate-500 shadow-lg shadow-slate-500/25' },
]

export default function SmartInput() {
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('auto')
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sendMessage, isThinking } = useAgent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedImage) return
    if (isThinking) return

    const content = input.trim()
    const image = selectedImage
    
    setInput('')
    setSelectedImage(null)
    
    await sendMessage(content, selectedAgent === 'auto' ? undefined : selectedAgent, image || undefined)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const selectedAgentOption = agentOptions.find(opt => opt.id === selectedAgent)

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glass-panel p-3"
          >
            <div className="relative inline-block">
              <img 
                src={selectedImage} 
                alt="Upload preview" 
                className="max-w-32 max-h-32 rounded-lg object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel p-2 flex items-center gap-2">
          {/* Agent Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white transition-all",
                selectedAgentOption?.color,
                "hover:opacity-80"
              )}
            >
              <span>{selectedAgentOption?.label}</span>
              <ChevronDown size={16} className={cn(
                "transition-transform",
                showAgentSelector && "rotate-180"
              )} />
            </button>

            <AnimatePresence>
              {showAgentSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-0 glass-panel p-2 min-w-48 z-10"
                >
                  {agentOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedAgent(option.id)
                        setShowAgentSelector(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-white hover:bg-white/10",
                        selectedAgent === option.id && "bg-white/20"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", option.color)} />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Camera Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass-button p-2 text-white/70 hover:text-white touch-target"
            title="Upload image"
          >
            <Camera size={20} />
          </button>

          {/* Mic Button */}
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "glass-button p-2 touch-target transition-all",
              isRecording 
                ? "text-red-400 bg-red-500/20" 
                : "text-white/70 hover:text-white"
            )}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic size={20} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-white placeholder-white/70 outline-none px-2 py-2 font-medium"
            disabled={isThinking}
          />

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isThinking}
            className={cn(
              "glass-button p-2 touch-target transition-all",
              (!input.trim() && !selectedImage) || isThinking
                ? "opacity-50 cursor-not-allowed"
                : "text-white hover:bg-white/30"
            )}
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

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          "Solve this math problem step by step",
          "Write a Python function for",
          "Explain the concept of",
          "Design a system for"
        ].map((prompt, index) => (
          <button
            key={index}
            onClick={() => setInput(prompt)}
            className="glass-button px-3 py-1 text-sm text-white/80 hover:text-white whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}