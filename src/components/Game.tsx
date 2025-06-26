"use client";

import React, { useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { GameRoom, Player as PlayerType, Card as CardType } from "@/types/game";
import Player from "./Player";
import Card from "./Card";

interface GameProps {
  room: GameRoom;
  currentPlayer: PlayerType;
}

const Game: React.FC<GameProps> = ({ room, currentPlayer }) => {
  const { socket } = useSocket();
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const isMyTurn = room.players[room.currentTurn]?.id === currentPlayer.id;
  const otherPlayers = room.players.filter((p) => p.id !== currentPlayer.id);

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

  // Debug logging
  console.log("Game component - room:", room);
  console.log("Game component - currentPlayer:", currentPlayer);
  console.log("Game component - currentPlayer hand:", currentPlayer.hand);
  console.log("Game component - isMyTurn:", isMyTurn);
  console.log("Game component - currentTurn:", room.currentTurn);
  console.log("Game component - currentTrick:", room.currentTrick);
  console.log("Game component - ledSuit:", room.ledSuit);

  const handleCardClick = (card: CardType) => {
    console.log("Card clicked:", card);
    console.log("Is my turn:", isMyTurn);
    console.log("Can play card:", canPlayCard(card));

    if (!isMyTurn) {
      console.log("Not my turn, ignoring click");
      return;
    }
    setSelectedCard(card);
  };

  const handlePlayCard = (card: CardType) => {
    if (!socket) return;
    console.log("Playing card:", card);
    socket.emit("playCard", card.id);
    setSelectedCard(null);
  };

  const canPlayCard = (card: CardType) => {
    if (!isMyTurn) {
      console.log("Not my turn, can't play");
      return false;
    }

    console.log("Card validation:", {
      card,
      isFirstTrickOfRound: room.firstTrickOfRound,
      ledSuit: room.ledSuit,
      currentTrickLength: room.currentTrick.length,
    });

    // If it's the first trick, 2 of Clubs must be played first
    if (room.firstTrickOfRound && room.ledSuit === null) {
      const canPlay = card.suit === "clubs" && card.rank === "2";
      console.log("First trick, 2 of clubs check:", canPlay);
      return canPlay;
    }

    // If it's the first trick and a suit has been led, can't play hearts or Queen of Spades unless that's all you have
    if (room.firstTrickOfRound && room.ledSuit !== null) {
      const hasOnlyHeartsOrQueenSpades = currentPlayer.hand.every(
        (c) => c.suit === "hearts" || (c.suit === "spades" && c.rank === "Q")
      );
      if (
        !hasOnlyHeartsOrQueenSpades &&
        (card.suit === "hearts" ||
          (card.suit === "spades" && card.rank === "Q"))
      ) {
        console.log("First trick, can't play hearts or Q♠");
        return false;
      }
    }

    // If a suit was led, must follow suit if possible
    if (room.ledSuit && card.suit !== room.ledSuit) {
      const hasLedSuit = currentPlayer.hand.some(
        (c) => c.suit === room.ledSuit
      );
      if (hasLedSuit) {
        console.log("Must follow suit, can't play this card");
        return false;
      }
    }

    // Can't lead hearts until hearts have been broken (unless that's all you have)
    if (room.ledSuit === null && card.suit === "hearts") {
      const hasNonHearts = currentPlayer.hand.some((c) => c.suit !== "hearts");
      if (hasNonHearts) {
        console.log("Can't lead hearts yet");
        return false;
      }
    }

    console.log("Card is valid to play");
    return true;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-800 to-green-900 flex flex-col overflow-hidden">
      {/* Game Header */}
      <div className="bg-white shadow-lg p-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Hearts - Round {room.roundNumber + 1}
          </h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Room: {room.code}</div>
            <div className="text-sm text-gray-600">
              Turn: {room.players[room.currentTurn]?.name || "Unknown"}
            </div>
            <div className="text-sm text-green-600 font-medium">
              End Point: {room.endPoint}
            </div>
          </div>
        </div>
      </div>

      {/* Game Table - Main Content */}
      <div className="flex-1 relative max-w-6xl mx-auto w-full p-4 min-h-0">
        <div className="relative bg-green-700 rounded-full aspect-square max-w-xl mx-auto shadow-2xl border-8 border-green-600">
          {/* Table felt pattern */}
          <div className="absolute inset-0 bg-green-600 rounded-full opacity-20"></div>

          {/* Center - Current Trick */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-lg p-3 shadow-lg min-w-36 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Current Trick
              </h3>
              {room.currentTrick.length === 0 ? (
                <p className="text-gray-500 text-sm">No cards played yet</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {room.currentTrick.map((card, index) => {
                      // Calculate the correct player index for this card
                      const trickStartIndex =
                        (room.currentTurn -
                          room.currentTrick.length +
                          room.players.length) %
                        room.players.length;
                      const playerIndex =
                        (trickStartIndex + index) % room.players.length;
                      const playerName =
                        room.players[playerIndex]?.name || "Unknown";

                      return (
                        <div key={index} className="relative">
                          <Card card={card} className="w-10 h-14" />
                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                            <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                              {playerName}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {room.ledSuit && (
                    <p className="text-xs text-gray-600">
                      Led:{" "}
                      {room.ledSuit === "hearts"
                        ? "♥"
                        : room.ledSuit === "diamonds"
                        ? "♦"
                        : room.ledSuit === "clubs"
                        ? "♣"
                        : "♠"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "top") && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <Player
                  player={
                    otherPlayers.find((p) => getPlayerPosition(p.id) === "top")!
                  }
                  isCurrentTurn={
                    room.players[room.currentTurn]?.id ===
                    otherPlayers.find((p) => getPlayerPosition(p.id) === "top")
                      ?.id
                  }
                  compact={true}
                />
              </div>
            </div>
          )}

          {/* Right Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "right") && (
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <Player
                  player={
                    otherPlayers.find(
                      (p) => getPlayerPosition(p.id) === "right"
                    )!
                  }
                  isCurrentTurn={
                    room.players[room.currentTurn]?.id ===
                    otherPlayers.find(
                      (p) => getPlayerPosition(p.id) === "right"
                    )?.id
                  }
                  compact={true}
                />
              </div>
            </div>
          )}

          {/* Left Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "left") && (
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <Player
                  player={
                    otherPlayers.find(
                      (p) => getPlayerPosition(p.id) === "left"
                    )!
                  }
                  isCurrentTurn={
                    room.players[room.currentTurn]?.id ===
                    otherPlayers.find((p) => getPlayerPosition(p.id) === "left")
                      ?.id
                  }
                  compact={true}
                />
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
                isCurrentTurn={isMyTurn}
                isCurrentPlayer={true}
                compact={true}
              />
            </div>

            {/* Turn Status */}
            <div className="text-center">
              {isMyTurn ? (
                <p className="text-green-600 font-semibold">
                  Your turn! Select a card to play.
                </p>
              ) : (
                <p className="text-orange-600">
                  Waiting for {room.players[room.currentTurn]?.name} to play...
                </p>
              )}
            </div>
          </div>

          {/* Hand */}
          <div className="flex flex-wrap gap-2 justify-center">
            {currentPlayer.hand.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  card={card}
                  onClick={() => handleCardClick(card)}
                  disabled={!canPlayCard(card)}
                  selected={selectedCard?.id === card.id}
                  className="w-20 h-28"
                />
                {/* Play Button on Selected Card */}
                {selectedCard?.id === card.id && canPlayCard(card) && (
                  <button
                    onClick={() => handlePlayCard(card)}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg transition-colors"
                  >
                    Play
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
