import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './TestApp'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TestApp />
    </ErrorBoundary>
  </React.StrictMode>,
)