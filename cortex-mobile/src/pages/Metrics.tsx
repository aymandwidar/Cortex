import { useEffect, useState } from 'react'
import { getMetrics } from '../api'
import './Metrics.css'

interface ParsedMetric {
  name: string
  value: string
  labels?: Record<string, string>
  help?: string
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<ParsedMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics()
        const parsed = parsePrometheusMetrics(data)
        setMetrics(parsed)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const parsePrometheusMetrics = (text: string): ParsedMetric[] => {
    const lines = text.split('\n')
    const metrics: ParsedMetric[] = []
    let currentHelp = ''

    for (const line of lines) {
      if (line.startsWith('# HELP')) {
        currentHelp = line.replace('# HELP ', '').split(' ').slice(1).join(' ')
      } else if (!line.startsWith('#') && line.trim()) {
        const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*?)(?:\{([^}]+)\})?\s+(.+)$/)
        if (match) {
          const [, name, labelsStr, value] = match
          const labels: Record<string, string> = {}
          
          if (labelsStr) {
            const labelPairs = labelsStr.match(/(\w+)="([^"]*)"/g)
            if (labelPairs) {
              labelPairs.forEach(pair => {
                const [key, val] = pair.split('=')
                labels[key] = val.replace(/"/g, '')
              })
            }
          }

          metrics.push({ name, value, labels, help: currentHelp })
          currentHelp = ''
        }
      }
    }

    return metrics
  }

  const groupedMetrics = metrics.reduce((acc, metric) => {
    const category = metric.name.split('_')[1] || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(metric)
    return acc
  }, {} as Record<string, ParsedMetric[]>)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="metrics">
      <h1 className="page-title">Prometheus Metrics</h1>

      {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
        <div key={category} className="metrics-section">
          <h2 className="metrics-category">{category}</h2>
          <div className="metrics-grid">
            {categoryMetrics.map((metric, idx) => (
              <div key={`${metric.name}-${idx}`} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-value">{metric.value}</span>
                </div>
                {metric.labels && Object.keys(metric.labels).length > 0 && (
                  <div className="metric-labels">
                    {Object.entries(metric.labels).map(([key, value]) => (
                      <span key={key} className="metric-label">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
                {metric.help && <p className="metric-help">{metric.help}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
