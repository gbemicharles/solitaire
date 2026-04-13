export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'tableau' | 'foundation';

export interface Pile {
  id: string;
  type: PileType;
  cards: Card[];
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5' , '6' , '7' , '8' , '9' , '10' , 'J' , 'Q' , 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isFaceUp: false,
      });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const RANK_VALUE: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export function canMoveToTableau(card: Card, targetTopCard?: Card): boolean {
  if (!targetTopCard) return card.rank === 'K';
  
  const cardColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
  const targetColor = (targetTopCard.suit === 'hearts' || targetTopCard.suit === 'diamonds') ? 'red' : 'black';
  
  return cardColor !== targetColor && RANK_VALUE[card.rank] === RANK_VALUE[targetTopCard.rank] - 1;
}

export function canMoveToFoundation(card: Card, targetTopCard?: Card): boolean {
  if (!targetTopCard) return card.rank === 'A';
  return card.suit === targetTopCard.suit && RANK_VALUE[card.rank] === RANK_VALUE[targetTopCard.rank] + 1;
}
