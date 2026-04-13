import { startGame, SolitaireGame } from 'c:/Users/USER/Documents/solitaire/web-app/src/logic/solitaire';

const seed = 12345;
const game1 = startGame(seed);
const game2 = startGame(seed);

const state1 = game1.getGameState();
const state2 = game2.getGameState();

// Test Initial State Determinism
let isIdentical = true;
for (let i = 0; i < 7; i++) {
  if (state1.tableau[i].length !== state2.tableau[i].length) isIdentical = false;
  for (let j = 0; j < state1.tableau[i].length; j++) {
    if (state1.tableau[i][j].id !== state2.tableau[i][j].id) isIdentical = false;
  }
}

if (!isIdentical) {
  console.log("FAIL: Boards do not match for same seed!");
  process.exit(1);
}

// Test moves
game1.drawCard();
game2.drawCard();

if (game1.getGameState().waste[0].id !== game2.getGameState().waste[0].id) {
  console.log("FAIL: Draws do not match!");
  process.exit(1);
}

console.log("SUCCESS: Deterministic logic validated.");
