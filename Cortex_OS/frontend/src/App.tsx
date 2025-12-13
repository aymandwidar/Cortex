import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { AgentProvider } from './contexts/AgentContext'
import DesktopLayout from './layouts/DesktopLayout'

// --- Nano Glass CSS (Enhanced for full system) ---
const glassStyles = `
/* Base Nano Glass Styles */
.nano-bg { 
  background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 40%, #000000 100%); 
}

.nano-panel { 
  background: rgba(255, 255, 255, 0.03); 
  backdrop-filter: blur(24px); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  box-shadow: 0 0 40px -10px rgba(255, 255, 255, 0.05); 
  border-radius: 32px; 
}

.nano-modal { 
  background: rgba(15, 23, 42, 0.9); 
  backdrop-filter: blur(30px); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 24px; 
}

.nano-input { 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: white; 
  border-radius: 16px; 
  padding: 12px 16px; 
  outline: none; 
  transition: all 0.3s ease; 
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
  padding: 8px 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nano-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.nano-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.nano-title {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 0.1em;
  color: white;
  margin: 0;
}

.halo-orb {
  box-shadow: 0 0 20px currentColor;
}

/* Island Layout */
.island-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  max-height: 900px;
  z-index: 10;
}

.island-chat {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 0 60px -10px rgba(255, 255, 255, 0.1);
}

/* Message Styles */
.msg-user { 
  background: rgba(79, 70, 229, 0.8); 
  color: white; 
  border-radius: 20px 20px 4px 20px; 
  padding: 16px 20px;
  max-width: 85%;
  margin-left: auto;
}

.msg-ai { 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: #e2e8f0; 
  border-radius: 20px 20px 20px 4px; 
  padding: 16px 20px;
  max-width: 85%;
}

/* Scrollbar Styles */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Slider Styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

/* Animation Classes */
.animate-in {
  animation: fadeInZoom 0.3s ease-out;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.zoom-in {
  animation: zoomIn 0.3s ease-out;
}

@keyframes fadeInZoom {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

/* Background Effects */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#root {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 40%, #000000 100%);
  position: relative;
}

/* Login Styles */
.login-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.login-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  padding: 48px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 60px -10px rgba(255, 255, 255, 0.1);
}

/* Badge Styles */
.nano-badge-logic {
  background: rgba(139, 92, 246, 0.2);
  color: rgb(196, 181, 253);
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nano-badge-math {
  background: rgba(34, 211, 238, 0.2);
  color: rgb(165, 243, 252);
  border: 1px solid rgba(34, 211, 238, 0.3);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nano-badge-code {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(187, 247, 208);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nano-badge-chat {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(203, 213, 225);
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Background Aura */
#root::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 1;
}
`;

export default function App() {
  return (
    <AuthProvider>
      <AgentProvider>
        <div className="w-full h-screen nano-bg text-white font-sans">
          <style>{glassStyles}</style>
          <DesktopLayout />
        </div>
      </AgentProvider>
    </AuthProvider>
  )
}