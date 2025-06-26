import { GameRoom, Player } from "../types/game";
import {
  generateId,
  generateRoomCode,
  initializePlayer,
} from "../services/utilityService";
import { createDeck } from "../services/deckService";

// Game state management
const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // playerId -> roomId

export class RoomModel {
  // Create a new room
  static createRoom(
    playerId: string,
    playerName: string
  ): { room: GameRoom; player: Player } {
    const roomCode = generateRoomCode();
    const player = initializePlayer(playerId, playerName, true);

    const room: GameRoom = {
      id: generateId(),
      code: roomCode,
      players: [player],
      gameState: "waiting",
      currentTurn: 0,
      currentTrick: [],
      ledSuit: null,
      passDirection: "left",
      deck: createDeck(),
      roundNumber: 0,
      maxPlayers: 4,
      createdAt: new Date(),
      firstTrickOfRound: true,
      endPoint: 100, // Default end point
    };

    rooms.set(room.id, room);
    playerRooms.set(playerId, room.id);

    console.log(
      `Room created: ${roomCode} by ${playerName} with ${room.players.length} players`
    );
    console.log(`Player mapping: socket ${playerId} -> room ${room.id}`);

    return { room, player };
  }

  // Find room by code
  static findRoomByCode(roomCode: string): GameRoom | undefined {
    return Array.from(rooms.values()).find((r) => r.code === roomCode);
  }

  // Get room by ID
  static getRoomById(roomId: string): GameRoom | undefined {
    return rooms.get(roomId);
  }

  // Get room ID for a player
  static getRoomIdForPlayer(playerId: string): string | undefined {
    return playerRooms.get(playerId);
  }

  // Add player to room
  static addPlayerToRoom(
    roomCode: string,
    playerId: string,
    playerName: string
  ): { room: GameRoom; player: Player } | null {
    const room = this.findRoomByCode(roomCode);
    if (!room) return null;

    if (room.players.length >= room.maxPlayers) return null;
    if (room.gameState !== "waiting") return null;

    // Check if player is already in the room
    const existingPlayer = room.players.find((p) => p.id === playerId);
    if (existingPlayer) {
      return { room, player: existingPlayer };
    }

    const player = initializePlayer(playerId, playerName);
    room.players.push(player);
    playerRooms.set(playerId, room.id);

    console.log(
      `Room ${roomCode} now has ${room.players.length} players:`,
      room.players.map((p) => p.name)
    );

    return { room, player };
  }

  // Find player in room
  static findPlayerInRoom(
    roomId: string,
    playerId: string
  ): Player | undefined {
    const room = rooms.get(roomId);
    return room?.players.find((p) => p.id === playerId);
  }

  // Find player by name in room
  static findPlayerByName(
    roomId: string,
    playerName: string
  ): Player | undefined {
    const room = rooms.get(roomId);
    return room?.players.find((p) => p.name === playerName);
  }

  // Update player ready status
  static updatePlayerReady(
    roomId: string,
    playerId: string,
    isReady: boolean
  ): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.isReady = isReady;
    return true;
  }

  // Check if all players are ready
  static areAllPlayersReady(roomId: string): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;

    return room.players.length === 4 && room.players.every((p) => p.isReady);
  }

  // Remove player from room
  static removePlayer(playerId: string): {
    room: GameRoom | null;
    playerLeft: boolean;
  } {
    const roomId = playerRooms.get(playerId);
    if (!roomId) return { room: null, playerLeft: false };

    const room = rooms.get(roomId);
    if (!room) return { room: null, playerLeft: false };

    room.players = room.players.filter((p) => p.id !== playerId);
    playerRooms.delete(playerId);

    if (room.players.length === 0) {
      // Delete empty room
      rooms.delete(roomId);
      return { room: null, playerLeft: true };
    } else {
      // Assign new host if needed
      if (!room.players.some((p) => p.isHost)) {
        room.players[0].isHost = true;
      }
      return { room, playerLeft: true };
    }
  }

  // Update player socket ID (for reconnections)
  static updatePlayerSocketId(
    roomId: string,
    oldSocketId: string,
    newSocketId: string
  ): void {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === oldSocketId);
    if (player) {
      player.id = newSocketId;
      playerRooms.delete(oldSocketId);
      playerRooms.set(newSocketId, roomId);
    }
  }

  // Get all rooms (for debugging)
  static getAllRooms(): GameRoom[] {
    return Array.from(rooms.values());
  }

  // Get room count (for debugging)
  static getRoomCount(): number {
    return rooms.size;
  }

  // Update room end point (host only)
  static updateEndPoint(
    roomId: string,
    playerId: string,
    endPoint: number
  ): boolean {
    const room = rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || !player.isHost) return false;

    // Validate end point (must be positive and reasonable)
    if (endPoint <= 0 || endPoint > 500) return false;

    room.endPoint = endPoint;
    return true;
  }
}
