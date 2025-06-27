"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import { GameRoom, Player } from "@/types/game";
import Game from "@/components/Game";
import Passing from "@/components/Passing";

// Game page component
const GamePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roomCode = params.roomCode as string;

  useEffect(() => {
    // Fetch room data for players who are already in the room
    const storedName = localStorage.getItem("playerName");
    if (socket && roomCode && storedName && !room) {
      console.log("Game page - fetching room data for existing player");
      socket.emit("getRoomData", {
        roomCode: roomCode.toUpperCase(),
        playerName: storedName,
      });
    }
  }, [socket, roomCode, room]);

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Socket event listeners
    socket.on("roomJoined", ({ room, player }) => {
      setRoom(room);
      setCurrentPlayer(player);
      setError(null);
    });

    socket.on("roomDataReceived", ({ room, player }) => {
      setRoom(room);
      setCurrentPlayer(player);
      setError(null);
    });

    socket.on("playerJoined", ({ room }) => {
      setRoom(room);
    });

    socket.on("playerReady", ({ playerId, isReady }) => {
      if (currentPlayer && currentPlayer.id === playerId) {
        setCurrentPlayer((prev) => (prev ? { ...prev, isReady } : null));
      }
    });

    socket.on("gameStarted", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("cardsPassed", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("cardsExchanged", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("cardPlayed", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("trickCompleted", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("newRound", ({ room }) => {
      setRoom(room);
      const updatedPlayer = room.players.find(
        (p) => p.id === currentPlayer?.id
      );
      if (updatedPlayer) {
        setCurrentPlayer(updatedPlayer);
      }
    });

    socket.on("gameOver", ({ winner, room }) => {
      setRoom(room);
      alert(`Game Over! ${winner.name} wins with a score of ${winner.score}!`);
      // Navigate back to lobby
      router.push(`/lobby/${roomCode}`);
    });

    socket.on("playerLeft", ({ room }) => {
      setRoom(room);
    });

    socket.on("endPointUpdated", ({ room }) => {
      setRoom(room);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("roomDataReceived");
      socket.off("playerJoined");
      socket.off("playerReady");
      socket.off("gameStarted");
      socket.off("cardsPassed");
      socket.off("cardsExchanged");
      socket.off("cardPlayed");
      socket.off("trickCompleted");
      socket.off("newRound");
      socket.off("gameOver");
      socket.off("playerLeft");
      socket.off("endPointUpdated");
      socket.off("error");
    };
  }, [socket, roomCode, currentPlayer, router]);

  // Show loading while connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show game if in a room
  if (room && currentPlayer) {
    if (room.gameState === "passing") {
      return <Passing room={room} currentPlayer={currentPlayer} />;
    } else if (room.gameState === "playing") {
      return <Game room={room} currentPlayer={currentPlayer} />;
    } else {
      // If game state is not playing or passing, redirect to lobby
      router.push(`/lobby/${roomCode}`);
      return null;
    }
  }

  // Show loading if not in room yet
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading game...</p>
      </div>
    </div>
  );
};

// Game page with SocketProvider
export default function GamePageWrapper() {
  return (
    <SocketProvider>
      <GamePage />
    </SocketProvider>
  );
}
