import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Analytics.css'

interface AnalyticsProps {
  masterKey: string
}

interface UsageData {
  period: { start: string; end: string; days: number }
  summary: {
    total_requests: number
    total_tokens: number
    total_cost: number
    avg_latency_ms: number
    error_rate: number
  }
}

interface CostData {
  period: { start: string; end: string; days: number }
  total_cost: number
  by_model: Array<{
    model: string
    requests: number
    tokens: number
    cost: number
  }>
}

export default function Analytics({ masterKey }: AnalyticsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [costs, setCosts] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchAnalytics()
  }, [days, masterKey])

  const fetchAnalytics = async () => {
    try {
      const [usageRes, costsRes] = await Promise.all([
        fetch(`/admin/v1/analytics/usage?days=${days}`, {
          headers: { 'Authorization': `Bearer ${masterKey}` }
        }),
        fetch(`/admin/v1/analytics/costs?days=${days}`, {
          headers: { 'Authorization': `Bearer ${masterKey}` }
        })
      ])

      if (usageRes.ok && costsRes.ok) {
        setUsage(await usageRes.json())
        setCosts(await costsRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>
  }

  const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171']

  // Mock data for charts (replace with real data from API)
  const requestsOverTime = [
    { date: 'Mon', requests: 120 },
    { date: 'Tue', requests: 150 },
    { date: 'Wed', requests: 180 },
    { date: 'Thu', requests: 160 },
    { date: 'Fri', requests: 200 },
    { date: 'Sat', requests: 140 },
    { date: 'Sun', requests: 110 },
  ]

  const modelUsage = [
    { name: 'Reflex (Groq)', value: 45, cost: 2.50 },
    { name: 'Analyst (DeepSeek)', value: 30, cost: 5.20 },
    { name: 'Genius (GPT-4)', value: 25, cost: 42.30 },
  ]

  const latencyData = [
    { time: '00:00', p50: 120, p95: 450 },
    { time: '04:00', p50: 110, p95: 420 },
    { time: '08:00', p50: 150, p95: 520 },
    { time: '12:00', p50: 180, p95: 580 },
    { time: '16:00', p50: 160, p95: 550 },
    { time: '20:00', p50: 140, p95: 480 },
  ]

  return (
    <div className="analytics">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <div className="time-selector">
          <button 
            className={`time-btn ${days === 1 ? 'active' : ''}`}
            onClick={() => setDays(1)}
          >
            24h
          </button>
          <button 
            className={`time-btn ${days === 7 ? 'active' : ''}`}
            onClick={() => setDays(7)}
          >
            7d
          </button>
          <button 
            className={`time-btn ${days === 30 ? 'active' : ''}`}
            onClick={() => setDays(30)}
          >
            30d
          </button>
          <button 
            className={`time-btn ${days === 90 ? 'active' : ''}`}
            onClick={() => setDays(90)}
          >
            90d
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Requests</p>
            <p className="stat-value">{usage?.summary.total_requests.toLocaleString() || '0'}</p>
            <p className="stat-change positive">+12% from last period</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Latency</p>
            <p className="stat-value">{usage?.summary.avg_latency_ms.toFixed(0) || '0'}ms</p>
            <p className="stat-change negative">+5% from last period</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Cost</p>
            <p className="stat-value">${costs?.total_cost.toFixed(2) || '0.00'}</p>
            <p className="stat-change positive">-8% from last period</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Users</p>
            <p className="stat-value">24</p>
            <p className="stat-change positive">+3 new users</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Requests Over Time */}
        <div className="chart-card">
          <h3>Requests Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={requestsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Model Usage Distribution */}
        <div className="chart-card">
          <h3>Model Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modelUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modelUsage.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Trends */}
        <div className="chart-card full-width">
          <h3>Latency Trends (P50 & P95)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="p50" stroke="#34d399" strokeWidth={2} name="P50" />
              <Line type="monotone" dataKey="p95" stroke="#fbbf24" strokeWidth={2} name="P95" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Model */}
        <div className="chart-card full-width">
          <h3>Cost by Model</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: '$', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="cost" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Note */}
      {usage?.summary.total_requests === 0 && (
        <div className="info-note">
          <p>📊 Analytics data will appear here once you start making requests to Cortex.</p>
          <p>Connect Prometheus for real-time metrics and historical data.</p>
        </div>
      )}
    </div>
  )
}
