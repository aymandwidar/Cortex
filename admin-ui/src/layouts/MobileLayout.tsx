import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Brain, Settings } from 'lucide-react'
import ChatView from '../views/ChatView'
import MemoryView from '../views/MemoryView'
import SettingsView from '../views/SettingsView'
import LoginView from '../views/LoginView'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../utils/cn'

type MobileTab = 'chat' | 'memory' | 'settings'

export default function MobileLayout() {
  const [activeTab, setActiveTab] = useState<MobileTab>('chat')
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginView />
  }

  const tabs = [
    { id: 'chat' as const, icon: MessageCircle, label: 'Chat' },
    { id: 'memory' as const, icon: Brain, label: 'Memory' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'memory' && <MemoryView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Glass Tab Bar */}
      <div className="glass-nav border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 touch-target",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/60 hover:text-white/80 hover:bg-white/10"
                )}
              >
                <Icon size={24} strokeWidth={1.5} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}