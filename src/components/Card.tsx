"use client";

import React from "react";
import { Card as CardType } from "@/types/game";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  disabled = false,
  selected = false,
  className = "",
}) => {
  // Get suit color
  const getSuitColor = (suit: string) => {
    return suit === "hearts" || suit === "diamonds"
      ? "text-destructive"
      : "text-foreground";
  };

  // Get suit symbol
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  // Get rank display
  const getRankDisplay = (rank: string) => {
    return rank;
  };

  return (
    <div
      className={`
        relative w-20 h-28 rounded-xl border shadow-lg cursor-pointer
        transform transition-all duration-200 hover:scale-105
        glass border-border/50
        ${selected ? "ring-4 ring-accent/50" : ""}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-xl hover:border-accent/30"
        }
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {/* Top left corner */}
      <div className="absolute top-2 left-2 text-xs font-bold">
        <div className={getSuitColor(card.suit)}>
          {getRankDisplay(card.rank)}
        </div>
        <div className={getSuitColor(card.suit)}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-3xl ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className="absolute bottom-2 right-2 text-xs font-bold transform rotate-180">
        <div className={getSuitColor(card.suit)}>
          {getRankDisplay(card.rank)}
        </div>
        <div className={getSuitColor(card.suit)}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>

      {/* Special indicator for Queen of Spades */}
      {card.suit === "spades" && card.rank === "Q" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full font-bold border border-accent/30">
            Q♠
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
