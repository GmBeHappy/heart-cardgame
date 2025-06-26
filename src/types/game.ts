// Game types for the traditional Hearts card game
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  hand: Card[];
  score: number;
  tricks: Card[][];
  passedCards: Card[];
}

export interface Card {
  id: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K"
    | "A";
  value: number; // For comparison (2=2, J=11, Q=12, K=13, A=14)
}

export interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  gameState: "waiting" | "passing" | "playing" | "finished";
  currentTurn: number;
  currentTrick: Card[];
  ledSuit: string | null;
  passDirection: "left" | "right" | "across" | "none";
  deck: Card[];
  roundNumber: number;
  maxPlayers: number;
  createdAt: Date;
  firstTrickOfRound: boolean; // Track if this is the first trick of the round
  endPoint: number; // Custom end point for the game (default: 100)
}

// Socket event types
export interface SocketEvents {
  // Client to Server
  createRoom: (playerName: string) => void;
  joinRoom: (data: { roomCode: string; playerName: string }) => void;
  getRoomData: (data: { roomCode: string; playerName?: string }) => void;
  setReady: (isReady: boolean) => void;
  passCards: (cardIds: string[]) => void;
  playCard: (cardId: string) => void;
  updateEndPoint: (endPoint: number) => void;

  // Server to Client
  roomCreated: (data: { room: GameRoom; player: Player }) => void;
  roomJoined: (data: { room: GameRoom; player: Player }) => void;
  roomDataReceived: (data: { room: GameRoom; player: Player }) => void;
  playerJoined: (data: { player: Player; room: GameRoom }) => void;
  playerReady: (data: { playerId: string; isReady: boolean }) => void;
  gameStarted: (data: { room: GameRoom }) => void;
  cardsPassed: (data: { room: GameRoom }) => void;
  cardsExchanged: (data: { room: GameRoom }) => void;
  cardPlayed: (data: { playerId: string; card: Card; room: GameRoom }) => void;
  trickCompleted: (data: { room: GameRoom }) => void;
  newRound: (data: { room: GameRoom }) => void;
  gameOver: (data: { winner: Player; room: GameRoom }) => void;
  playerLeft: (data: { room: GameRoom }) => void;
  endPointUpdated: (data: { endPoint: number; room: GameRoom }) => void;
  error: (data: { message: string }) => void;
}
