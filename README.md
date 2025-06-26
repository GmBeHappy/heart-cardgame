# Hearth Card Game

A real-time multiplayer card game built with Next.js, Socket.IO, and TypeScript. Players can create rooms, join with room codes, and play strategic card battles in real-time.

## Features

- 🎮 **Real-time Multiplayer**: Play with up to 4 players simultaneously
- 🏠 **Room System**: Create rooms with unique codes for friends to join
- 🃏 **Card Gameplay**: Strategic card-based combat system
- 💎 **Mana System**: Resource management with increasing mana each turn
- ❤️ **Health System**: Last player standing wins
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- ⚡ **Real-time Updates**: Instant game state synchronization

## Game Rules

1. **Setup**: Each player starts with 30 health and 1 mana
2. **Turns**: Players take turns playing cards and managing resources
3. **Mana**: Mana increases by 1 each turn (max 10)
4. **Cards**: Play minions, spells, and weapons strategically
5. **Victory**: Reduce all opponents' health to 0 to win

## Card Types

- **Minions**: Have attack and health stats, can attack opponents
- **Spells**: One-time effects like damage or healing
- **Weapons**: Provide attack power for the player

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend

- **Node.js** - JavaScript runtime
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type-safe server development
- **UUID** - Unique identifier generation

## Project Structure

```
try-hearth/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main game page
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── Card.tsx          # Card component
│   │   ├── Player.tsx        # Player info component
│   │   ├── Lobby.tsx         # Game lobby
│   │   └── Game.tsx          # Main game board
│   ├── contexts/
│   │   └── SocketContext.tsx # Socket.IO context
│   └── types/
│       └── game.ts           # TypeScript types
├── server/
│   ├── index.ts              # Socket.IO server
│   ├── package.json          # Server dependencies
│   └── tsconfig.json         # TypeScript config
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd try-hearth
   ```

2. **Install frontend dependencies**

   ```bash
   bun install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   bun install
   cd ..
   ```

### Running the Application

1. **Start the server** (in one terminal)

   ```bash
   cd server
   bun run dev
   ```

   The server will run on `http://localhost:3001`

2. **Start the frontend** (in another terminal)

   ```bash
   bun run dev
   ```

   The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

### How to Play

1. **Enter your name** on the main screen
2. **Create a room** or **join an existing room** with a room code
3. **Wait for players** to join (minimum 2 players)
4. **Click "Ready"** when you're prepared to start
5. **Host starts the game** when all players are ready
6. **Play cards strategically** to defeat your opponents
7. **Last player standing wins!**

## Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Comments**: Well-documented code with clear explanations
- **Clean Architecture**: Separation of concerns between components

### Key Components

#### Socket.IO Server (`server/index.ts`)

- Handles real-time game state management
- Manages room creation and player connections
- Implements game logic and turn management
- Provides card database and game rules

#### Game Components

- **Card**: Beautiful card display with rarity colors and effects
- **Player**: Player information with health/mana bars
- **Lobby**: Room management and player waiting
- **Game**: Main game board with turn-based gameplay

#### State Management

- **Socket Context**: Centralized Socket.IO connection management
- **Game State**: Real-time synchronization between players
- **Room Management**: Player joining, leaving, and ready status

## Deployment

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set build command: `bun run build`
3. Set output directory: `.next`
4. Deploy

### Backend (Railway/Render)

1. Upload server code to your preferred platform
2. Set environment variables if needed
3. Update frontend Socket.IO connection URL
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by Hearthstone and other card games
- Built with modern web technologies
- Real-time multiplayer functionality
- Clean, responsive UI design
