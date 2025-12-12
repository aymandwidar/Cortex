# Cortex Admin UI

Modern web dashboard for managing the Cortex AI Router.

## Features

- **Dashboard**: Real-time health monitoring and system status
- **API Keys**: Generate, view, and revoke API keys
- **Models**: View available AI models and their configurations
- **Metrics**: Live Prometheus metrics visualization

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Recharts (for future charts)
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Cortex backend running on `http://localhost:8080`

### Installation

```bash
cd admin-ui
npm install
```

### Development

```bash
npm run dev
```

The UI will be available at `http://localhost:3000` with API proxy to the backend.

### Build

```bash
npm run build
```

The production build will be in the `dist` folder.

## Usage

1. Start the Cortex backend server
2. Start the admin UI: `npm run dev`
3. Open `http://localhost:3000`
4. Login with your master key
5. Manage API keys, view models, and monitor metrics

## Environment

The UI proxies API requests to `http://localhost:8080` in development. For production, configure your web server to proxy `/admin`, `/v1`, `/health`, and `/metrics` to the backend.

## Security

- Master key is stored in localStorage
- All admin API calls require authentication
- No sensitive data is logged to console in production
