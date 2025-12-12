import { useState } from 'react'
import { Key } from 'lucide-react'
import './Login.css'

interface LoginProps {
  onLogin: (key: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [key, setKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key.trim()) {
      onLogin(key.trim())
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Key size={48} className="login-icon" />
          <h1>Cortex Admin</h1>
          <p>Enter your master key to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Master Key"
            className="login-input"
            autoFocus
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
