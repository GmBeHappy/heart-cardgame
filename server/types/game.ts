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

export type PassDirection = "left" | "right" | "across" | "none";
export type GameState = "waiting" | "passing" | "playing" | "finished";
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardRank =
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
