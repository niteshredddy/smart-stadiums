# 🏟️ StadiumAI Hub — FIFA World Cup 2026

A modern, real-time stadium operations and fan experience platform powered by GenAI. Features advanced animations, 3D visualization, WebSocket real-time updates, and a robust Node.js/Express backend.

## ✨ Features

### Frontend

- **Modern Animations**: GSAP-powered animations with smooth transitions and micro-interactions
- **Particle Effects**: Dynamic background particle system for immersive experience
- **3D Stadium Visualization**: Interactive Three.js 3D stadium model with drag controls
- **Glass Morphism UI**: Modern glass-effect design with neon accents
- **Responsive Design**: Fully responsive across all devices
- **Real-time Updates**: WebSocket integration for live data synchronization
- **Accessible UI**: WCAG AA-compliant contrast, ARIA attributes, keyboard navigation, semantic HTML

### Backend

- **Node.js/Express Server**: RESTful API with comprehensive endpoints
- **SQLite Database**: Efficient data storage with `sqlite3` (callback-based driver)
- **WebSocket Support**: Socket.IO for real-time bidirectional communication
- **Security Hardened**: Helmet headers, rate limiting, CORS lockdown, server-side API key management
- **Environment Configuration**: dotenv for flexible configuration

### Data & Features

- **Crowd Intelligence**: Real-time crowd density monitoring and heatmap
- **Gate Management**: Live gate status and throughput tracking
- **Parking Status**: Real-time parking availability
- **Live Matches**: Match scores, timing, and status updates
- **Operations Center**: Incident tracking and staff deployment
- **Sustainability Metrics**: Environmental impact monitoring
- **AI Assistant**: Multilingual translation and Q&A via Gemini API (server-side proxy)
- **Navigation**: Interactive stadium map and route planning

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

## 🚀 Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd "c:/Users/nites/OneDrive/Desktop/promptwars 3"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**
   Copy `.env.example` to `.env` and configure:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000
   ```

   > **Note**: The `GEMINI_API_KEY` is optional. Without it, the AI assistant runs in demo mode with pre-built fallback responses.

## 🎯 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with auto-reload using nodemon.

### Production Mode

```bash
npm start
```

### Running Tests

```bash
npm test
```

Runs the full Jest test suite (database unit tests, API integration tests, WebSocket tests).

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 📁 Project Structure

```
promptwars 3/
├── server/
│   ├── index.js          # Main Express server with API routes, security middleware, AI proxy
│   └── database.js       # SQLite database management (Promise-based)
├── public/
│   ├── index.html        # Main HTML file (semantic, accessible)
│   ├── styles.css        # Styling with WCAG AA-compliant contrast
│   ├── app.js            # Core application logic
│   ├── dashboard-data.js # Dashboard data rendering
│   ├── crowd-data.js     # Crowd intelligence logic
│   ├── stadium-map.js    # Stadium map visualization
│   ├── ai-assistant.js   # AI chat via backend proxy
│   ├── animations.js     # GSAP animations & effects
│   ├── stadium-3d.js     # Three.js 3D stadium
│   └── websocket-client.js # WebSocket/polling client
├── __tests__/
│   ├── database.test.js  # Database unit tests
│   ├── api.test.js       # API integration tests
│   └── websocket.test.js # WebSocket event tests
├── data/
│   └── stadium.db        # SQLite database (auto-created)
├── .env.example          # Environment variable template
├── jest.config.js        # Jest test configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🔌 API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Crowd Data

- `GET /api/crowd/density` - Get crowd density by zone
- `GET /api/crowd/stats` - Get crowd statistics

### Gate Data

- `GET /api/gates/status` - Get all gate statuses

### Parking Data

- `GET /api/parking/status` - Get parking lot availability

### Match Data

- `GET /api/matches/live` - Get live match data

### Operations

- `GET /api/operations/incidents` - Get active incidents
- `GET /api/operations/staff` - Get staff deployment status (cached 30s)

### Sustainability

- `GET /api/sustainability/metrics` - Get sustainability metrics (cached 60s)

### AI Assistant

- `POST /api/ai/chat` - Send a message to the AI assistant (rate limited: 20 req/15 min)
  - Body: `{ "message": "string", "language": "en", "conversationHistory": [...] }`
  - Returns: `{ "reply": "string" }` or `{ "fallback": true, "message": "string" }`

## 📡 WebSocket Events

### Client → Server

- `role:switch` - Switch user role (fan/operator/admin)

### Server → Client

- `crowd:update` - Real-time crowd density updates
- `gates:update` - Real-time gate status updates
- `matches:update` - Real-time match updates
- `role:confirmed` - Role switch confirmation

## 🎯 PromptWars Challenge Feature Mapping

| Required Feature                 | Implementation                                                                                                | Files                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **GenAI-Powered Fan Experience** | AI chatbot with Gemini API via server proxy, contextual fallback responses, multi-turn conversation           | `public/ai-assistant.js`, `server/index.js` (`POST /api/ai/chat`)                                             |
| **Real-Time Crowd Management**   | Live heatmap with 48-zone density monitoring, crowd statistics, congestion alerts                             | `public/crowd-data.js`, `GET /api/crowd/density`, `GET /api/crowd/stats`                                      |
| **Multilingual Support**         | AI-powered translation for 10+ languages, offline phrase database, language-aware chat                        | `public/ai-assistant.js` (translate), `public/dashboard-data.js` (phrase cards), Translator UI section        |
| **Accessibility**                | Wheelchair-accessible route info in AI, ARIA attributes, keyboard navigation, WCAG AA contrast, semantic HTML | `public/index.html`, `public/app.js`, `public/styles.css`, `public/ai-assistant.js` (accessibility fallbacks) |
| **Sustainability Tracking**      | Recycling, water, solar, carbon metrics with live dashboard and AI recommendations                            | `GET /api/sustainability/metrics`, Sustainability section in HTML                                             |
| **Real-Time Operations**         | WebSocket live updates, incident management, staff deployment, operational AI insights                        | `server/index.js` (Socket.IO), `public/websocket-client.js`, Operations section                               |
| **Smart Navigation**             | Interactive SVG stadium map, zone details, POI listings, 3D Three.js visualization                            | `public/stadium-map.js`, `public/stadium-3d.js`, Navigation section                                           |
| **Transportation Intelligence**  | Parking availability, metro/shuttle info, AI departure planning                                               | `GET /api/parking/status`, Transport section, AI transport fallbacks                                          |
| **Multi-Role Support**           | Fan/Staff/Organizer role switching with role-specific UI visibility                                           | `public/app.js` (switchRole), `data-role-visible` attributes in HTML                                          |
| **Live Match Data**              | Real-time scores, ticker, match updates via API and WebSocket                                                 | `GET /api/matches/live`, `matches:update` WebSocket event, match ticker in header                             |

## 🎨 Animation Features

### GSAP Animations

- Staggered entrance animations
- Section transition effects
- Counter animations for statistics
- Progress bar animations
- Modal and panel transitions

### Particle System

- Floating background particles
- Interactive hover effects
- Color variations matching theme

### 3D Stadium

- Interactive Three.js model
- Mouse drag rotation
- Scroll zoom
- Atmospheric lighting effects
- Corner tower lights

### Micro-interactions

- Magnetic button effects
- Ripple effects on clicks
- Card hover animations
- Smooth scroll behavior
- Custom scrollbar styling

## 🔒 Security Notes

- **Server-Side API Key**: The Gemini API key is stored in `.env` on the server and never sent to the browser. All AI requests go through the `/api/ai/chat` proxy endpoint.
- **Helmet**: Secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.) are applied via the `helmet` middleware.
- **Rate Limiting**: All API routes are limited to 100 requests per 15 minutes per IP. The AI chat endpoint has a tighter limit of 20 requests per 15 minutes.
- **CORS Lockdown**: Only origins listed in `ALLOWED_ORIGINS` environment variable are permitted. No more `origin: '*'`.
- **Input Validation**: The `/api/ai/chat` endpoint validates message content (required, max 2000 chars) and language codes (whitelist).
- **Parameterized Queries**: All database operations use parameterized SQL to prevent injection.
- **Request Size Limit**: JSON body parsing is limited to 10KB.

## 🧪 Testing

The project uses **Jest** as the test runner with **supertest** for HTTP testing and **socket.io-client** for WebSocket testing.

```bash
npm test
```

### Test Coverage

- **Database Unit Tests** (`__tests__/database.test.js`): Tests all 8 database query methods using an in-memory SQLite database
- **API Integration Tests** (`__tests__/api.test.js`): Tests all 10 REST endpoints including input validation and caching
- **WebSocket Tests** (`__tests__/websocket.test.js`): Tests Socket.IO event emission on connect and role switching

## 🔧 Configuration

### Environment Variables

| Variable          | Description                                  | Default                      |
| ----------------- | -------------------------------------------- | ---------------------------- |
| `PORT`            | Server port                                  | `3000`                       |
| `GEMINI_API_KEY`  | Google Gemini API key for AI features        | _(none — runs in demo mode)_ |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:3000`      |

## 🗄️ Database

The application uses SQLite (`sqlite3` package) with automatic initialization:

- Database file: `data/stadium.db`
- Tables: crowd_density, gates, parking_lots, matches, incidents, staff, sustainability
- **Indexes**: zone, status columns are indexed for efficient filtering
- Auto-seeds with initial data on first run
- Promise-based query methods for async/await support

## 🐛 Troubleshooting

### Server won't start

- Check if port 3000 is already in use
- Verify Node.js version (v16+ required)
- Run `npm install` to ensure all dependencies are installed
- Ensure `.env` file exists (copy from `.env.example`)

### AI features not working

- Check that `GEMINI_API_KEY` is set in `.env`
- Verify the key is valid at [aistudio.google.com](https://aistudio.google.com/apikey)
- Without a key, the app runs in demo mode with pre-built responses

### Rate limit errors (429)

- API routes are limited to 100 requests per 15 minutes
- AI chat is limited to 20 requests per 15 minutes
- Wait for the rate limit window to reset

### Database errors

- Ensure `data/` directory exists and is writable
- Delete `data/stadium.db` and restart to reinitialize

### WebSocket not connecting

- Check browser console for errors
- Verify server is running
- Ensure your origin is in `ALLOWED_ORIGINS`
- Check firewall settings

### Animations not working

- Verify GSAP and Three.js libraries are loaded
- Check browser console for JavaScript errors
- Ensure hardware acceleration is enabled in browser

## 📝 Development Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm test         # Run all tests (Jest)
npm run build    # Build for production (Webpack)
npm run build:dev # Build with watch mode
```

## 📦 Dependencies

### Production

| Package              | Version | Purpose                           |
| -------------------- | ------- | --------------------------------- |
| `express`            | ^4.18.2 | Web server framework              |
| `socket.io`          | ^4.7.2  | Real-time WebSocket communication |
| `cors`               | ^2.8.5  | Cross-origin resource sharing     |
| `dotenv`             | ^16.3.1 | Environment variable management   |
| `sqlite3`            | ^5.1.6  | SQLite database driver            |
| `uuid`               | ^9.0.1  | Unique ID generation              |
| `helmet`             | ^8.2.0  | Secure HTTP headers               |
| `express-rate-limit` | ^8.5.2  | API rate limiting                 |

### Development

| Package            | Version | Purpose                        |
| ------------------ | ------- | ------------------------------ |
| `jest`             | ^30.4.2 | Test runner                    |
| `supertest`        | ^7.2.2  | HTTP integration testing       |
| `socket.io-client` | ^4.8.3  | WebSocket client for tests     |
| `nodemon`          | ^3.0.1  | Auto-reload development server |
| `webpack`          | ^5.89.0 | Module bundler                 |
| `webpack-cli`      | ^5.1.4  | Webpack CLI                    |

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires JavaScript enabled

## 📱 Responsive Breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## 🎯 User Roles

### Fan

- View stadium overview
- Access navigation and transportation
- Use AI assistant for queries
- View live matches and scores

### Staff

- Access crowd intelligence
- Monitor gate operations
- View parking status
- Track incidents

### Organizer

- Full operations center access
- Staff deployment management
- Sustainability metrics
- All staff features

## 🤝 Contributing

This is a demonstration project for the FIFA World Cup 2026 StadiumAI Hub.

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🎉 Acknowledgments

- **GSAP** - Professional-grade animation library
- **Three.js** - 3D graphics library
- **Socket.IO** - Real-time bidirectional communication
- **Express** - Fast Node.js web framework
- **sqlite3** - SQLite database driver for Node.js
- **Helmet** - Security middleware for Express
- **Jest** - Testing framework

---

**Built with ❤️ for FIFA World Cup 2026**
