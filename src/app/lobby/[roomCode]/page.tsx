"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";
import { GameRoom, Player } from "@/types/game";
import Lobby from "@/components/Lobby";

// Lobby page component
const LobbyPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const roomCode = params.roomCode as string;
  const isCreator = searchParams.get("creator") === "true";

  useEffect(() => {
    console.log(
      "Lobby useEffect triggered - socket:",
      !!socket,
      "roomCode:",
      roomCode,
      "isCreator:",
      isCreator
    );

    // Get player name from localStorage
    const storedName = localStorage.getItem("playerName");
    console.log("Stored name from localStorage:", storedName);

    if (storedName) {
      setPlayerName(storedName);
      setShowNameInput(false);

      if (isCreator) {
        // User just created this room, don't auto-join
        console.log(
          "User just created this room (from URL param), not auto-joining"
        );
        // For room creators, we need to fetch the room data
        if (socket) {
          console.log("Fetching room data for creator");
          socket.emit("getRoomData", {
            roomCode: roomCode.toUpperCase(),
            playerName: storedName,
          });
        } else {
          console.log("Socket not ready yet, will fetch room data later");
        }
        setHasInitialized(true);
      } else {
        // User is joining an existing room, auto-join
        console.log("User is joining existing room, auto-joining");
        if (socket && roomCode) {
          setIsJoining(true);
          console.log("Emitting joinRoom event");
          socket.emit("joinRoom", {
            roomCode: roomCode.toUpperCase(),
            playerName: storedName,
          });
        } else {
          console.log("Socket or roomCode not ready yet");
        }
        setHasInitialized(true);
      }
    } else {
      // No stored name, show name input form
      console.log("No stored name, showing name input form");
      setShowNameInput(true);
      setHasInitialized(true);
    }
  }, [socket, roomCode, isCreator]);

  useEffect(() => {
    if (!socket || !roomCode || !hasInitialized) return;

    // Socket event listeners - only listen for roomJoined if we're not the creator
    socket.on("roomJoined", ({ room, player }) => {
      console.log("Received roomJoined event");
      setRoom(room);
      setCurrentPlayer(player);
      setError(null);
      setIsJoining(false);
      setShowNameInput(false);
    });

    socket.on("roomDataReceived", ({ room, player }) => {
      console.log("Received roomDataReceived event for room creator");
      setRoom(room);
      setCurrentPlayer(player);
      setError(null);
      setIsJoining(false);
      setShowNameInput(false);
    });

    socket.on("playerJoined", ({ room }) => {
      console.log("Player joined room");
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
      // Navigate to game page
      router.push(`/game/${roomCode}`);
    });

    socket.on("playerLeft", ({ room }) => {
      setRoom(room);
    });

    socket.on("endPointUpdated", ({ room }) => {
      setRoom(room);
    });

    socket.on("error", ({ message }) => {
      setError(message);
      setIsJoining(false);
    });

    return () => {
      socket.off("roomJoined");
      socket.off("roomDataReceived");
      socket.off("playerJoined");
      socket.off("playerReady");
      socket.off("gameStarted");
      socket.off("playerLeft");
      socket.off("endPointUpdated");
      socket.off("error");
    };
  }, [socket, roomCode, currentPlayer, router, hasInitialized]);

  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode) return;

    // Save the name for future sessions
    localStorage.setItem("playerName", playerName.trim());

    setIsJoining(true);
    setError(null);

    socket.emit("joinRoom", {
      roomCode: roomCode.toUpperCase(),
      playerName: playerName.trim(),
    });
  };

  const handleGameStart = () => {
    // This will be handled by the server when all players are ready
  };

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

  // Show name input if not joined yet
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Room</h1>
            <p className="text-gray-600">Room Code: {roomCode}</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === "Enter" && playerName.trim()) {
                  handleJoinRoom();
                }
              }}
            />

            <div className="flex space-x-3">
              <button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || isJoining}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-3 text-center">
              Your name will be saved for future sessions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show lobby if joined
  if (room && currentPlayer) {
    return (
      <Lobby
        room={room}
        currentPlayer={currentPlayer}
        onGameStart={handleGameStart}
      />
    );
  }

  return null;
};

// Lobby page with SocketProvider
export default function LobbyPageWrapper() {
  return (
    <SocketProvider>
      <LobbyPage />
    </SocketProvider>
  );
}
