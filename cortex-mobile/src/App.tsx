import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ApiKeys from './pages/ApiKeys'
import Models from './pages/Models'
import Metrics from './pages/Metrics'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Playground from './pages/Playground'
import Login from './pages/Login'

function App() {
  const [masterKey, setMasterKey] = useState<string | null>(
    localStorage.getItem('cortex_master_key')
  )

  const handleLogin = (key: string) => {
    localStorage.setItem('cortex_master_key', key)
    setMasterKey(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('cortex_master_key')
    setMasterKey(null)
  }

  if (!masterKey) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/keys" element={<ApiKeys masterKey={masterKey} />} />
          <Route path="/models" element={<Models masterKey={masterKey} />} />
          <Route path="/analytics" element={<Analytics masterKey={masterKey} />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/settings" element={<Settings masterKey={masterKey} />} />
          <Route path="/playground" element={<Playground masterKey={masterKey} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
