"use client";

import React, { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { GameRoom, Player as PlayerType } from "@/types/game";
import Player from "./Player";

interface LobbyProps {
  room: GameRoom;
  currentPlayer: PlayerType;
  onGameStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentPlayer, onGameStart }) => {
  const { socket } = useSocket();
  const [isReady, setIsReady] = useState(currentPlayer.isReady);
  const [showCopied, setShowCopied] = useState(false);
  const [endPoint, setEndPoint] = useState(room.endPoint);

  const handleReadyToggle = () => {
    if (!socket) return;

    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit("setReady", newReadyState);
  };

  const handleEndPointChange = (newEndPoint: number) => {
    if (!socket || !currentPlayer.isHost) return;

    setEndPoint(newEndPoint);
    socket.emit("updateEndPoint", newEndPoint);
  };

  const handleCopyUrl = async () => {
    const roomUrl = `${window.location.origin}/lobby/${room.code}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const canStartGame =
    room.players.length === 4 && room.players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6 relative overflow-hidden">
      {/* Single animated background element for better performance */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-glow"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Room Header */}
        <div className="glass rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">
              Hearts Game Lobby
            </h1>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                Room Code
              </div>
              <div className="text-3xl font-mono font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent glass px-6 py-3 rounded-xl border border-accent/20">
                {room.code}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground mb-6">
            <div className="glass px-4 py-3 rounded-lg">
              Players: {room.players.length}/{room.maxPlayers}
            </div>
            <div className="glass px-4 py-3 rounded-lg">
              Status: {room.gameState}
            </div>
          </div>

          {/* End Point Display */}
          <div className="glass border border-accent/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-accent">
                End Point:
              </span>
              <span className="text-xl font-bold text-accent">
                {room.endPoint} points
              </span>
              {currentPlayer.isHost && (
                <span className="text-xs text-muted-foreground">
                  (Host can change)
                </span>
              )}
            </div>
          </div>

          {/* Share URL Section */}
          <div className="glass border border-accent/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Share Room
                </h3>
                <p className="text-sm text-muted-foreground">
                  Copy the link below to invite friends
                </p>
              </div>
              <button
                onClick={handleCopyUrl}
                className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus-ring flex items-center gap-2"
              >
                {showCopied ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-input rounded-lg border border-border text-sm text-muted-foreground font-mono break-all">
              {`${window.location.origin}/lobby/${room.code}`}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {room.players.map((player) => (
            <Player
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayer.id}
            />
          ))}
        </div>

        {/* Game Settings (Host Only) */}
        {currentPlayer.isHost && (
          <div className="glass rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Game Settings
            </h3>
            <div className="flex items-center gap-4">
              <label
                htmlFor="endPoint"
                className="text-sm font-medium text-foreground"
              >
                End Point:
              </label>
              <select
                id="endPoint"
                value={endPoint}
                onChange={(e) => handleEndPointChange(Number(e.target.value))}
                className="bg-input border border-border rounded-lg px-4 py-3 text-sm focus-ring text-foreground transition-colors duration-200"
              >
                <option value={50}>50 points</option>
                <option value={100}>100 points</option>
                <option value={150}>150 points</option>
                <option value={200}>200 points</option>
                <option value={250}>250 points</option>
                <option value={300}>300 points</option>
              </select>
              <span className="text-sm text-muted-foreground">
                (Higher = longer game)
              </span>
            </div>
          </div>
        )}

        {/* Ready/Start Section */}
        <div className="glass rounded-xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Game Status
              </h3>
              <p className="text-sm text-muted-foreground">
                {room.players.length < 4
                  ? `Waiting for ${4 - room.players.length} more player${
                      4 - room.players.length === 1 ? "" : "s"
                    }...`
                  : room.players.every((p) => p.isReady)
                  ? "All players ready! Host can start the game."
                  : "Waiting for players to be ready..."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Ready Button */}
              <button
                onClick={handleReadyToggle}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus-ring ${
                  isReady
                    ? "bg-accent text-accent-foreground"
                    : "glass hover:bg-white/10 text-foreground"
                }`}
              >
                {isReady ? "✓ Ready" : "Not Ready"}
              </button>

              {/* Start Game Button (Host Only) */}
              {currentPlayer.isHost && canStartGame && (
                <button
                  onClick={onGameStart}
                  className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus-ring"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
