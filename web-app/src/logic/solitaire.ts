export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'tableau' | 'foundation';

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundation: Record<Suit, Card[]>;
  tableau: Card[][];
  score: number;
  moves: number;
  seed: number;
}

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5' , '6' , '7' , '8' , '9' , '10' , 'J' , 'Q' , 'K'];

export const RANK_VALUE: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export const SCORING = {
  MOVE_TO_TABLEAU: 5,
  MOVE_TO_FOUNDATION: 15,
  TURN_OVER_TABLEAU: 5,
  WASTE_TO_TABLEAU: 5,
  FOUNDATION_TO_TABLEAU: -15,
  STOCK_RESET: 0,
  UNDO_PENALTY: -10
};

// Deterministic PRNG
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const newArray = [...array];
  const rand = mulberry32(seed);
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function createDeck(seed: number): Card[] {
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
  return deterministicShuffle(deck, seed);
}

export function createInitialGameState(seed: number): GameState {
  const deck = createDeck(seed);
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  
  let c = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck[c++];
      card.isFaceUp = (j === i);
      tableau[i].push(card);
    }
  }
  
  const stock = deck.slice(c).map(c => ({...c, isFaceUp: false}));
  
  return {
    stock,
    waste: [],
    foundation: { hearts: [], diamonds: [], clubs: [], spades: [] },
    tableau,
    score: 0,
    moves: 0,
    seed
  };
}

export function canMoveToTableau(card: Card, targetTopCard?: Card): boolean {
  if (!targetTopCard) {
    if (card.rank !== 'K') {
      console.log(`Move failed: Only Kings (value 13) can be placed in empty columns. Found: ${card.rank}.`);
      return false;
    }
    return true;
  }
  
  const movingColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
  const targetColor = (targetTopCard.suit === 'hearts' || targetTopCard.suit === 'diamonds') ? 'red' : 'black';
  
  const targetValue = RANK_VALUE[targetTopCard.rank];
  const movingValue = RANK_VALUE[card.rank];

  if (targetValue !== movingValue + 1) {
    console.log(`Move failed: target.value (${targetValue}) !== moving.value (${movingValue}) + 1`);
    return false;
  }
  
  if (targetColor === movingColor) {
    console.log(`Move failed: target.color (${targetColor}) === moving.color (${movingColor})`);
    return false;
  }
  
  return true;
}

export function canMoveToFoundation(card: Card, targetTopCard?: Card): boolean {
  if (!targetTopCard) return card.rank === 'A';
  return card.suit === targetTopCard.suit && RANK_VALUE[card.rank] === RANK_VALUE[targetTopCard.rank] + 1;
}

export function deepCloneState(state: GameState): GameState {
  return {
    ...state,
    stock: state.stock.map(c => ({...c})),
    waste: state.waste.map(c => ({...c})),
    foundation: {
      hearts: state.foundation.hearts.map(c => ({...c})),
      diamonds: state.foundation.diamonds.map(c => ({...c})),
      clubs: state.foundation.clubs.map(c => ({...c})),
      spades: state.foundation.spades.map(c => ({...c})),
    },
    tableau: state.tableau.map(col => col.map(c => ({...c}))),
  };
}

export class SolitaireGame {
  private state: GameState;

  constructor(seed: number) {
    this.state = createInitialGameState(seed);
  }

  public getGameState(): GameState {
    return this.state;
  }

  public isGameComplete(): boolean {
    return SUITS.every(suit => this.state.foundation[suit].length === 13);
  }

  public drawCard(): boolean {
    if (this.state.stock.length === 0 && this.state.waste.length === 0) return false;

    const newState = deepCloneState(this.state);
    
    if (newState.stock.length > 0) {
      const card = newState.stock.pop()!;
      card.isFaceUp = true;
      newState.waste.push(card);
    } else {
      newState.stock = [...newState.waste].reverse().map(c => ({...c, isFaceUp: false}));
      newState.waste = [];
      newState.score += SCORING.STOCK_RESET;
    }
    
    newState.moves += 1;
    this.state = newState;
    return true;
  }

  public moveCard(sourceStr: string, destStr: string, count: number): boolean {
    const newState = deepCloneState(this.state);
    let sourceCards: Card[] = [];
    let scoreDiff = 0;

    // Extract from source
    if (sourceStr === 'waste') {
      if (count !== 1 || newState.waste.length === 0) return false;
      sourceCards = [newState.waste.pop()!];
    } else if (sourceStr.startsWith('tableau-')) {
      const col = parseInt(sourceStr.split('-')[1]);
      const pile = newState.tableau[col];
      if (pile.length < count) return false;
      
      const subStack = pile.slice(pile.length - count);
      if (!subStack[0].isFaceUp) return false; // Can only move face up cards
      
      sourceCards = pile.splice(pile.length - count, count);
      
      if (newState.tableau[col].length > 0 && !newState.tableau[col][newState.tableau[col].length - 1].isFaceUp) {
        newState.tableau[col][newState.tableau[col].length - 1].isFaceUp = true;
        scoreDiff += SCORING.TURN_OVER_TABLEAU;
      }
    } else if (sourceStr.startsWith('foundation-')) {
      if (count !== 1) return false;
      const suit = sourceStr.split('-')[1] as Suit;
      const pile = newState.foundation[suit];
      if (pile.length === 0) return false;
      sourceCards = [pile.pop()!];
    } else {
      return false;
    }

    // Insert to dest
    if (destStr.startsWith('tableau-')) {
      const col = parseInt(destStr.split('-')[1]);
      const pile = newState.tableau[col];
      const topCard = pile.length > 0 ? pile[pile.length - 1] : undefined;
      
      if (!canMoveToTableau(sourceCards[0], topCard)) return false;
      
      pile.push(...sourceCards);
      
      if (sourceStr === 'waste') scoreDiff += SCORING.WASTE_TO_TABLEAU;
      if (sourceStr.startsWith('tableau-')) scoreDiff += SCORING.MOVE_TO_TABLEAU;
      if (sourceStr.startsWith('foundation-')) scoreDiff += SCORING.FOUNDATION_TO_TABLEAU;
      
    } else if (destStr.startsWith('foundation-')) {
      if (count !== 1) return false;
      const card = sourceCards[0];
      const suit = destStr.split('-')[1] as Suit;
      
      if (card.suit !== suit) return false;
      
      const pile = newState.foundation[suit];
      const topCard = pile.length > 0 ? pile[pile.length - 1] : undefined;
      
      if (!canMoveToFoundation(card, topCard)) return false;
      
      pile.push(card);
      
      if (sourceStr.startsWith('tableau-') || sourceStr === 'waste') {
        scoreDiff += SCORING.MOVE_TO_FOUNDATION;
      }
    } else {
      return false; // Cannot move directly to stock or waste
    }

    // Apply strictly if valid
    newState.score += scoreDiff;
    newState.moves += 1;
    this.state = newState;
    return true;
  }

  public autoMoveToFoundation(cardId: string): boolean {
    const state = this.state;
    let sourceStr = '';
    let foundCard: Card | undefined;

    if (state.waste.length > 0 && state.waste[state.waste.length - 1].id === cardId) {
      sourceStr = 'waste';
      foundCard = state.waste[state.waste.length - 1];
    } else {
      for (let i = 0; i < 7; i++) {
        const col = state.tableau[i];
        if (col.length > 0 && col[col.length - 1].id === cardId) {
          sourceStr = `tableau-${i}`;
          foundCard = col[col.length - 1];
          break;
        }
      }
    }

    if (!foundCard) return false;

    const destStr = `foundation-${foundCard.suit}`;
    return this.moveCard(sourceStr, destStr, 1);
  }
}

export function startGame(seed: number): SolitaireGame {
  return new SolitaireGame(seed);
}
