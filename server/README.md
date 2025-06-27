# Hearts Card Game Server

A refactored Bun/TypeScript server for the Hearts card game using Socket.IO, organized in a clean MVC architecture.

## Project Structure

```
server/
├── config/
│   └── server.ts          # Server configuration and setup
├── controllers/
│   ├── gameController.ts  # Game logic and state management
│   └── socketController.ts # Socket.IO event handlers
├── models/
│   └── roomModel.ts       # Room data management and persistence
├── services/
│   ├── deckService.ts     # Deck creation, shuffling, and dealing
│   ├── gameLogicService.ts # Game rules and validation
│   └── utilityService.ts  # Helper functions and utilities
├── types/
│   └── game.ts           # TypeScript interfaces and types
├── index.ts              # Main server entry point
└── README.md             # This file
```

## Architecture Overview

### MVC Pattern

- **Models** (`models/`): Handle data persistence and business logic for rooms and players
- **Controllers** (`controllers/`): Manage game flow and handle client requests
- **Services** (`services/`): Provide utility functions and game mechanics
- **Types** (`types/`): Define TypeScript interfaces and type definitions

### Key Components

#### Models

- **RoomModel**: Manages game rooms, player connections, and room state

#### Controllers

- **GameController**: Handles game logic, card playing, and round management
- **SocketController**: Manages Socket.IO events and client communication

#### Services

- **DeckService**: Creates, shuffles, and deals cards
- **GameLogicService**: Implements game rules, validation, and scoring
- **UtilityService**: Provides helper functions for room codes and player initialization

#### Types

- **Game Types**: Defines interfaces for Player, Card, GameRoom, and related types

## Features

- Real-time multiplayer Hearts card game
- Room-based gameplay with unique room codes
- Automatic game state management
- Card validation and game rules enforcement
- Support for "shooting the moon" mechanics
- Player reconnection handling
- Clean separation of concerns

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the server:
   ```bash
   bun start
   ```

The server will run on port 3001 by default (configurable via PORT environment variable).

## Socket.IO Events

### Client to Server

- `createRoom`: Create a new game room
- `joinRoom`: Join an existing room
- `getRoomData`: Retrieve room data (for reconnections)
- `setReady`: Set player ready status
- `passCards`: Pass cards to other players
- `playCard`: Play a card during the game

### Server to Client

- `roomCreated`: Confirmation of room creation
- `roomJoined`: Confirmation of joining a room
- `playerJoined`: Notification when a player joins
- `gameStarted`: Game has begun
- `cardsPassed`: Cards have been passed
- `cardsExchanged`: Cards have been exchanged
- `cardPlayed`: A card has been played
- `trickCompleted`: A trick has been completed
- `newRound`: A new round has started
- `gameOver`: Game has ended
- `playerLeft`: A player has left the room
- `error`: Error messages

## Game Rules

The server implements standard Hearts card game rules:

- 4 players per game
- 2 of Clubs must be played first
- Must follow suit if possible
- Can't lead hearts until hearts have been broken
- Hearts and Queen of Spades are penalty cards
- "Shooting the moon" gives 0 points to the shooter, 26 to others
- Game ends when a player reaches 100+ points
