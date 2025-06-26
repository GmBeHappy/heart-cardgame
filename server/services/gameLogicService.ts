import { Card, PassDirection } from "../types/game";

// Get pass direction for each round
export function getPassDirection(roundNumber: number): PassDirection {
  const directions: PassDirection[] = ["left", "right", "across", "none"];
  return directions[roundNumber % 4];
}

// Check if a card is valid to play
export function isValidPlay(
  card: Card,
  hand: Card[],
  ledSuit: string | null,
  isFirstTrickOfRound: boolean
): boolean {
  console.log(`Validating card:`, card);
  console.log(
    `Is first trick of round: ${isFirstTrickOfRound}, Led suit: ${ledSuit}`
  );

  // If it's the first trick, 2 of Clubs must be played first
  if (isFirstTrickOfRound && ledSuit === null) {
    const canPlay = card.suit === "clubs" && card.rank === "2";
    console.log(`First trick, 2 of clubs check: ${canPlay}`);
    return canPlay;
  }

  // If it's the first trick and a suit has been led, can't play hearts or Queen of Spades unless that's all you have
  if (isFirstTrickOfRound && ledSuit !== null) {
    const hasOnlyHeartsOrQueenSpades = hand.every(
      (c) => c.suit === "hearts" || (c.suit === "spades" && c.rank === "Q")
    );
    if (
      !hasOnlyHeartsOrQueenSpades &&
      (card.suit === "hearts" || (card.suit === "spades" && card.rank === "Q"))
    ) {
      console.log(`First trick, can't play hearts or Q♠`);
      return false;
    }
  }

  // If a suit was led, must follow suit if possible
  if (ledSuit && card.suit !== ledSuit) {
    const hasLedSuit = hand.some((c) => c.suit === ledSuit);
    if (hasLedSuit) {
      console.log(`Must follow suit ${ledSuit}, can't play ${card.suit}`);
      return false;
    }
  }

  // Can't lead hearts until hearts have been broken (unless that's all you have)
  if (ledSuit === null && card.suit === "hearts") {
    const hasNonHearts = hand.some((c) => c.suit !== "hearts");
    if (hasNonHearts) {
      console.log(`Can't lead hearts yet`);
      return false;
    }
  }

  console.log(`Card is valid to play`);
  return true;
}

// Calculate points for a trick
export function calculateTrickPoints(trick: Card[]): number {
  console.log("Calculating points for trick:", trick);

  const points = trick.reduce((total, card) => {
    let cardPoints = 0;
    if (card.suit === "hearts") {
      cardPoints = 1;
      console.log(`Heart card ${card.rank}♥: +1 point`);
    } else if (card.suit === "spades" && card.rank === "Q") {
      cardPoints = 13;
      console.log(`Queen of Spades Q♠: +13 points`);
    } else {
      console.log(
        `Card ${card.rank}${
          card.suit === "diamonds" ? "♦" : card.suit === "clubs" ? "♣" : "♠"
        }: +0 points`
      );
    }
    return total + cardPoints;
  }, 0);

  console.log(`Total trick points: ${points}`);
  return points;
}

// Exchange cards between players
export function exchangeCards(
  players: { passedCards: Card[]; hand: Card[] }[],
  direction: PassDirection
): void {
  // Exchange cards based on direction
  for (let i = 0; i < players.length; i++) {
    let targetIndex: number;
    switch (direction) {
      case "left":
        targetIndex = (i + 1) % players.length;
        break;
      case "right":
        targetIndex = (i - 1 + players.length) % players.length;
        break;
      case "across":
        targetIndex = (i + 2) % players.length;
        break;
      case "none":
        targetIndex = i; // No passing
        break;
    }

    if (direction !== "none") {
      const passedCards = players[i].passedCards;
      players[targetIndex].hand.push(...passedCards);
      players[i].passedCards = [];
    }
  }

  // Sort hands
  players.forEach((player) => {
    player.hand.sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return a.value - b.value;
    });
  });
}

// Find the player who has 2 of Clubs
export function findTwoOfClubsPlayer(players: { hand: Card[] }[]): number {
  return players.findIndex((player) =>
    player.hand.some((card) => card.suit === "clubs" && card.rank === "2")
  );
}

// Check if all players have passed cards
export function allPlayersPassed(players: { passedCards: Card[] }[]): boolean {
  return players.every((p) => p.passedCards.length === 3);
}

// Check if round is over (all cards played)
export function isRoundOver(players: { hand: Card[] }[]): boolean {
  return players.every((p) => p.hand.length === 0);
}

// Check for shooting the moon
export function checkShootingTheMoon(
  players: { id: string; tricks: Card[][] }[]
): { shootingTheMoonPlayer: { id: string } | null; totalPoints: number } {
  for (const player of players) {
    let totalPoints = 0;
    for (const trick of player.tricks) {
      totalPoints += calculateTrickPoints(trick);
    }
    if (totalPoints === 26) {
      return { shootingTheMoonPlayer: player, totalPoints };
    }
  }
  return { shootingTheMoonPlayer: null, totalPoints: 0 };
}

// Check if game is over (someone has reached the end point)
export function isGameOver(
  players: { score: number }[],
  endPoint: number
): boolean {
  return players.some((p) => p.score >= endPoint);
}

// Find the winner (player with lowest score)
export function findWinner(
  players: { id: string; name: string; score: number }[]
): {
  id: string;
  name: string;
  score: number;
} {
  return players.reduce((lowest, current) =>
    current.score < lowest.score ? current : lowest
  );
}
