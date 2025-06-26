"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocketProvider, useSocket } from "@/contexts/SocketContext";

// Main menu component
const HomeMenu: React.FC = () => {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored player name when component mounts
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return;

    console.log("Creating room for player:", playerName.trim());
    // Store player name in localStorage for use in lobby
    localStorage.setItem("playerName", playerName.trim());

    // Clear any existing listeners first
    socket.off("roomCreated");
    socket.off("error");

    socket.emit("createRoom", playerName.trim());

    // Listen for room creation response
    socket.once("roomCreated", ({ room }) => {
      console.log("Room created, redirecting to lobby:", room.code);
      // Mark that this user just created this room using URL parameter
      router.push(`/lobby/${room.code}?creator=true`);
    });

    socket.once("error", ({ message }) => {
      console.log("Error creating room:", message);
      setError(message);
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;

    // Store player name in localStorage for use in lobby
    localStorage.setItem("playerName", playerName.trim());

    // Navigate to lobby with room code
    router.push(`/lobby/${roomCode.trim().toUpperCase()}`);
  };

  const handleSaveName = () => {
    if (playerName.trim()) {
      localStorage.setItem("playerName", playerName.trim());
      setError(null);
    }
  };

  const handleClearSavedName = () => {
    localStorage.removeItem("playerName");
    setPlayerName("");
    setError(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hearts Card Game
          </h1>
          <p className="text-gray-600">Traditional trick-taking card game</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Player Name Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
              onKeyPress={(e) => {
                if (e.key === "Enter" && playerName.trim()) {
                  handleSaveName();
                }
              }}
            />
            <button
              onClick={handleSaveName}
              disabled={!playerName.trim()}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold rounded-md transition-colors"
            >
              Save
            </button>
          </div>
          {localStorage.getItem("playerName") && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600">
                ✓ Name saved for future sessions
              </p>
              <button
                onClick={handleClearSavedName}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateRoom(true)}
            disabled={!playerName.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Create New Room
          </button>

          <button
            onClick={() => setShowJoinRoom(true)}
            disabled={!playerName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Join Existing Room
          </button>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Create Room</h2>
              <p className="text-gray-600 mb-4">
                Create a new Hearts game room and invite friends to join!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Join Room</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                maxLength={6}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Join
                </button>
                <button
                  onClick={() => setShowJoinRoom(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            How to Play Hearts:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Create a room and share the code with 3 friends</li>
            <li>• Each round, pass 3 cards to another player</li>
            <li>• Avoid collecting hearts and the Queen of Spades</li>
            <li>• Lowest score wins the game!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main page component with SocketProvider
export default function Home() {
  return (
    <SocketProvider>
      <HomeMenu />
    </SocketProvider>
  );
}
