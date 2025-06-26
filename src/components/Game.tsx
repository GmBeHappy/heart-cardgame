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
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col min-h-0 overflow-hidden relative">
      {/* Game Info in Top Left */}
      <div className="absolute top-4 left-8 z-20 glass rounded-lg px-4 py-2 border border-border/50 text-sm text-foreground font-semibold shadow-lg">
        <div>Round {room.roundNumber + 1}</div>
        <div>End Point: {room.endPoint}</div>
      </div>

      {/* Scoreboard - Under Game Info */}
      <div className="absolute top-24 left-8 z-20 glass rounded-lg px-4 py-3 border border-border/50 shadow-lg min-w-[140px]">
        <div className="text-sm font-semibold text-foreground mb-2 text-center border-b border-border/30 pb-1">
          Scores
        </div>
        <div className="space-y-1">
          {room.players
            .sort((a, b) => b.score - a.score) // Sort by score (highest first)
            .map((player) => {
              const lowestScore = Math.min(...room.players.map((p) => p.score));
              const isLowestScore = player.score === lowestScore;
              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center text-xs ${
                    player.id === currentPlayer.id
                      ? "text-accent font-semibold"
                      : "text-foreground"
                  }`}
                >
                  <span
                    className="truncate max-w-[80px] flex items-center gap-1"
                    title={player.name}
                  >
                    {player.id === currentPlayer.id ? "You" : player.name}
                    {isLowestScore && (
                      <span
                        className="text-yellow-500"
                        title="Lowest score - Best player!"
                      >
                        👑
                      </span>
                    )}
                  </span>
                  <span className="ml-2 font-mono">{player.score}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Room Code in Top Right */}
      <div className="absolute top-4 right-8 z-20 bg-accent/20 rounded-lg px-4 py-2 border border-accent/30 text-sm text-accent font-semibold shadow-lg">
        Room: {room.code}
      </div>

      {/* Single animated background element for better performance */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pulse-glow"></div>
      </div>

      {/* Game Table - Main Content */}
      <div className="flex-1 relative max-w-8xl mx-auto w-full p-6 pb-0 flex items-center justify-center min-h-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-card to-muted rounded-3xl aspect-[4/3] w-full max-w-5xl max-h-[65vh] mx-auto shadow-2xl border-4 border-border/50 overflow-hidden">
          {/* Table felt pattern */}
          <div className="absolute inset-0 bg-accent/5 rounded-3xl"></div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent rounded-3xl"></div>

          {/* Top Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "top") && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="glass rounded-xl p-3 shadow-lg border border-border/50">
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

              {/* Top Player's Trick Card */}
              {(() => {
                const topPlayer = otherPlayers.find(
                  (p) => getPlayerPosition(p.id) === "top"
                );
                if (!topPlayer) return null;

                const trickStartIndex =
                  (room.currentTurn -
                    room.currentTrick.length +
                    room.players.length) %
                  room.players.length;
                const playerIndex = room.players.findIndex(
                  (p) => p.id === topPlayer.id
                );
                const cardIndex =
                  (playerIndex - trickStartIndex + room.players.length) %
                  room.players.length;
                const playedCard = room.currentTrick[cardIndex];

                return playedCard ? (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                    <Card card={playedCard} className="w-12 h-16" />
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Right Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "right") && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <div className="glass rounded-xl p-3 shadow-lg border border-border/50">
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

              {/* Right Player's Trick Card */}
              {(() => {
                const rightPlayer = otherPlayers.find(
                  (p) => getPlayerPosition(p.id) === "right"
                );
                if (!rightPlayer) return null;

                const trickStartIndex =
                  (room.currentTurn -
                    room.currentTrick.length +
                    room.players.length) %
                  room.players.length;
                const playerIndex = room.players.findIndex(
                  (p) => p.id === rightPlayer.id
                );
                const cardIndex =
                  (playerIndex - trickStartIndex + room.players.length) %
                  room.players.length;
                const playedCard = room.currentTrick[cardIndex];

                return playedCard ? (
                  <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2">
                    <Card card={playedCard} className="w-12 h-16" />
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Left Player */}
          {otherPlayers.find((p) => getPlayerPosition(p.id) === "left") && (
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <div className="glass rounded-xl p-3 shadow-lg border border-border/50">
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

              {/* Left Player's Trick Card */}
              {(() => {
                const leftPlayer = otherPlayers.find(
                  (p) => getPlayerPosition(p.id) === "left"
                );
                if (!leftPlayer) return null;

                const trickStartIndex =
                  (room.currentTurn -
                    room.currentTrick.length +
                    room.players.length) %
                  room.players.length;
                const playerIndex = room.players.findIndex(
                  (p) => p.id === leftPlayer.id
                );
                const cardIndex =
                  (playerIndex - trickStartIndex + room.players.length) %
                  room.players.length;
                const playedCard = room.currentTrick[cardIndex];

                return playedCard ? (
                  <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2">
                    <Card card={playedCard} className="w-12 h-16" />
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Bottom (Current) Player */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="glass rounded-xl p-3 shadow-lg border border-border/50">
              <Player
                player={currentPlayer}
                isCurrentTurn={isMyTurn}
                isCurrentPlayer={true}
                compact={true}
              />
            </div>

            {/* Current Player's Trick Card */}
            {(() => {
              const trickStartIndex =
                (room.currentTurn -
                  room.currentTrick.length +
                  room.players.length) %
                room.players.length;
              const playerIndex = room.players.findIndex(
                (p) => p.id === currentPlayer.id
              );
              const cardIndex =
                (playerIndex - trickStartIndex + room.players.length) %
                room.players.length;
              const playedCard = room.currentTrick[cardIndex];

              return playedCard ? (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                  <Card card={playedCard} className="w-12 h-16" />
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* Current Player Area - Bottom */}
      <div className="flex-shrink-0 glass border-t border-border/50 p-6 pt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Turn Status */}
          <div className="text-center mb-6">
            {isMyTurn ? (
              <p className="text-accent font-semibold text-lg">
                Your turn! Select a card to play.
              </p>
            ) : (
              <p className="text-muted-foreground text-lg">
                Waiting for {room.players[room.currentTurn]?.name} to play...
              </p>
            )}
          </div>

          {/* Hand */}
          <div className="flex gap-2 justify-center overflow-x-auto overflow-y-visible scrollbar-hide px-2 py-2 mb-4 min-h-0">
            {currentPlayer.hand.map((card) => (
              <div key={card.id} className="relative flex-shrink-0">
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
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground text-sm px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 focus-ring"
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
