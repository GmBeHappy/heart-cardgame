"use client";

import React from "react";
import { Player as PlayerType } from "@/types/game";

interface PlayerProps {
  player: PlayerType;
  isCurrentTurn?: boolean;
  isCurrentPlayer?: boolean;
  className?: string;
  compact?: boolean;
  hideHeader?: boolean;
}

const Player: React.FC<PlayerProps> = ({
  player,
  isCurrentTurn = false,
  isCurrentPlayer = false,
  className = "",
  compact = false,
  hideHeader = false,
}) => {
  if (compact) {
    return (
      <div
        className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${
          isCurrentTurn
            ? "border-accent bg-accent/10 shadow-lg glow"
            : "border-border glass"
        }
        ${isCurrentPlayer ? "ring-2 ring-accent/50" : ""}
        ${className}
      `}
      >
        {/* Player Name - Always Visible */}
        <div className="flex items-center space-x-2 mb-3">
          <h3 className="font-bold text-foreground text-sm">{player.name}</h3>
          {player.isHost && (
            <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full font-medium">
              Host
            </span>
          )}
          {isCurrentPlayer && (
            <span className="px-2 py-1 text-xs bg-yellow-500 text-yellow-900 rounded-full font-medium font-bold">
              ME
            </span>
          )}
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Score */}
          <div className="flex items-center space-x-2">
            <span className="text-destructive">🎯</span>
            <span className="font-semibold text-destructive">
              {player.score}
            </span>
          </div>

          {/* Cards in Hand */}
          <div className="flex items-center space-x-2">
            <span className="text-accent">🃏</span>
            <span className="font-semibold text-accent">
              {player.hand.length}
            </span>
          </div>
        </div>

        {/* Turn Indicator */}
        {isCurrentTurn && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-accent-foreground text-xs font-bold">⚡</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
      relative p-6 rounded-xl border transition-all duration-200
      ${
        isCurrentTurn
          ? "border-accent bg-accent/10 shadow-lg glow"
          : "border-border glass"
      }
      ${isCurrentPlayer ? "ring-2 ring-accent/50" : ""}
      ${className}
    `}
    >
      {/* Player Name - Always Visible */}
      <div className="flex items-center space-x-3 mb-4">
        <h3 className="font-bold text-foreground text-lg">{player.name}</h3>
        {player.isHost && (
          <span className="px-3 py-1 text-xs bg-accent/20 text-accent rounded-full font-medium">
            Host
          </span>
        )}
        {isCurrentPlayer && (
          <span className="px-3 py-1 text-xs bg-yellow-500 text-yellow-900 rounded-full font-medium font-bold">
            ME
          </span>
        )}
      </div>

      {/* Player Header - Conditional */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4">
          {/* Ready Status */}
          <div className="flex items-center space-x-3">
            {player.isReady ? (
              <span className="px-3 py-1 text-xs bg-accent/20 text-accent rounded-full font-medium">
                Ready
              </span>
            ) : (
              <span className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full font-medium">
                Not Ready
              </span>
            )}
          </div>
        </div>
      )}

      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Score */}
        <div className="flex items-center space-x-3">
          <span className="text-destructive text-xl">🎯</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-muted-foreground">
              Score
            </div>
            <div className="text-xl font-bold text-destructive">
              {player.score}
            </div>
          </div>
        </div>

        {/* Cards in Hand */}
        <div className="flex items-center space-x-3">
          <span className="text-accent text-xl">🃏</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-muted-foreground">
              Cards
            </div>
            <div className="text-xl font-bold text-accent">
              {player.hand.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tricks Won */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-foreground mb-2">
          Tricks Won: {player.tricks.length}
        </div>
        {player.tricks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {player.tricks.slice(-3).map((trick, index) => (
              <div
                key={index}
                className="text-xs bg-muted px-3 py-1 rounded-lg text-muted-foreground"
              >
                {trick.length} cards
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Passed Cards */}
      {player.passedCards.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-foreground mb-2">
            Passing: {player.passedCards.length} cards
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {isCurrentTurn && (
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
          <span className="text-accent-foreground text-sm font-bold">⚡</span>
        </div>
      )}
    </div>
  );
};

export default Player;
