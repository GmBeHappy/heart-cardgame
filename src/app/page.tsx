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

  // Show loading while connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center relative overflow-hidden">
        {/* Single animated background element for better performance */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-glow"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">
            Connecting to game server...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 relative overflow-hidden">
      {/* Reduced animated background elements for better performance */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-glow"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            Hearts
          </h1>
          <p className="text-muted-foreground text-lg">
            Traditional trick-taking card game
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Player Name Input */}
        <div className="glass rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Your Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-4 py-3 bg-input border border-border rounded-lg focus-ring text-foreground placeholder-muted-foreground transition-colors duration-200"
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
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 disabled:bg-muted disabled:text-muted-foreground text-secondary-foreground font-semibold rounded-lg transition-colors duration-200 focus-ring"
            >
              Save
            </button>
          </div>
          {localStorage.getItem("playerName") && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-accent">
                ✓ Name saved for future sessions
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateRoom(true)}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-accent-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus-ring"
          >
            Create New Room
          </button>

          <button
            onClick={() => setShowJoinRoom(true)}
            disabled={!playerName.trim()}
            className="w-full glass hover:bg-white/10 text-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus-ring border border-border/50"
          >
            Join Existing Room
          </button>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-xl p-8 max-w-sm w-full">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Create Room
              </h2>
              <p className="text-muted-foreground mb-6">
                Create a new Hearts game room and invite friends to join!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus-ring"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 glass hover:bg-white/10 text-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus-ring"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-xl p-8 max-w-sm w-full">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Join Room
              </h2>
              <label className="block text-sm font-medium text-foreground mb-3">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus-ring text-foreground placeholder-muted-foreground transition-all duration-200 mb-6"
                maxLength={6}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    playerName.trim() &&
                    roomCode.trim()
                  ) {
                    handleJoinRoom();
                  }
                }}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 disabled:from-muted disabled:to-muted disabled:text-muted-foreground text-accent-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus-ring"
                >
                  Join
                </button>
                <button
                  onClick={() => setShowJoinRoom(false)}
                  className="flex-1 glass hover:bg-white/10 text-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus-ring"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
