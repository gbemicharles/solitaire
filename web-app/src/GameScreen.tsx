import { useState, useEffect, useCallback, useRef } from 'react';
import type { Card, Suit } from './logic/solitaire';
import { createDeck, canMoveToFoundation, canMoveToTableau, SCORING, RANK_VALUE } from './logic/solitaire';
import { Undo2, Crown, RefreshCw, Send, Settings } from 'lucide-react';
import { initializeTMA, getUserData } from './tma';
import './index.css';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

interface GameState {
  stock: Card[];
  waste: Card[];
  foundation: Record<Suit, Card[]>;
  tableau: Card[][];
  score: number;
}

interface GameScreenProps {
  tournamentType: 'TON' | 'DIAMOND';
  onGameOver: (stats: any) => void;
}

const GameScreen = ({ tournamentType, onGameOver }: GameScreenProps) => {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundation, setFoundation] = useState<Record<Suit, Card[]>>({
    hearts: [], diamonds: [], clubs: [], spades: []
  });
  const [tableau, setTableau] = useState<Card[][]>(Array(7).fill([]).map(() => []));
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(300);
  const [moves, setMoves] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [hasUsedUndo, setHasUsedUndo] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  
  const timerRef = useRef<any>(null);

  const saveState = useCallback(() => {
    setMoves(prev => prev + 1);
    setHasUsedUndo(false);
    const currentState: GameState = {
      stock: JSON.parse(JSON.stringify(stock)),
      waste: JSON.parse(JSON.stringify(waste)),
      foundation: JSON.parse(JSON.stringify(foundation)),
      tableau: JSON.parse(JSON.stringify(tableau)),
      score
    };
    setUndoStack((prev: GameState[]) => [...prev.slice(-19), currentState]);
  }, [stock, waste, foundation, tableau, score]);

  const startNewGame = useCallback(async () => {
    try {
      const userId = getUserData().id.toString();
      const response = await fetch(`${API_URL}/create-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: tournamentType })
      });
      const data = await response.json();
      const seed = data.seed;
      setMatchId(data.matchId);

      const newDeck = createDeck(seed);
      const newTableau: Card[][] = Array(7).fill([]).map(() => []);
      
      let deckIndex = 0;
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
          const card = newDeck[deckIndex++];
          if (j === i) card.isFaceUp = true;
          newTableau[i].push(card);
        }
      }
      
      setTableau(newTableau);
      setStock(newDeck.slice(deckIndex));
      setWaste([]);
      setFoundation({ hearts: [], diamonds: [], clubs: [], spades: [] });
      setScore(0);
      setTimer(300);
      setMoves(0);
      setHasUsedUndo(false);
      setUndoStack([]);
      setIsGameActive(true);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, []);

  const calculateFinalScore = (currentScore: number, currentTimer: number, currentMoves: number) => {
    if (currentMoves < 5 || currentScore === 0) {
      return { baseScore: currentScore, timeBonus: 0, efficiencyBonus: 0, totalScore: currentScore };
    }
    const activityMultiplier = Math.min(1, currentMoves / 20);
    const timeBonus = Math.floor(currentTimer * 5 * activityMultiplier);
    const efficiencyBonus = Math.max(0, 200 - currentMoves);
    return { baseScore: currentScore, timeBonus, efficiencyBonus, totalScore: currentScore + timeBonus + efficiencyBonus };
  };

  const handleSubmit = useCallback(async () => {
    let stats = { baseScore: score, timeBonus: 0, efficiencyBonus: 0, totalScore: score };
    
    if (isGameActive) {
      if (moves === 0 || score === 0) { alert("Play the game before submitting!"); return; }
      setIsGameActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      stats = calculateFinalScore(score, timer, moves);
      setScore(stats.totalScore);
    } else {
      if (moves === 0 || score === 0) { alert("Invalid score or moves for submission."); return; }
    }

    onGameOver({
      ...stats,
      timeString: formatTime(timer),
      moves,
      isVictory: false
    });

    if (!matchId) return;

    try {
      const userId = getUserData().id.toString();
      await fetch(`${API_URL}/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, userId, score: stats.totalScore })
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [matchId, score, timer, moves, isGameActive]);

  useEffect(() => {
    initializeTMA();
    startNewGame();
  }, [startNewGame]);

  const endGame = useCallback(() => {
    setIsGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setScore(prevScore => {
        const stats = calculateFinalScore(prevScore, timer, moves);
        
        if (matchId) {
          const userId = getUserData().id.toString();
          fetch(`${API_URL}/submit-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId, userId, score: stats.totalScore })
          }).catch(console.error);
        }

        setTimeout(() => {
          onGameOver({
             ...stats,
             timeString: formatTime(timer),
             moves,
             isVictory: timer > 0
          });
        }, 0);
        return stats.totalScore;
    });
  }, [timer, moves, matchId, onGameOver]);

  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const next = prev - 1;
          console.log(`currentTime: ${next}`);
          if (next <= 0) {
            clearInterval(timerRef.current);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive]);

  useEffect(() => {
    if (isGameActive && timer === 0) {
      endGame();
    }
  }, [timer, isGameActive, endGame]);

  useEffect(() => {
    if (!isGameActive) return;
    
    let isWon = true;
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]) {
      if (foundation[suit].length !== 13) isWon = false;
    }

    if (isWon) {
      endGame();
    } else {
      const isAutoCompletable = stock.length === 0 && waste.length === 0 && tableau.every(pile => pile.every(card => card.isFaceUp));
      if (isAutoCompletable) {
        const allRemainingCards = tableau.flat();
        if (allRemainingCards.length > 0) {
          const newFoundation = { ...foundation };
          allRemainingCards.forEach(card => {
             newFoundation[card.suit] = [...newFoundation[card.suit], card];
          });
          
          for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]) {
            newFoundation[suit].sort((a, b) => RANK_VALUE[a.rank] - RANK_VALUE[b.rank]);
          }
          
          setTableau(Array(7).fill([]));
          setFoundation(newFoundation);
          setScore(prev => prev + (allRemainingCards.length * 100));
        }
      }
    }
  }, [stock, waste, tableau, foundation, isGameActive]);

  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !isGameActive || hasUsedUndo) return;
    setHasUsedUndo(true);
    setMoves(prev => prev + 1);
    const lastState = undoStack[undoStack.length - 1];
    setStock(lastState.stock);
    setWaste(lastState.waste);
    setFoundation(lastState.foundation);
    setTableau(lastState.tableau);
    setScore(lastState.score);
    setUndoStack((prev: GameState[]) => prev.slice(0, -1));
  };

  const handleStockClick = () => {
    saveState();
    if (stock.length === 0) {
      if (waste.length === 0) return;
      setStock(waste.slice().reverse().map((c: Card) => ({ ...c, isFaceUp: false })));
      setWaste([]);
    } else {
      setScore(s => Math.max(0, s - 2));
      const remainingStock = [...stock];
      const newWaste = [...waste];
      for (let i = 0; i < 3; i++) {
        if (remainingStock.length === 0) break;
        const card = remainingStock.pop()!;
        card.isFaceUp = true;
        newWaste.push(card);
      }
      setStock(remainingStock);
      setWaste(newWaste);
      console.log(newWaste.map(c => c.rank + c.suit));
    }
  };

  const moveCardToFoundation = (card: Card, sourcePile: string) => {
    const suit = card.suit;
    const targetTop = foundation[suit][foundation[suit].length - 1];
    
    if (canMoveToFoundation(card, targetTop)) {
      saveState();
      setFoundation((prev: Record<Suit, Card[]>) => ({ ...prev, [suit]: [...prev[suit], card] }));
      
      if (sourcePile === 'waste') {
        setWaste((prev: Card[]) => prev.slice(0, -1));
      } else if (sourcePile.startsWith('tableau-')) {
        const tableauIndex = parseInt(sourcePile.split('-')[1]);
        setTableau((prev: Card[][]) => {
          const newTableau = prev.map((p: Card[]) => p.map((c: Card) => ({...c})));
          newTableau[tableauIndex] = newTableau[tableauIndex].slice(0, -1);
          if (newTableau[tableauIndex].length > 0) {
            newTableau[tableauIndex][newTableau[tableauIndex].length - 1].isFaceUp = true;
          }
          return newTableau;
        });
      }
      setScore(prev => prev + 100);
      return true;
    }
    return false;
  };

  const handleCardClick = (card: Card, pileId: string) => {
    if (!card.isFaceUp) return;
    moveCardToFoundation(card, pileId);
  };

  const handleDragStart = (e: React.DragEvent, card: Card, sourcePile: string, index: number) => {
    if (!card.isFaceUp) {
      e.preventDefault();
      return;
    }
    let count = 1;
    if (sourcePile.startsWith('tableau-')) {
      const tabIndex = parseInt(sourcePile.split('-')[1]);
      count = tableau[tabIndex].length - index;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ card, sourcePile, count }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, destPile: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      const movingCard: Card = data.card;
      const sourcePile: string = data.sourcePile;
      const count: number = data.count;
      
      if (sourcePile === destPile) return;

      if (destPile.startsWith('tableau-')) {
        const destColIndex = parseInt(destPile.split('-')[1]);
        const targetPile = tableau[destColIndex];
        const targetTopCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : undefined;
        
        if (canMoveToTableau(movingCard, targetTopCard)) {
          saveState();
          
          let extractedCards: Card[] = [];
          
          if (sourcePile === 'waste') {
            extractedCards = [waste[waste.length - 1]];
            setWaste(prev => prev.slice(0, -1));
            setTableau(prev => {
              const newTab = prev.map(p => [...p]);
              newTab[destColIndex].push(...extractedCards);
              return newTab;
            });
            setScore(s => s + 20);
          } else if (sourcePile.startsWith('tableau-')) {
            const srcColIndex = parseInt(sourcePile.split('-')[1]);
            setTableau(prev => {
              const newTab = prev.map(p => [...p]);
              extractedCards = newTab[srcColIndex].splice(newTab[srcColIndex].length - count, count);
              
              if (newTab[srcColIndex].length > 0 && !newTab[srcColIndex][newTab[srcColIndex].length - 1].isFaceUp) {
                newTab[srcColIndex][newTab[srcColIndex].length - 1].isFaceUp = true;
                setTimeout(() => setScore(s => s + 20), 0);
              }
              
              newTab[destColIndex].push(...extractedCards);
              return newTab;
            });
            setScore(s => s + 20);
          } else if (sourcePile.startsWith('foundation-')) {
            const suit = sourcePile.split('-')[1] as Suit;
            const topCard = foundation[suit][foundation[suit].length - 1];
            setFoundation(prev => {
              const newFound = { ...prev };
              newFound[suit] = newFound[suit].slice(0, -1);
              return newFound;
            });
            setTableau(prev => {
              const newTab = prev.map(p => [...p]);
              newTab[destColIndex].push(topCard);
              return newTab;
            });
            setScore(s => Math.max(0, s - 100));
          }
        }
      } else if (destPile.startsWith('foundation-')) {
        if (count !== 1) return;
        const destSuit = destPile.split('-')[1] as Suit;
        const targetPile = foundation[destSuit];
        const targetTopCard = targetPile.length > 0 ? targetPile[targetPile.length - 1] : undefined;
        
        if (canMoveToFoundation(movingCard, targetTopCard)) {
          saveState();
          if (sourcePile === 'waste') {
            setWaste(prev => prev.slice(0, -1));
          } else if (sourcePile.startsWith('tableau-')) {
            const srcColIndex = parseInt(sourcePile.split('-')[1]);
            setTableau(prev => {
              const newTab = prev.map(p => [...p]);
              newTab[srcColIndex].splice(newTab[srcColIndex].length - count, count);
              if (newTab[srcColIndex].length > 0 && !newTab[srcColIndex][newTab[srcColIndex].length - 1].isFaceUp) {
                newTab[srcColIndex][newTab[srcColIndex].length - 1].isFaceUp = true;
                setTimeout(() => setScore(s => s + SCORING.TURN_OVER_TABLEAU), 0);
              }
              return newTab;
            });
          }
          setTimeout(() => {
            setFoundation(prev => {
              const newFound = { ...prev };
              newFound[destSuit] = [...newFound[destSuit], movingCard];
              return newFound;
            });
            setScore(s => s + 100);
          }, 0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderCard = (card: Card, index: number, pileId: string, isInteractable: boolean = true, styleOverride?: React.CSSProperties) => {
    const colorClass = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black';
    const suitSymbol = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[card.suit];

    return (
      <div 
        key={card.id} 
        className={`card ${!card.isFaceUp ? 'face-down' : ''} ${colorClass}`}
        style={{ 
          zIndex: index, // Still needed for overlapping order
          cursor: isGameActive && isInteractable && card.isFaceUp ? 'grab' : 'default',
          ...styleOverride
        }}
        onClick={() => isGameActive && isInteractable && handleCardClick(card, pileId)}
        draggable={isGameActive && isInteractable && card.isFaceUp}
        onDragStart={(e) => {
          if (!isGameActive || !isInteractable) { e.preventDefault(); return; }
          handleDragStart(e, card, pileId, index);
        }}
      >
        {card.isFaceUp ? (
          <div className="card-content">
            <div className="card-top-left">
              <span className="rank">{card.rank}</span>
              <span className="suit">{suitSymbol}</span>
            </div>
            <span className="main-suit-center">{suitSymbol}</span>
          </div>
        ) : (
          <div className="card-back" />
        )}
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="top-bar-pill">
        <div className="stat-group">
          <span className="stat-label">Time</span>
          <div className="pill timer">{formatTime(timer)}</div>
        </div>
        <div className="title">SOLITAIRE</div>
        <div className="stat-group">
          <span className="stat-label">Score</span>
          <div className="pill score">{score}</div>
        </div>
      </div>
      
      <div className="board">
        <div className="row-top">
          <div className="foundation-center">
            {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map((suit: Suit) => (
              <div 
                key={suit} 
                className="pile foundation"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, `foundation-${suit}`)}
              >
                <div className="suit-placeholder">A</div>
                {foundation[suit].length > 0 && renderCard(foundation[suit][foundation[suit].length - 1], foundation[suit].length - 1, `foundation-${suit}`)}
              </div>
            ))}
          </div>

          <div className="deck-right">
            <div className="pile waste">
              {waste.slice(Math.max(waste.length - 3, 0)).map((card, idx, arr) => {
                const isTop = idx === arr.length - 1;
                const indexOffset = waste.length - arr.length + idx;
                return renderCard(card, indexOffset, 'waste', isTop, { left: `${idx * 16}px`, position: 'absolute' });
              })}
            </div>
            <div className="pile stock" onClick={() => isGameActive && handleStockClick()}>
              {stock.length > 0 ? (
                <div className="card face-down" />
              ) : waste.length > 0 ? (
                <div className="reload-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--accent-primary)', opacity: 0.8 }}><RefreshCw size={28} /></div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="tableau">
          {tableau.map((pile: Card[], i: number) => (
            <div 
              key={i} 
              className="tableau-pile"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, `tableau-${i}`)}
              style={{ position: 'relative' }}
            >
              {pile.length === 0 && (
                <div className="empty-tableau-placeholder">
                  <span className="placeholder-icon"><Crown size={28} /></span>
                  <span className="placeholder-text">KING</span>
                </div>
              )}
              {pile.map((card: Card, j: number) => renderCard(card, j, `tableau-${i}`))}
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button className="bottom-btn" onClick={handleSubmit}>
          <div className="icon-wrapper"><Send size={24} /></div>
          <span className="label">Submit</span>
        </button>
        <button className="bottom-btn" onClick={() => alert('Settings')}>
          <div className="icon-wrapper"><Settings size={24} /></div>
          <span className="label">Settings</span>
        </button>
        <button className="bottom-btn" onClick={handleUndo} style={hasUsedUndo ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
          <div className="icon-wrapper"><Undo2 size={24} /></div>
          <span className="label">Undo</span>
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
