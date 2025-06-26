import { GameRoom, Card } from "../types/game";
import { RoomModel } from "../models/roomModel";
import { dealCards, createDeck } from "../services/deckService";
import {
  getPassDirection,
  exchangeCards,
  findTwoOfClubsPlayer,
  allPlayersPassed,
  isValidPlay,
  calculateTrickPoints,
  isRoundOver,
  checkShootingTheMoon,
  isGameOver,
} from "../services/gameLogicService";

export class GameController {
  // Start the game
  static startGame(roomId: string): GameRoom | null {
    const room = RoomModel.getRoomById(roomId);
    if (!room) return null;

    room.gameState = "passing";
    room.currentTurn = 0;
    room.roundNumber = 0;
    room.passDirection = getPassDirection(room.roundNumber);
    room.firstTrickOfRound = true;

    // Reset player states
    room.players.forEach((player) => {
      player.hand = [];
      player.tricks = [];
      player.passedCards = [];
    });

    // Deal cards
    dealCards(room.players, room.deck);

    // Find 2 of clubs to determine who starts
    const twoOfClubsIndex = findTwoOfClubsPlayer(room.players);
    room.currentTurn = twoOfClubsIndex;

    console.log(`Hearts game started in room ${room.code}`);
    return room;
  }

  // Handle card passing
  static passCards(
    roomId: string,
    playerId: string,
    cardIds: string[]
  ): { success: boolean; message?: string } {
    const room = RoomModel.getRoomById(roomId);
    if (!room || room.gameState !== "passing") {
      return { success: false, message: "Game not in passing state" };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    // Validate that exactly 3 cards are selected
    if (cardIds.length !== 3) {
      return { success: false, message: "Must select exactly 3 cards to pass" };
    }

    // Remove selected cards from hand and add to passed cards
    const selectedCards: Card[] = [];
    cardIds.forEach((cardId) => {
      const cardIndex = player.hand.findIndex((card) => card.id === cardId);
      if (cardIndex !== -1) {
        selectedCards.push(player.hand.splice(cardIndex, 1)[0]);
      }
    });

    player.passedCards = selectedCards;

    // Check if all players have passed cards
    if (allPlayersPassed(room.players)) {
      this.exchangeCards(roomId);
    }

    return { success: true };
  }

  // Exchange cards between players
  private static exchangeCards(roomId: string): void {
    const room = RoomModel.getRoomById(roomId);
    if (!room) return;

    exchangeCards(room.players, room.passDirection);

    // Find the player who now has 2 of Clubs after the exchange
    const newTwoClubsIndex = findTwoOfClubsPlayer(room.players);
    room.currentTurn = newTwoClubsIndex;

    room.gameState = "playing";
    room.firstTrickOfRound = true;
  }

  // Play a card
  static playCard(
    roomId: string,
    playerId: string,
    cardId: string
  ): { success: boolean; message?: string; card?: Card } {
    const room = RoomModel.getRoomById(roomId);
    if (!room || room.gameState !== "playing") {
      return { success: false, message: "Game not in playing state" };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) {
      return { success: false, message: "Card not found in hand" };
    }

    const card = player.hand[cardIndex];

    // Validate the play
    if (!isValidPlay(card, player.hand, room.ledSuit, room.firstTrickOfRound)) {
      return { success: false, message: "Invalid card play" };
    }

    // Remove card from hand and add to current trick
    player.hand.splice(cardIndex, 1);
    room.currentTrick.push(card);

    // Set led suit if this is the first card of the trick
    if (room.currentTrick.length === 1) {
      room.ledSuit = card.suit;
    }

    // Move to next player
    room.currentTurn = (room.currentTurn + 1) % room.players.length;

    // Check if trick is complete
    if (room.currentTrick.length === 4) {
      this.completeTrick(roomId);
    }

    return { success: true, card };
  }

  // Complete a trick
  private static completeTrick(roomId: string): void {
    const room = RoomModel.getRoomById(roomId);
    if (!room) return;

    // Find the winning card
    let winningIndex = 0;
    let highestValue = room.currentTrick[0].value;

    for (let i = 1; i < room.currentTrick.length; i++) {
      const card = room.currentTrick[i];
      if (card.suit === room.ledSuit && card.value > highestValue) {
        highestValue = card.value;
        winningIndex = i;
      }
    }

    // Calculate points
    const points = calculateTrickPoints(room.currentTrick);

    // Calculate the winner index correctly
    const trickStartIndex =
      (room.currentTurn - room.currentTrick.length + room.players.length) %
      room.players.length;
    const winnerIndex = (trickStartIndex + winningIndex) % room.players.length;

    const winner = room.players[winnerIndex];
    winner.tricks.push([...room.currentTrick]);
    winner.score += points;

    // Check if round is over
    if (isRoundOver(room.players)) {
      this.handleRoundEnd(roomId);
    } else {
      // Continue with next trick
      room.currentTurn = winnerIndex;
      room.currentTrick = [];
      room.ledSuit = null;
      room.firstTrickOfRound = false;
    }
  }

  // Handle round end
  private static handleRoundEnd(roomId: string): void {
    const room = RoomModel.getRoomById(roomId);
    if (!room) return;

    // Check for shooting the moon
    const { shootingTheMoonPlayer } = checkShootingTheMoon(room.players);

    if (shootingTheMoonPlayer) {
      // Player who shot the moon gets 0, others get 26
      room.players.forEach((p) => {
        if (p.id === shootingTheMoonPlayer.id) {
          p.score = 0;
        } else {
          p.score = 26;
        }
      });
    }

    // Check if game is over
    if (isGameOver(room.players, room.endPoint)) {
      room.gameState = "finished";
      // Emit game over event (handled by socket controller)
      return;
    }

    // Start new round
    this.startNewRound(roomId);
  }

  // Start a new round
  private static startNewRound(roomId: string): void {
    const room = RoomModel.getRoomById(roomId);
    if (!room) return;

    room.roundNumber++;
    room.passDirection = getPassDirection(room.roundNumber);
    room.gameState = "passing";
    room.currentTrick = [];
    room.ledSuit = null;
    room.deck = createDeck();
    room.firstTrickOfRound = true;

    // Reset player hands and tricks
    room.players.forEach((player) => {
      player.hand = [];
      player.tricks = [];
      player.passedCards = [];
    });

    // Deal new cards
    dealCards(room.players, room.deck);

    // Find 2 of clubs to determine who starts
    const twoOfClubsIndex = findTwoOfClubsPlayer(room.players);
    room.currentTurn = twoOfClubsIndex;
  }
}
