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
      ? "text-red-600"
      : "text-black";
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
        relative w-20 h-28 rounded-lg border-2 shadow-lg cursor-pointer
        transform transition-all duration-200 hover:scale-105
        bg-white border-gray-300
        ${selected ? "ring-4 ring-blue-400 ring-opacity-50" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {/* Top left corner */}
      <div className="absolute top-1 left-1 text-xs font-bold">
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
      <div className="absolute bottom-1 right-1 text-xs font-bold transform rotate-180">
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
          <div className="bg-yellow-400 text-black text-xs px-1 py-0.5 rounded font-bold">
            Q♠
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
