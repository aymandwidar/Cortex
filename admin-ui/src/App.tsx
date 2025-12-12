import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MobileLayout from './layouts/MobileLayout'
import DesktopLayout from './layouts/DesktopLayout'
import { useIsMobile } from './hooks/useIsMobile'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { AgentProvider } from './contexts/AgentContext'

function App() {
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">CORTEX OS</h1>
          <p className="text-white/70">Initializing Intelligence...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AgentProvider>
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobile ? 'mobile' : 'desktop'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <Routes>
                <Route path="/*" element={
                  isMobile ? <MobileLayout /> : <DesktopLayout />
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </AgentProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App