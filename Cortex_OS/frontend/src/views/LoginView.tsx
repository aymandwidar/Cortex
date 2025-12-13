import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginView() {
  const [masterKey, setMasterKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!masterKey.trim()) return

    setIsLoading(true)
    
    try {
      await login(masterKey)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card"
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="halo-orb w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <div className="nano-label">Intelligence Operating System</div>
          <h1 className="nano-title text-3xl">CORTEX OS</h1>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 text-left">
            <div className="halo-orb w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-white/80">Multi-Agent Intelligence</span>
          </div>
          <div className="text-white/60 text-sm">DeepSeek R1, Qwen 2.5, Llama 3.3</div>
          
          <div className="flex items-center gap-3 text-left mt-4">
            <div className="halo-orb w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-white/80">Glassmorphic Design</span>
          </div>
          <div className="text-white/60 text-sm">Native iOS-inspired interface</div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="nano-label text-left mb-3">Master Key</div>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type={showKey ? 'text' : 'password'}
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter your master key"
                className="nano-input w-full pl-12 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!masterKey.trim() || isLoading}
            className="nano-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accessing System...</span>
              </div>
            ) : (
              'Access System'
            )}
          </motion.button>
        </form>

        {/* Default Key Hint */}
        <div className="mt-6 p-4 nano-panel">
          <div className="text-white/60 text-sm">
            <div className="font-medium mb-1">Default master key:</div>
            <code className="text-violet-300">ad222333</code>
          </div>
        </div>
      </motion.div>
    </div>
  )
}