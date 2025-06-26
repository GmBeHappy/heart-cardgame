import { v4 as uuidv4 } from "uuid";
import { Player } from "../types/game";

// Generate a random room code
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize a new player
export function initializePlayer(
  playerId: string,
  playerName: string,
  isHost: boolean = false
): Player {
  return {
    id: playerId,
    name: playerName,
    isHost,
    isReady: false,
    hand: [],
    score: 0,
    tricks: [],
    passedCards: [],
  };
}

// Generate a unique ID
export function generateId(): string {
  return uuidv4();
}
