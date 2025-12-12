import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginView() {
  const [masterKey, setMasterKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!masterKey.trim()) return

    setIsLoading(true)
    setError('')

    try {
      await login(masterKey.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-2">CORTEX OS</h1>
          <p className="text-white/70">Intelligence Operating System</p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleLogin}
          className="glass-panel p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Master Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type={showKey ? 'text' : 'password'}
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Enter your master key"
                className="glass-input w-full pl-10 pr-12 text-white placeholder-white/50"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!masterKey.trim() || isLoading}
            className="w-full glass-button py-3 px-6 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : (
              'Access System'
            )}
          </button>

          <div className="text-center text-white/60 text-sm">
            <p>Default master key: <code className="bg-black/20 px-2 py-1 rounded">ad222333</code></p>
          </div>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 gap-4 text-center"
        >
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-2">🧠 Multi-Agent Intelligence</h3>
            <p className="text-white/70 text-sm">DeepSeek R1, Qwen 2.5, Llama 3.3</p>
          </div>
          
          <div className="glass-panel p-4">
            <h3 className="text-white font-medium mb-2">🎨 Glassmorphic Design</h3>
            <p className="text-white/70 text-sm">Native iOS-inspired interface</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}