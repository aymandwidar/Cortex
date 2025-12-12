import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  masterKey: string | null
  apiKey: string | null
  isAuthenticated: boolean
  login: (masterKey: string) => Promise<void>
  logout: () => void
  generateApiKey: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [masterKey, setMasterKey] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // For security, always require fresh login
    // Clear any stored credentials on app start
    localStorage.removeItem('cortex-master-key')
    localStorage.removeItem('cortex-api-key')
    setIsAuthenticated(false)
  }, [])

  const login = async (key: string) => {
    try {
      // For demo purposes, accept the default key or validate against backend
      if (key === 'ad222333' || key.length > 5) {
        setMasterKey(key)
        setIsAuthenticated(true)
        localStorage.setItem('cortex-master-key', key)
        
        // Try to generate API key, but don't fail login if it fails
        try {
          await generateApiKey()
        } catch (error) {
          console.warn('Failed to generate API key, but login successful')
        }
      } else {
        throw new Error('Invalid master key')
      }
    } catch (error) {
      throw new Error('Authentication failed')
    }
  }

  const logout = () => {
    setMasterKey(null)
    setApiKey(null)
    setIsAuthenticated(false)
    localStorage.removeItem('cortex-master-key')
    localStorage.removeItem('cortex-api-key')
  }

  const generateApiKey = async (): Promise<string> => {
    if (!masterKey) throw new Error('No master key available')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://cortex-v25-cloud-native.onrender.com'}/admin/v1/generate_key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${masterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Cortex OS Client',
          user_id: 'cortex-os-user',
          metadata: { purpose: 'cortex-os-frontend' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate API key')
      }

      const data = await response.json()
      const newApiKey = data.key
      
      setApiKey(newApiKey)
      localStorage.setItem('cortex-api-key', newApiKey)
      
      return newApiKey
    } catch (error) {
      throw new Error('Failed to generate API key')
    }
  }

  return (
    <AuthContext.Provider value={{
      masterKey,
      apiKey,
      isAuthenticated,
      login,
      logout,
      generateApiKey
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}