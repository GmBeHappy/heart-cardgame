import { Server, Socket } from "socket.io";
import { RoomModel } from "../models/roomModel";
import { GameController } from "./gameController";
import { findWinner } from "../services/gameLogicService";

export class SocketController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Create a new room
      socket.on("createRoom", (playerName: string) => {
        this.handleCreateRoom(socket, playerName);
      });

      // Join an existing room
      socket.on(
        "joinRoom",
        (data: { roomCode: string; playerName: string }) => {
          this.handleJoinRoom(socket, data);
        }
      );

      // Get room data (for room creators who already have room data)
      socket.on(
        "getRoomData",
        (data: { roomCode: string; playerName?: string }) => {
          this.handleGetRoomData(socket, data);
        }
      );

      // Player ready status
      socket.on("setReady", (isReady: boolean) => {
        this.handleSetReady(socket, isReady);
      });

      // Pass cards
      socket.on("passCards", (cardIds: string[]) => {
        this.handlePassCards(socket, cardIds);
      });

      // Play a card
      socket.on("playCard", (cardId: string) => {
        this.handlePlayCard(socket, cardId);
      });

      // Update room end point (host only)
      socket.on("updateEndPoint", (endPoint: number) => {
        this.handleUpdateEndPoint(socket, endPoint);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleCreateRoom(socket: Socket, playerName: string): void {
    console.log(
      `Creating room for player: ${playerName} (socket: ${socket.id})`
    );

    const { room, player } = RoomModel.createRoom(socket.id, playerName);

    socket.join(room.id);
    socket.emit("roomCreated", { room, player });
  }

  private handleJoinRoom(
    socket: Socket,
    data: { roomCode: string; playerName: string }
  ): void {
    console.log(
      `Join room request: ${data.playerName} trying to join ${data.roomCode}`
    );

    const result = RoomModel.addPlayerToRoom(
      data.roomCode,
      socket.id,
      data.playerName
    );

    if (!result) {
      socket.emit("error", {
        message: "Room not found, is full, or game already in progress",
      });
      return;
    }

    const { room, player } = result;

    socket.join(room.id);
    socket.emit("roomJoined", { room, player });
    this.io.to(room.id).emit("playerJoined", { player, room });

    console.log(`${data.playerName} joined room ${data.roomCode}`);
  }

  private handleGetRoomData(
    socket: Socket,
    data: { roomCode: string; playerName?: string }
  ): void {
    console.log(
      `Get room data request for room ${data.roomCode} from socket ${socket.id}`
    );

    const room = RoomModel.findRoomByCode(data.roomCode);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // First try to find the player by socket ID (for existing connections)
    let player = RoomModel.findPlayerInRoom(room.id, socket.id);

    // If not found by socket ID, try to find by name (for reconnections)
    if (!player && data.playerName) {
      player = RoomModel.findPlayerByName(room.id, data.playerName);
    }

    // If still not found, try to find the host player (fallback)
    if (!player) {
      player = room.players.find((p) => p.isHost);
    }

    if (!player) {
      socket.emit("error", { message: "Player not found in room" });
      return;
    }

    console.log(
      `Sending room data to player ${player.name} in room ${data.roomCode}`
    );

    // Update the player's socket ID to the current one
    RoomModel.updatePlayerSocketId(room.id, player.id, socket.id);

    // Send room data to the player using a different event
    socket.join(room.id);
    socket.emit("roomDataReceived", { room, player });
  }

  private handleSetReady(socket: Socket, isReady: boolean): void {
    const roomId = RoomModel.getRoomIdForPlayer(socket.id);
    if (!roomId) return;

    const success = RoomModel.updatePlayerReady(roomId, socket.id, isReady);
    if (!success) return;

    this.io.to(roomId).emit("playerReady", { playerId: socket.id, isReady });

    // Check if all players are ready to start
    if (RoomModel.areAllPlayersReady(roomId)) {
      const room = GameController.startGame(roomId);
      if (room) {
        this.io.to(roomId).emit("gameStarted", { room });
      }
    }
  }

  private handlePassCards(socket: Socket, cardIds: string[]): void {
    const roomId = RoomModel.getRoomIdForPlayer(socket.id);
    if (!roomId) return;

    const result = GameController.passCards(roomId, socket.id, cardIds);

    if (!result.success) {
      socket.emit("error", { message: result.message });
      return;
    }

    const room = RoomModel.getRoomById(roomId);
    if (room) {
      this.io.to(roomId).emit("cardsPassed", { room });

      // If cards were exchanged, emit the event
      if (room.gameState === "playing") {
        this.io.to(roomId).emit("cardsExchanged", { room });
      }
    }
  }

  private handlePlayCard(socket: Socket, cardId: string): void {
    const roomId = RoomModel.getRoomIdForPlayer(socket.id);
    if (!roomId) return;

    const result = GameController.playCard(roomId, socket.id, cardId);

    if (!result.success) {
      socket.emit("error", { message: result.message });
      return;
    }

    const room = RoomModel.getRoomById(roomId);
    if (room) {
      this.io.to(roomId).emit("cardPlayed", {
        playerId: socket.id,
        card: result.card,
        room,
      });

      // Check if trick was completed
      if (room.currentTrick.length === 0 && room.gameState === "playing") {
        this.io.to(roomId).emit("trickCompleted", { room });
      }

      // Check if round ended
      if (room.gameState === "passing" && room.roundNumber > 0) {
        this.io.to(roomId).emit("newRound", { room });
      }

      // Check if game ended
      if (room.gameState === "finished") {
        const winner = findWinner(room.players);
        this.io.to(roomId).emit("gameOver", { winner, room });
      }
    }
  }

  private handleUpdateEndPoint(socket: Socket, endPoint: number): void {
    const roomId = RoomModel.getRoomIdForPlayer(socket.id);
    if (!roomId) return;

    const success = RoomModel.updateEndPoint(roomId, socket.id, endPoint);
    if (!success) {
      socket.emit("error", {
        message:
          "Failed to update end point. Only the host can change this setting.",
      });
      return;
    }

    const room = RoomModel.getRoomById(roomId);
    if (room) {
      this.io.to(roomId).emit("endPointUpdated", { endPoint, room });
    }
  }

  private handleDisconnect(socket: Socket): void {
    const result = RoomModel.removePlayer(socket.id);

    if (result.playerLeft && result.room) {
      this.io.to(result.room.id).emit("playerLeft", { room: result.room });
    }

    console.log(`Player disconnected: ${socket.id}`);
  }
}
