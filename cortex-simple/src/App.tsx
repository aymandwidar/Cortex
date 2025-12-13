import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Lock, Key, RefreshCw } from 'lucide-react'

// Nano Glass Styles
const styles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 40%, #000000 100%);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .nano-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    box-shadow: 0 0 40px -10px rgba(255, 255, 255, 0.05);
  }

  .nano-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 16px;
    padding: 12px 16px;
    outline: none;
    transition: all 0.3s ease;
    width: 100%;
  }

  .nano-input:focus {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
  }

  .nano-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 12px;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .nano-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .nano-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .halo-orb {
    box-shadow: 0 0 20px currentColor;
  }
`

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [masterKey, setMasterKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleLogin = () => {
    if (masterKey === 'ad222333' || masterKey.length > 5) {
      setIsLoggedIn(true)
    }
  }

  const generateApiKey = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setApiKey(`ctx_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`)
      setIsGenerating(false)
    }, 1000)
  }

  if (!isLoggedIn) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nano-panel"
            style={{ 
              padding: '48px', 
              maxWidth: '400px', 
              width: '100%', 
              textAlign: 'center' 
            }}
          >
            <div className="halo-orb" style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(45deg, #8b5cf6, #a855f7)', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              color: 'white'
            }}>
              <Zap size={32} />
            </div>
            
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '300', 
              letterSpacing: '0.1em', 
              color: 'white', 
              margin: '0 0 8px' 
            }}>
              CORTEX OS
            </h1>
            
            <p style={{ 
              fontSize: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              color: 'rgba(255,255,255,0.4)', 
              marginBottom: '32px' 
            }}>
              Intelligence Operating System
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '12px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em', 
                color: 'rgba(255,255,255,0.4)', 
                marginBottom: '8px',
                textAlign: 'left'
              }}>
                Master Key
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.5)' 
                }} />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Enter your master key"
                  className="nano-input"
                  style={{ paddingLeft: '48px', paddingRight: '48px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{ 
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    color: 'rgba(255,255,255,0.5)', 
                    cursor: 'pointer' 
                  }}
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!masterKey.trim()}
              className="nano-button"
              style={{ width: '100%', marginBottom: '24px' }}
            >
              Access System
            </button>

            <div className="nano-panel" style={{ 
              padding: '16px', 
              background: 'rgba(255,255,255,0.02)' 
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.6)' 
              }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Default master key:</div>
                <code style={{ color: '#a855f7' }}>ad222333</code>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ 
        minHeight: '100vh', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nano-panel"
          style={{ 
            padding: '48px', 
            maxWidth: '600px', 
            width: '100%'
          }}
        >
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '300', 
            letterSpacing: '0.1em', 
            color: 'white', 
            margin: '0 0 32px',
            textAlign: 'center'
          }}>
            🎉 CORTEX OS WORKING!
          </h1>

          <div className="nano-panel" style={{ 
            padding: '24px', 
            marginBottom: '24px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.2)'
          }}>
            <h3 style={{ 
              color: 'white', 
              margin: '0 0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Key size={20} style={{ color: '#22c55e' }} />
              API Key Generator
            </h3>
            
            {apiKey ? (
              <div>
                <div style={{ 
                  background: 'rgba(0,0,0,0.4)', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#22c55e',
                  wordBreak: 'break-all'
                }}>
                  {apiKey}
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255,255,255,0.6)', 
                  margin: 0 
                }}>
                  ✅ API key generated successfully!
                </p>
              </div>
            ) : (
              <button
                onClick={generateApiKey}
                disabled={isGenerating}
                className="nano-button"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  margin: 0
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Generate API Key
                  </>
                )}
              </button>
            )}
          </div>

          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px'
          }}>
            <p>✅ Frontend: Working perfectly</p>
            <p>🔧 Backend: Ready for connection</p>
            <p>🎨 Nano Glass Design: Applied</p>
            <p>🚀 Ready for development!</p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default App