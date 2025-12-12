import { useEffect, useState } from 'react'
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getHealth, getHealthReady } from '../api'
import { HealthStatus } from '../types'
import './Dashboard.css'

export default function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [ready, setReady] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const [healthData, readyData] = await Promise.all([
          getHealth(),
          getHealthReady(),
        ])
        setHealth(healthData)
        setReady(readyData)
      } catch (error) {
        console.error('Failed to fetch health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Service Status</p>
            <p className="stat-value">{health?.status || 'Unknown'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            {ready?.status === 'healthy' ? (
              <CheckCircle size={24} className="text-green" />
            ) : (
              <XCircle size={24} className="text-red" />
            )}
          </div>
          <div className="stat-content">
            <p className="stat-label">Readiness</p>
            <p className="stat-value">{ready?.status || 'Unknown'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Last Check</p>
            <p className="stat-value">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {ready?.dependencies && (
        <div className="dependencies-card">
          <h2>Dependencies</h2>
          <div className="dependencies-list">
            {Object.entries(ready.dependencies).map(([name, status]) => (
              <div key={name} className="dependency-item">
                <span className="dependency-name">{name}</span>
                <span className={`dependency-status ${status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
