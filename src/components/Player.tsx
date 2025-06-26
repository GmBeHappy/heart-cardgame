"use client";

import React from "react";
import { Player as PlayerType } from "@/types/game";

interface PlayerProps {
  player: PlayerType;
  isCurrentTurn?: boolean;
  isCurrentPlayer?: boolean;
  className?: string;
  compact?: boolean;
}

const Player: React.FC<PlayerProps> = ({
  player,
  isCurrentTurn = false,
  isCurrentPlayer = false,
  className = "",
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`
        relative p-2 rounded-lg border-2 transition-all duration-200
        ${
          isCurrentTurn
            ? "border-yellow-400 bg-yellow-50 shadow-lg"
            : "border-gray-300 bg-white"
        }
        ${isCurrentPlayer ? "ring-2 ring-blue-400" : ""}
        ${className}
      `}
      >
        {/* Player Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <h3 className="font-bold text-gray-800 text-sm">{player.name}</h3>
            {player.isHost && (
              <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                Host
              </span>
            )}
          </div>

          {/* Ready Status */}
          <div className="flex items-center space-x-1">
            {player.isReady ? (
              <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                Ready
              </span>
            ) : (
              <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                Not Ready
              </span>
            )}
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Score */}
          <div className="flex items-center space-x-1">
            <span className="text-red-600">🎯</span>
            <span className="font-semibold text-red-600">{player.score}</span>
          </div>

          {/* Cards in Hand */}
          <div className="flex items-center space-x-1">
            <span className="text-blue-600">🃏</span>
            <span className="font-semibold text-blue-600">
              {player.hand.length}
            </span>
          </div>
        </div>

        {/* Turn Indicator */}
        {isCurrentTurn && (
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">⚡</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
      relative p-4 rounded-lg border-2 transition-all duration-200
      ${
        isCurrentTurn
          ? "border-yellow-400 bg-yellow-50 shadow-lg"
          : "border-gray-300 bg-white"
      }
      ${isCurrentPlayer ? "ring-2 ring-blue-400" : ""}
      ${className}
    `}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-gray-800">{player.name}</h3>
          {player.isHost && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Host
            </span>
          )}
        </div>

        {/* Ready Status */}
        <div className="flex items-center space-x-2">
          {player.isReady ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Ready
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              Not Ready
            </span>
          )}
        </div>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        {/* Score */}
        <div className="flex items-center space-x-2">
          <span className="text-red-600 text-lg">🎯</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700">Score</div>
            <div className="text-lg font-bold text-red-600">{player.score}</div>
          </div>
        </div>

        {/* Cards in Hand */}
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-lg">🃏</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700">Cards</div>
            <div className="text-lg font-bold text-blue-600">
              {player.hand.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tricks Won */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-700 mb-1">
          Tricks Won: {player.tricks.length}
        </div>
        {player.tricks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {player.tricks.slice(-3).map((trick, index) => (
              <div
                key={index}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {trick.length} cards
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Passed Cards */}
      {player.passedCards.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            Passing: {player.passedCards.length} cards
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {isCurrentTurn && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">⚡</span>
        </div>
      )}
    </div>
  );
};

export default Player;
