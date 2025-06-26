"use client";

import React, { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { GameRoom, Player as PlayerType, Card as CardType } from "@/types/game";
import Player from "./Player";
import Card from "./Card";

interface PassingProps {
  room: GameRoom;
  currentPlayer: PlayerType;
}

const Passing: React.FC<PassingProps> = ({ room, currentPlayer }) => {
  const { socket } = useSocket();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

  const cardsToPass = 3;
  const passingDirection = room.roundNumber % 4;
  const directionText = ["left", "right", "across", "no pass"][
    passingDirection
  ];

  // Get player positions around the table
  const getPlayerPosition = (playerId: string) => {
    const currentPlayerIndex = room.players.findIndex(
      (p) => p.id === currentPlayer.id
    );
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    const relativePosition = (playerIndex - currentPlayerIndex + 4) % 4;

    switch (relativePosition) {
      case 0:
        return "bottom"; // Current player (bottom)
      case 1:
        return "right"; // Right player
      case 2:
        return "top"; // Top player
      case 3:
        return "left"; // Left player
      default:
        return "bottom";
    }
  };

  // Get the target player we're passing to
  const getTargetPlayer = () => {
    if (passingDirection === 3) return null; // "no pass" round

    const currentPlayerIndex = room.players.findIndex(
      (p) => p.id === currentPlayer.id
    );
    let targetIndex: number;

    switch (passingDirection) {
      case 0: // "left"
        targetIndex = (currentPlayerIndex + 1) % room.players.length;
        break;
      case 1: // "right"
        targetIndex =
          (currentPlayerIndex - 1 + room.players.length) % room.players.length;
        break;
      case 2: // "across"
        targetIndex = (currentPlayerIndex + 2) % room.players.length;
        break;
      default:
        return null;
    }

    return room.players[targetIndex];
  };

  const targetPlayer = getTargetPlayer();

  const handleCardClick = (card: CardType) => {
    if (selectedCards.find((c) => c.id === card.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else if (selectedCards.length < cardsToPass) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handlePassCards = () => {
    if (!socket || selectedCards.length !== cardsToPass) return;
    socket.emit(
      "passCards",
      selectedCards.map((c) => c.id)
    );
  };

  const handleClearSelection = () => {
    setSelectedCards([]);
  };

  const otherPlayers = room.players.filter((p) => p.id !== currentPlayer.id);

  // Get players by position for easier highlighting
  const topPlayer = otherPlayers.find((p) => getPlayerPosition(p.id) === "top");
  const rightPlayer = otherPlayers.find(
    (p) => getPlayerPosition(p.id) === "right"
  );
  const leftPlayer = otherPlayers.find(
    (p) => getPlayerPosition(p.id) === "left"
  );

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col overflow-hidden relative">
      {/* Single animated background element for better performance */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-glow"></div>
      </div>

      {/* Header */}
      <div className="glass border-b border-border/50 p-6 flex-shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Passing Phase</h1>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Room: {room.code}
            </div>
            <div className="text-sm text-muted-foreground">
              Pass {cardsToPass} cards {directionText}
            </div>
          </div>
        </div>
      </div>

      {/* Game Table - Main Content */}
      <div className="flex-1 relative max-w-6xl mx-auto w-full p-6 min-h-0">
        <div className="relative bg-gradient-to-br from-card to-muted rounded-full aspect-square max-w-xl mx-auto shadow-2xl border-4 border-border/50 relative overflow-hidden">
          {/* Table felt pattern */}
          <div className="absolute inset-0 bg-accent/5 rounded-full"></div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent rounded-full"></div>

          {/* Center - Passing Info */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="glass rounded-xl p-6 shadow-lg min-w-40 text-center border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Passing
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {directionText}
              </p>
              {targetPlayer && (
                <div className="bg-accent/20 rounded-lg p-3 mb-3 border border-accent/30">
                  <p className="text-xs text-accent font-semibold">
                    Passing to:
                  </p>
                  <p className="text-sm text-accent font-medium">
                    {targetPlayer.name}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {selectedCards.length}/{cardsToPass}
              </p>
            </div>
          </div>

          {/* Top Player */}
          {topPlayer && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div
                className={`glass rounded-xl p-3 shadow-lg border border-border/50 ${
                  targetPlayer?.id === topPlayer.id
                    ? "ring-4 ring-accent/50"
                    : ""
                }`}
              >
                <Player player={topPlayer} compact={true} />
              </div>
            </div>
          )}

          {/* Right Player */}
          {rightPlayer && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <div
                className={`glass rounded-xl p-3 shadow-lg border border-border/50 ${
                  targetPlayer?.id === rightPlayer.id
                    ? "ring-4 ring-accent/50"
                    : ""
                }`}
              >
                <Player player={rightPlayer} compact={true} />
              </div>
            </div>
          )}

          {/* Left Player */}
          {leftPlayer && (
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <div
                className={`glass rounded-xl p-3 shadow-lg border border-border/50 ${
                  targetPlayer?.id === leftPlayer.id
                    ? "ring-4 ring-accent/50"
                    : ""
                }`}
              >
                <Player player={leftPlayer} compact={true} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Player Area - Bottom */}
      <div className="flex-shrink-0 glass border-t border-border/50 p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Current Player Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <Player
                player={currentPlayer}
                isCurrentPlayer={true}
                compact={true}
              />
            </div>

            {/* Passing Status */}
            <div className="text-center">
              {targetPlayer ? (
                <p className="text-accent font-semibold text-lg">
                  Passing {cardsToPass} cards to {targetPlayer.name}
                </p>
              ) : (
                <p className="text-muted-foreground text-lg">
                  No passing this round
                </p>
              )}
            </div>
          </div>

          {/* Hand */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {currentPlayer.hand.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  card={card}
                  onClick={() => handleCardClick(card)}
                  selected={
                    selectedCards.find((c) => c.id === card.id) !== undefined
                  }
                  className="w-24 h-32"
                />
                {/* Selection indicator */}
                {selectedCards.find((c) => c.id === card.id) && (
                  <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-6">
            <button
              onClick={handleClearSelection}
              className="px-6 py-3 glass hover:bg-white/10 text-foreground rounded-xl font-semibold transition-all duration-200 focus-ring border border-border/50"
            >
              Clear Selection
            </button>
            <button
              onClick={handlePassCards}
              disabled={selectedCards.length !== cardsToPass}
              className="px-8 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-accent-foreground rounded-xl font-semibold transition-all duration-200 focus-ring"
            >
              Pass Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passing;
