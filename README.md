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

### Backend
- **Node.js/Express Server**: RESTful API with comprehensive endpoints
- **SQLite Database**: Efficient data storage with `better-sqlite3`
- **WebSocket Support**: Socket.IO for real-time bidirectional communication
- **CORS Enabled**: Cross-origin resource sharing for API access
- **Environment Configuration**: dotenv for flexible configuration

### Data & Features
- **Crowd Intelligence**: Real-time crowd density monitoring and heatmap
- **Gate Management**: Live gate status and throughput tracking
- **Parking Status**: Real-time parking availability
- **Live Matches**: Match scores, timing, and status updates
- **Operations Center**: Incident tracking and staff deployment
- **Sustainability Metrics**: Environmental impact monitoring
- **AI Assistant**: Multilingual translation and Q&A (with Gemini API)
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

3. **Create environment file (optional)**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

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

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 📁 Project Structure

```
promptwars 3/
├── server/
│   ├── index.js          # Main Express server with API routes
│   └── database.js       # SQLite database management
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # Styling with animations
│   ├── app.js            # Core application logic
│   ├── dashboard-data.js # Dashboard data rendering
│   ├── crowd-data.js     # Crowd intelligence logic
│   ├── stadium-map.js    # Stadium map visualization
│   ├── ai-assistant.js   # AI chat and translation
│   ├── animations.js     # GSAP animations & effects
│   ├── stadium-3d.js     # Three.js 3D stadium
│   └── websocket-client.js # WebSocket client
├── data/
│   └── stadium.db        # SQLite database (auto-created)
├── package.json          # Dependencies and scripts
└── README.md            # This file
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
- `GET /api/operations/staff` - Get staff deployment status

### Sustainability
- `GET /api/sustainability/metrics` - Get sustainability metrics

## 📡 WebSocket Events

### Client → Server
- `role:switch` - Switch user role (fan/operator/admin)

### Server → Client
- `crowd:update` - Real-time crowd density updates
- `gates:update` - Real-time gate status updates
- `matches:update` - Real-time match updates
- `role:confirmed` - Role switch confirmation

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

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### AI Features
To enable AI chat and translation features:
1. Click the settings icon (⚙️) in the header
2. Enter your Google Gemini API key
3. Settings are stored locally in your browser

## 🗄️ Database

The application uses SQLite with automatic initialization:
- Database file: `data/stadium.db`
- Tables: crowd_density, gates, parking_lots, matches, incidents, staff, sustainability
- Auto-seeds with initial data on first run

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

### Operator
- Access crowd intelligence
- Monitor gate operations
- View parking status
- Track incidents

### Admin
- Full operations center access
- Staff deployment management
- Sustainability metrics
- All operator features

## 🔒 Security Notes

- API keys are stored locally in browser localStorage
- WebSocket connections use CORS configuration
- Database operations use parameterized queries
- No sensitive data is transmitted without encryption

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify Node.js version (v16+ required)
- Run `npm install` to ensure all dependencies are installed

### Database errors
- Ensure `data/` directory exists and is writable
- Delete `data/stadium.db` and restart to reinitialize

### WebSocket not connecting
- Check browser console for errors
- Verify server is running
- Check firewall settings

### Animations not working
- Verify GSAP and Three.js libraries are loaded
- Check browser console for JavaScript errors
- Ensure hardware acceleration is enabled in browser

## 📝 Development Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run build    # Build for production (Webpack)
npm run build:dev # Build with watch mode
```

## 🤝 Contributing

This is a demonstration project for the FIFA World Cup 2026 StadiumAI Hub.

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🎉 Acknowledgments

- **GSAP** - Professional-grade animation library
- **Three.js** - 3D graphics library
- **Socket.IO** - Real-time bidirectional communication
- **Express** - Fast Node.js web framework
- **better-sqlite3** - Fastest SQLite library for Node.js

---

**Built with ❤️ for FIFA World Cup 2026**
