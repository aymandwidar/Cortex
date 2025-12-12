import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Key, Cpu, BarChart3, TrendingUp, Settings as SettingsIcon, MessageSquare, LogOut } from 'lucide-react'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
  onLogout: () => void
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/playground', icon: MessageSquare, label: 'Playground' },
    { path: '/keys', icon: Key, label: 'API Keys' },
    { path: '/models', icon: Cpu, label: 'Models' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/metrics', icon: BarChart3, label: 'Metrics' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Cortex</h1>
          <p>AI Router Admin</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
