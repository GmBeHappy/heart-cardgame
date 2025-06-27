# Try Hearth - Multiplayer Card Game

A real-time multiplayer card game built with Next.js, Socket.IO, and TypeScript in a monorepo structure. Players can create rooms, join with room codes, and play strategic card battles in real-time.

## 🎮 Features

- **Real-time Multiplayer**: Play with up to 4 players simultaneously
- **Room System**: Create rooms with unique codes for friends to join
- **Card Gameplay**: Strategic card-based combat system
- **Mana System**: Resource management with increasing mana each turn
- **Health System**: Last player standing wins
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Updates**: Instant game state synchronization

## 🏗️ Project Structure

```
try-hearth/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile           # Frontend container
├── server/                  # Socket.IO backend server
│   ├── config/              # Server configuration
│   ├── controllers/         # Request handlers
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── types/               # TypeScript type definitions
│   ├── index.ts             # Server entry point
│   ├── package.json         # Server dependencies
│   └── Dockerfile           # Server container
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun** (recommended)
- **Docker** and **Docker Compose** (for containerized development)
- Modern web browser

### Option 1: Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd try-hearth
   ```

2. **Install dependencies**

   ```bash
   # Install frontend dependencies
   cd frontend
   bun install

   # Install server dependencies
   cd ../server
   bun install
   cd ..
   ```

3. **Start the development servers**

   ```bash
   # Terminal 1: Start the backend server
   cd server
   bun run dev

   # Terminal 2: Start the frontend
   cd frontend
   bun run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Option 2: Docker Development

1. **Clone and navigate to the repository**

   ```bash
   git clone <repository-url>
   cd try-hearth
   ```

2. **Start the development environment**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

## 🎯 How to Play

1. **Enter your name** on the main screen
2. **Create a room** or **join an existing room** with a room code
3. **Wait for players** to join (minimum 2 players)
4. **Click "Ready"** when you're prepared to start
5. **Host starts the game** when all players are ready
6. **Play cards strategically** to defeat your opponents
7. **Last player standing wins!**

## 🛠️ Development

### Tech Stack

#### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React 19** - Latest React features

#### Backend

- **Node.js** - JavaScript runtime
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type-safe server development
- **Bun** - Fast JavaScript runtime and package manager

### Development Scripts

#### Frontend (`frontend/package.json`)

```bash
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

#### Backend (`server/package.json`)

```bash
bun run dev          # Start development server with hot reload
bun run build        # Build TypeScript to JavaScript
bun run start        # Start production server
```

### Code Style & Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Comments**: Well-documented code with clear explanations
- **Clean Architecture**: Separation of concerns between components

### Key Components

#### Frontend Components

- **Card**: Beautiful card display with rarity colors and effects
- **Player**: Player information with health/mana bars
- **Lobby**: Room management and player waiting
- **Game**: Main game board with turn-based gameplay

#### Backend Services

- **Socket Controller**: Real-time game state management
- **Game Controller**: Game logic and turn management
- **Deck Service**: Card database and deck management
- **Game Logic Service**: Core game rules and mechanics

## 🐳 Docker

### Development Environment

```bash
# Start development containers
docker-compose -f docker-compose.dev.yml up --build

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Start production containers
docker-compose up --build

# Stop containers
docker-compose down
```

### Docker Environment Variables

For Docker deployments, environment variables are handled differently:

#### Environment File Structure

When running `docker-compose` from the root directory, create a `.env` file in the root:

```bash
# Root directory .env file (same level as docker-compose.yml)
NEXT_PUBLIC_SERVER_URL=http://server:3001
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**File Structure:**

```
try-hearth/
├── .env                    # Root-level environment file
├── docker-compose.yml      # Docker Compose configuration
├── frontend/
│   ├── .env.local         # Frontend-specific (optional)
│   └── ...
└── server/
    ├── .env               # Server-specific (optional)
    └── ...
```

#### Frontend (Next.js)

- **Build-time variables**: Use `build.args` in docker-compose.yml for `NEXT_PUBLIC_*` variables
- **Runtime variables**: Use `environment` in docker-compose.yml for other variables

Example docker-compose.yml:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      NEXT_PUBLIC_SERVER_URL: http://server:3001 # Build-time
    environment:
      NODE_ENV: production # Runtime
```

#### Backend

- All environment variables are runtime variables
- Use `environment` in docker-compose.yml

Example:

```yaml
server:
  environment:
    NODE_ENV: production
    PORT: 3001
    CORS_ORIGIN: http://localhost:3000
```

### Container Details

- **Frontend**: Next.js app with hot reload (dev) or optimized build (prod)
- **Backend**: Node.js server with TypeScript compilation
- **Networking**: Internal bridge network for service communication

## 🚀 Deployment

### Environment Configuration

Before deploying, you need to configure the server URL for your environment:

#### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# For local development
NEXT_PUBLIC_SERVER_URL=http://localhost:3001

# For production (replace with your actual server URL)
NEXT_PUBLIC_SERVER_URL=https://heart-api.game.witchayut.com
```

**Important Notes:**

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- For local development, use `http://localhost:3001`
- For production, use your deployed server URL (e.g., `https://heart-api.game.witchayut.com`)
- If no environment variable is set, the app will automatically detect localhost vs production

#### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# Server configuration
NODE_ENV=production
PORT=3001

# CORS settings (required for frontend connection)
# For local development: http://localhost:3000
# For production: https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

**Important Notes:**

- `CORS_ORIGIN` must match your frontend domain exactly
- Include the protocol (http:// or https://) in the CORS_ORIGIN
- For multiple domains, you can use an array: `["http://localhost:3000", "https://your-domain.com"]`

### Frontend Deployment (Vercel)

1. **Connect repository** to Vercel
2. **Configure build settings**:
   - Build Command: `cd frontend && bun run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && bun install`
3. **Set environment variables**:
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend Socket.IO URL
4. **Deploy**

### Backend Deployment (Railway/Render)

1. **Upload server code** to your preferred platform
2. **Set environment variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
3. **Update frontend Socket.IO connection URL**
4. **Deploy**

### Full Stack Deployment

For a complete deployment, consider using:

- **Railway**: Full-stack deployment with automatic scaling
- **Render**: Easy deployment with Docker support
- **DigitalOcean App Platform**: Managed container deployment

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the code style guidelines
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Submit a pull request**

### Development Workflow

1. **Create an issue** describing the feature or bug
2. **Fork and clone** the repository
3. **Set up development environment** (see Quick Start)
4. **Make changes** in your feature branch
5. **Test thoroughly** with multiple players
6. **Submit PR** with detailed description

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by Hearthstone and other card games
- Built with modern web technologies
- Real-time multiplayer functionality
- Clean, responsive UI design

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy gaming! 🎮**
