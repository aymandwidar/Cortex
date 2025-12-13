# Cortex OS v2.6 - Complete Monorepo

Multi-agent AI system with specialized reasoning capabilities and glassmorphic design.

## 🏗️ Architecture

### Frontend (React + Vite)
- **Location**: `frontend/`
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Design**: Nano Glass UI with glassmorphic effects
- **Features**: 
  - Multi-agent chat interface with specialized routing
  - Settings management with API key generation
  - Real-time memory stream visualization
  - Authentication system with master key
  - PWA support with offline capabilities

### Backend (Python + FastAPI)
- **Location**: `backend/`
- **Technology**: FastAPI, Python 3.8+, LiteLLM, OpenRouter
- **Features**: 
  - Agent orchestration and intelligent routing
  - LLM integration with multiple providers
  - API key management and authentication
  - OpenAI-compatible endpoints

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

### Option 2: Manual Setup
```bash
# 1. Frontend Setup
cd frontend
npm install
npm run dev

# 2. Backend Setup (in new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
python main.py
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Default Login**: Master key `ad222333`

## 🤖 Agent System

| Agent | Model | Specialization |
|-------|-------|----------------|
| **Logic Agent** | DeepSeek R1 | Complex reasoning, analysis, problem-solving |
| **Math Agent** | Qwen 2.5 72B | Mathematical computations, calculations |
| **Code Agent** | Llama 3.3 70B | Programming, development, code generation |
| **Chat Agent** | Llama 3.1 8B | General conversation, casual interactions |

## ⚙️ Configuration

### Backend Environment (.env)
```bash
# API Keys
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_key

# Authentication
MASTER_KEY=ad222333

# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

### Frontend Environment (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Project Structure

```
Cortex_OS/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Agent)
│   │   ├── layouts/         # Layout components
│   │   ├── views/           # Page components
│   │   ├── styles/          # CSS and styling
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── agents/          # Agent orchestration
│   │   └── llm/             # LLM execution
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── config.yaml          # Configuration
├── README.md                # This file
├── start-dev.bat           # Windows startup script
└── start-dev.sh            # Linux/Mac startup script
```

## 🌟 Features

- ✅ **Multi-Agent Intelligence**: Specialized AI agents for different tasks
- ✅ **Glassmorphic Design**: Beautiful iOS-inspired interface
- ✅ **Real-time Chat**: Instant responses with thinking indicators
- ✅ **Authentication**: Secure master key system
- ✅ **API Management**: Generate and manage API keys
- ✅ **Memory Stream**: Live intelligence insights
- ✅ **PWA Support**: Install as native app
- ✅ **TypeScript**: Full type safety
- ✅ **Responsive**: Works on all devices
- ✅ **Cloud Ready**: Deploy anywhere

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render/Railway)
```bash
cd backend
# Set environment variables in platform
# Deploy with Python buildpack
```

### Docker (Coming Soon)
```bash
docker-compose up -d
```

## 🔧 Development

### Adding New Agents
1. Update `backend/app/agents/orchestrator.py`
2. Add routing logic in `backend/app/llm/executor.py`
3. Update frontend agent types in `contexts/AgentContext.tsx`

### Customizing UI
1. Modify glassmorphic styles in `frontend/src/App.tsx`
2. Update Tailwind config in `frontend/tailwind.config.js`
3. Add new components in `frontend/src/components/`

## 📝 License

MIT License - see LICENSE file for details.

---

**Cortex OS v2.6** - The future of multi-agent AI interaction.