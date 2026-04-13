const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const tournaments = [];
const users = {}; // Stores { ton: number, diamonds: number }

const initUser = (userId, refId = null) => {
  if (!users[userId]) {
    users[userId] = { ton: 0.0, diamonds: 100 };
    // Process referral bounty cleanly checking against self-referrals
    if (refId && users[refId] && refId !== userId) {
      users[refId].diamonds += 50;
    }
  }
};

const generateSeed = () => crypto.randomInt(0, 4294967295);

const getPrizes = (type) => {
  if (type === 'TON') return [2.8, 1.5, 0.7]; 
  if (type === 'DIAMOND') return [50, 30, 20, 10]; 
  return [];
};

app.post('/create-match', (req, res) => {
  const { userId, type } = req.body;
  if (!userId || !type) return res.status(400).json({ error: 'Missing params' });

  initUser(userId);

  const costTon = type === 'TON' ? 1.0 : 0.0;
  const costDiamond = type === 'DIAMOND' ? 20 : 0;

  if (users[userId].ton < costTon || users[userId].diamonds < costDiamond) {
    return res.status(403).json({ error: 'Insufficient balance' });
  }

  const capacity = type === 'TON' ? 7 : 6;
  
  let tourny = tournaments.find(t => 
    t.type === type && 
    t.players.length < t.capacity && 
    t.status === 'PENDING' &&
    !t.players.some(p => p.userId === userId)
  );

  if (!tourny) {
    tourny = {
      id: crypto.randomBytes(8).toString('hex'),
      type,
      capacity,
      seed: generateSeed(),
      createdAt: Date.now(),
      status: 'PENDING', 
      players: []
    };
    tournaments.push(tourny);
  }

  tourny.players.push({
    userId,
    score: 0,
    hasSubmitted: false,
    finishedAt: null
  });

  // Deduct securely from wallet upon successful queue insertion
  users[userId].ton -= costTon;
  users[userId].diamonds -= costDiamond;

  res.json({ matchId: tourny.id, seed: tourny.seed, newBalance: users[userId] });
});

app.post('/submit-score', (req, res) => {
  const { matchId, userId, score } = req.body;
  const tourny = tournaments.find(t => t.id === matchId);
  
  if (!tourny) return res.status(404).json({ error: 'Tournament not found' });
  
  const player = tourny.players.find(p => p.userId === userId);
  if (player && !player.hasSubmitted) {
    player.score = score;
    player.hasSubmitted = true;
    player.finishedAt = Date.now();
  }
  
  if (tourny.players.length === tourny.capacity && tourny.players.every(p => p.hasSubmitted)) {
    tourny.status = 'FINALIZED';
    
    tourny.players.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.finishedAt - b.finishedAt;
    });

    const prizes = getPrizes(tourny.type);
    tourny.players.forEach((p, index) => {
      p.placement = index + 1;
      p.prize = prizes[index] || 0;
      p.hasClaimed = false;
    });
  }
  
  res.json({ success: true, matchId, status: tourny.status });
});

app.get('/user-tournaments/:userId', (req, res) => {
  const { userId } = req.params;
  
  const activeHistory = tournaments
    .filter(t => t.players.some(p => p.userId === userId))
    .map(t => {
      const playerRecord = t.players.find(p => p.userId === userId);
      return {
        id: t.id,
        type: t.type,
        status: t.status,
        capacity: t.capacity,
        currentPlayers: t.players.length,
        playerData: playerRecord
      };
    });
    
  activeHistory.sort((a, b) => {
     return (b.playerData.finishedAt || 0) - (a.playerData.finishedAt || 0);
  });

  res.json(activeHistory);
});

app.get('/user-balance/:userId', (req, res) => {
  const { userId } = req.params;
  const refId = req.query.ref;
  
  initUser(userId, refId);
  res.json(users[userId]);
});

app.post('/claim-prize', (req, res) => {
  const { userId, matchId } = req.body;
  const tourny = tournaments.find(t => t.id === matchId);
  const player = tourny?.players.find(p => p.userId === userId);
  
  if (!player || player.hasClaimed || player.prize <= 0) return res.status(400).json({ error: 'Invalid claim' });

  initUser(userId);

  if (tourny.type === 'TON') users[userId].ton += player.prize;
  if (tourny.type === 'DIAMOND') users[userId].diamonds += player.prize;

  player.hasClaimed = true;
  res.json({ success: true, newBalance: users[userId] });
});

// Serve frontend dist automatically in PROD
app.use(express.static(path.join(__dirname, '../web-app/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web-app/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
