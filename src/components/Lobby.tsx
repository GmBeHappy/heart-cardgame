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
    <div className="max-w-4xl mx-auto p-6">
      {/* Room Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Hearts Game Lobby
          </h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Room Code</div>
            <div className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              {room.code}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            Players: {room.players.length}/{room.maxPlayers}
          </div>
          <div>Status: {room.gameState}</div>
        </div>

        {/* End Point Display */}
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-800">
              End Point:
            </span>
            <span className="text-lg font-bold text-green-600">
              {room.endPoint} points
            </span>
            {currentPlayer.isHost && (
              <span className="text-xs text-green-600">(Host can change)</span>
            )}
          </div>
        </div>

        {/* Share URL Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Share Room</h3>
              <p className="text-sm text-blue-600">
                Copy the link below to invite friends
              </p>
            </div>
            <button
              onClick={handleCopyUrl}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
          <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-600 font-mono break-all">
            {`${window.location.origin}/lobby/${room.code}`}
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Game Settings
          </h3>
          <div className="flex items-center gap-4">
            <label
              htmlFor="endPoint"
              className="text-sm font-medium text-gray-700"
            >
              End Point:
            </label>
            <select
              id="endPoint"
              value={endPoint}
              onChange={(e) => handleEndPointChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={50}>50 points</option>
              <option value={100}>100 points</option>
              <option value={150}>150 points</option>
              <option value={200}>200 points</option>
              <option value={250}>250 points</option>
              <option value={300}>300 points</option>
            </select>
            <span className="text-sm text-gray-500">
              First player to reach this score ends the game
            </span>
          </div>
        </div>
      )}

      {/* Ready/Start Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Ready Button */}
          <button
            onClick={handleReadyToggle}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${
                isReady
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700"
              }
            `}
          >
            {isReady ? "Ready ✓" : "Not Ready"}
          </button>

          {/* Start Game Button (Host Only) */}
          {currentPlayer.isHost && (
            <button
              onClick={onGameStart}
              disabled={!canStartGame}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-200
                ${
                  canStartGame
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Start Game
            </button>
          )}

          {/* Status Message */}
          <div className="text-center sm:text-right">
            {room.players.length < 4 && (
              <p className="text-orange-600">
                Waiting for more players... (Need 4 total)
              </p>
            )}
            {room.players.length === 4 && !canStartGame && (
              <p className="text-orange-600">
                Waiting for all players to be ready...
              </p>
            )}
            {canStartGame && (
              <p className="text-green-600">
                All players ready! Host can start the game.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          How to Play Hearts:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Share the room link with 3 friends to invite them</li>
          <li>• All 4 players must click &quot;Ready&quot; to start</li>
          <li>• The host can start the game when everyone is ready</li>
          <li>• Each round, pass 3 cards to another player</li>
          <li>
            • Avoid collecting hearts (1 point each) and Queen of Spades (13
            points)
          </li>
          <li>• Lowest score wins!</li>
        </ul>
      </div>
    </div>
  );
};

export default Lobby;
