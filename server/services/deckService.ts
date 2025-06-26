import { v4 as uuidv4 } from "uuid";
import { Card } from "../types/game";

// Create a standard 52-card deck
export function createDeck(): Card[] {
  const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks: Card["rank"][] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck: Card[] = [];

  suits.forEach((suit) => {
    ranks.forEach((rank, index) => {
      deck.push({
        id: uuidv4(),
        suit,
        rank,
        value: index + 2, // 2=2, J=11, Q=12, K=13, A=14
      });
    });
  });

  return deck;
}

// Shuffle deck
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal cards to players
export function dealCards(players: { hand: Card[] }[], deck: Card[]): void {
  const shuffledDeck = shuffleDeck(deck);

  players.forEach((player, index) => {
    player.hand = shuffledDeck.slice(index * 13, (index + 1) * 13);
    // Sort hand by suit and rank
    player.hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return a.value - b.value;
    });
  });
}
