# Admin UI Features

## Pages Overview

### 🏠 Dashboard
**Purpose**: Real-time system health monitoring

**Features**:
- Service status indicator
- Readiness check with dependency status
- Last check timestamp
- Auto-refresh every 10 seconds
- Visual health indicators (green/red)

**Dependencies Monitored**:
- Database (SQLite/PostgreSQL)
- Redis (caching)
- Qdrant (vector database)

---

### 🔑 API Keys
**Purpose**: Manage access keys for applications

**Features**:
- **List View**:
  - Key name and prefix
  - User ID association
  - Created date (relative time)
  - Last used date (relative time)
  - Active/Revoked status badge
  - Revoke action button

- **Generate Modal**:
  - Custom key name input
  - Optional user ID
  - One-time key display
  - Copy to clipboard button
  - Warning about key visibility

- **Security**:
  - Keys shown only once
  - Confirmation before revocation
  - SHA-256 hashed storage
  - Constant-time validation

**User Flow**:
1. Click "Generate Key"
2. Enter name and optional user ID
3. Click "Generate"
4. Copy key immediately (won't see again!)
5. Use key in applications

---

### 🤖 Models
**Purpose**: View configured AI models

**Features**:
- Card-based layout
- Model name display
- LiteLLM provider information
- Visual model icons
- Hover effects

**Models Shown**:
- reflex-model (Groq Llama 3.3 70B)
- analyst-model (DeepSeek Coder)
- genius-model (GPT-4o)
- Any custom models from config.yaml

---

### 📊 Metrics
**Purpose**: Live Prometheus metrics visualization

**Features**:
- **Grouped Display**:
  - Metrics grouped by category
  - Request metrics
  - Fallback metrics
  - Sentiment metrics
  - PII redaction metrics
  - Cache metrics
  - Memory metrics
  - API key metrics

- **Metric Cards**:
  - Metric name (monospace)
  - Current value (large, blue)
  - Labels (if present)
  - Help text (if available)

- **Auto-refresh**: Every 5 seconds

**Metrics Categories**:
- `cortex_requests_*` - Request volume and latency
- `cortex_fallback_*` - Fallback attempts and reasons
- `cortex_sentiment_*` - Sentiment overrides
- `cortex_pii_*` - PII redactions by type
- `cortex_cache_*` - Cache hits and misses
- `cortex_memory_*` - Memory operations
- `cortex_api_key_*` - Key validations and usage

---

## UI/UX Features

### Design System
- **Color Scheme**: Dark theme (slate/blue)
- **Typography**: System fonts with monospace for code
- **Icons**: Lucide React (consistent, modern)
- **Spacing**: 8px grid system
- **Animations**: Smooth transitions (0.2s)

### Responsive Design
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation (future)

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)

### Performance
- Code splitting by route
- Lazy loading components
- Optimized re-renders
- Efficient state management
- Minimal bundle size

---

## Technical Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing

### Libraries
- **lucide-react**: Icon system
- **date-fns**: Date formatting
- **recharts**: Charts (for future use)

### Development
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Vite HMR**: Hot module replacement

---

## API Integration

### Authentication
- Master key stored in localStorage
- Bearer token on all requests
- Automatic logout on 401

### Error Handling
- User-friendly error messages
- Console logging for debugging
- Graceful degradation
- Retry logic (future)

### Data Fetching
- Async/await pattern
- Loading states
- Error states
- Auto-refresh for live data

---

## Future Enhancements

### Phase 4.1: Analytics
- Request volume charts
- Cost tracking by model
- User activity graphs
- Performance trends

### Phase 4.2: Advanced Management
- User account management
- Rate limiting configuration
- Webhook setup
- Audit log viewer

### Phase 4.3: Routing Editor
- Visual intent editor
- Model mapping configuration
- Sentiment threshold adjustment
- Test routing preview

### Phase 4.4: Real-time Features
- Live request feed
- WebSocket updates
- Real-time alerts
- Push notifications

---

## Development Workflow

### Local Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

### Code Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── api.ts          # API client
├── types.ts        # TypeScript types
└── *.css           # Component styles
```

### Adding a New Page
1. Create `src/pages/NewPage.tsx`
2. Create `src/pages/NewPage.css`
3. Add route in `src/App.tsx`
4. Add nav item in `src/components/Layout.tsx`
5. Add API functions in `src/api.ts` (if needed)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Security Considerations

### Client-Side
- Master key in localStorage (encrypted in future)
- No sensitive data in console logs
- HTTPS required in production
- CORS configuration

### Server-Side
- Master key validation
- API key authentication
- Rate limiting (future)
- Request validation

---

## Performance Metrics

### Bundle Size
- Initial: ~150KB (gzipped)
- Lazy routes: ~20KB each
- Total: ~200KB

### Load Times
- First paint: <1s
- Interactive: <2s
- Route change: <100ms

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## Deployment

### Static Hosting
- Build: `npm run build`
- Output: `dist/` folder
- Serve with any static host

### Reverse Proxy Required
- Proxy `/admin/*` to backend
- Proxy `/v1/*` to backend
- Proxy `/health` to backend
- Proxy `/metrics` to backend

### Environment Variables
- None required (uses relative URLs)
- Backend URL configured in Vite proxy

---

## Testing Strategy

### Manual Testing
- Login/logout flow
- API key CRUD operations
- Model listing
- Metrics display
- Health monitoring
- Responsive design
- Error handling

### Future Automated Testing
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Visual regression (Chromatic)

---

## Maintenance

### Dependencies
- Update monthly: `npm update`
- Security audits: `npm audit`
- Breaking changes: Check changelogs

### Monitoring
- Error tracking (Sentry - future)
- Analytics (Plausible - future)
- Performance monitoring (Web Vitals)

---

**Built with ❤️ for the Cortex AI Router**
