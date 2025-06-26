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
    <div className="h-screen bg-gradient-to-br from-green-800 to-green-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-lg p-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Passing Phase</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Room: {room.code}</div>
            <div className="text-sm text-gray-600">
              Pass {cardsToPass} cards {directionText}
            </div>
          </div>
        </div>
      </div>

      {/* Game Table - Main Content */}
      <div className="flex-1 relative max-w-6xl mx-auto w-full p-4 min-h-0">
        <div className="relative bg-green-700 rounded-full aspect-square max-w-xl mx-auto shadow-2xl border-8 border-green-600">
          {/* Table felt pattern */}
          <div className="absolute inset-0 bg-green-600 rounded-full opacity-20"></div>

          {/* Center - Passing Info */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg p-3 shadow-lg min-w-36 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Passing
              </h3>
              <p className="text-sm text-gray-600 mb-1">{directionText}</p>
              {targetPlayer && (
                <div className="bg-blue-100 rounded p-2 mb-1">
                  <p className="text-xs text-blue-800 font-semibold">
                    Passing to:
                  </p>
                  <p className="text-sm text-blue-900">{targetPlayer.name}</p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {selectedCards.length}/{cardsToPass}
              </p>
            </div>
          </div>

          {/* Top Player */}
          {topPlayer && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div
                className={`bg-white rounded-lg p-2 shadow-lg ${
                  targetPlayer?.id === topPlayer.id
                    ? "ring-4 ring-blue-400"
                    : ""
                }`}
              >
                <Player player={topPlayer} compact={true} />
              </div>
            </div>
          )}

          {/* Right Player */}
          {rightPlayer && (
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
              <div
                className={`bg-white rounded-lg p-2 shadow-lg ${
                  targetPlayer?.id === rightPlayer.id
                    ? "ring-4 ring-blue-400"
                    : ""
                }`}
              >
                <Player player={rightPlayer} compact={true} />
              </div>
            </div>
          )}

          {/* Left Player */}
          {leftPlayer && (
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
              <div
                className={`bg-white rounded-lg p-2 shadow-lg ${
                  targetPlayer?.id === leftPlayer.id
                    ? "ring-4 ring-blue-400"
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
      <div className="flex-shrink-0 bg-white shadow-lg p-4">
        <div className="max-w-6xl mx-auto">
          {/* Current Player Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Player
                player={currentPlayer}
                isCurrentPlayer={true}
                compact={true}
              />
            </div>

            {/* Passing Status */}
            <div className="text-center">
              {targetPlayer ? (
                <p className="text-blue-600 font-semibold">
                  Passing {cardsToPass} cards to {targetPlayer.name}
                </p>
              ) : (
                <p className="text-gray-600">No passing this round</p>
              )}
            </div>
          </div>

          {/* Hand */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {currentPlayer.hand.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  card={card}
                  onClick={() => handleCardClick(card)}
                  selected={
                    selectedCards.find((c) => c.id === card.id) !== undefined
                  }
                  className="w-20 h-28"
                />
                {/* Selection indicator */}
                {selectedCards.find((c) => c.id === card.id) && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={handlePassCards}
              disabled={selectedCards.length !== cardsToPass}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
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
