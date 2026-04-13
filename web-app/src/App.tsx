import { useState, useEffect } from 'react';
import { Home, ShoppingBag, Trophy, User, Gem, Coins } from 'lucide-react';
import SplashScreen from './SplashScreen';
import LobbyScreen from './LobbyScreen';
import GameScreen from './GameScreen';
import ResultScreen from './ResultScreen';
import ShopScreen from './ShopScreen';
import ResultsHistoryScreen from './ResultsHistoryScreen';
import { getUserData, initializeTMA } from './tma';
import './index.css';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

export type ScreenType = 'SPLASH' | 'MAIN' | 'GAME' | 'MATCH_RESULT';
export type TabType = 'LOBBY' | 'SHOP' | 'RESULTS';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('SPLASH');
  const [activeTab, setActiveTab] = useState<TabType>('LOBBY');
  const [tournamentType, setTournamentType] = useState<'TON' | 'DIAMOND'>('DIAMOND');
  const [gameStats, setGameStats] = useState<any>(null);
  const [balances, setBalances] = useState({ ton: 0.00, diamonds: 0 });

  useEffect(() => {
    initializeTMA();
  }, []);

  const fetchBalance = () => {
    const userId = getUserData().id.toString();
    // Safely extract the referral ID from the native Telegram session if one exists
    // @ts-ignore
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || '';

    fetch(`${API_URL}/user-balance/${userId}?ref=${startParam}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setBalances(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 3000); // 3 second polling ensuring global cross-component sync
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = (type: 'TON' | 'DIAMOND') => {
    // Keep Optimistic local UI updates securely before transitioning visually, actual database deductions happen natively in the Node server
    if (type === 'DIAMOND') {
      if (balances.diamonds < 20) { alert('Insufficient Diamonds!'); return; }
      setBalances(prev => ({ ...prev, diamonds: prev.diamonds - 20 }));
    } else if (type === 'TON') {
      if (balances.ton < 1) { alert('Insufficient TON!'); return; }
      setBalances(prev => ({ ...prev, ton: prev.ton - 1 }));
    }
    
    setTournamentType(type);
    setCurrentScreen('GAME');
  };

  const handleGameOver = (stats: any) => {
    setGameStats(stats);
    setCurrentScreen('MATCH_RESULT');
  };

  return (
    <div className="App" style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at top, #1f1f1f, #050505)' }}>
      {currentScreen === 'SPLASH' && <SplashScreen onComplete={() => setCurrentScreen('MAIN')} />}
      
      {currentScreen === 'MAIN' && (
        <>
          <div className="main-top-header">
            <div className="profile-section">
              <div className="profile-avatar"><User size={24} /></div>
            </div>
            <div className="balance-section">
              <div className="balance-pill diamond-balance">
                <span>{balances.diamonds}</span>
                <Gem size={18} fill="currentColor" />
              </div>
              <div className="balance-pill ton-balance">
                <span>${balances.ton.toFixed(2)}</span>
                <Coins size={18} />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'LOBBY' && <LobbyScreen onSelectTournament={handleStartGame} />}
            {activeTab === 'SHOP' && <ShopScreen />}
            {activeTab === 'RESULTS' && <ResultsHistoryScreen />}
          </div>
          
          <div className="main-bottom-nav">
            <button className={`nav-btn ${activeTab === 'SHOP' ? 'active' : ''}`} onClick={() => setActiveTab('SHOP')}>
              <ShoppingBag size={24} />
              <span>Shop</span>
            </button>
            <button className={`nav-btn ${activeTab === 'LOBBY' ? 'active' : ''}`} onClick={() => setActiveTab('LOBBY')}>
              <Home size={24} />
              <span>Lobby</span>
            </button>
            <button className={`nav-btn ${activeTab === 'RESULTS' ? 'active' : ''}`} onClick={() => setActiveTab('RESULTS')}>
              <Trophy size={24} />
              <span>Results</span>
            </button>
          </div>
        </>
      )}

      {currentScreen === 'GAME' && <GameScreen tournamentType={tournamentType} onGameOver={handleGameOver} />}
      {currentScreen === 'MATCH_RESULT' && <ResultScreen stats={gameStats} tournamentType={tournamentType} onReturnLobby={() => setCurrentScreen('MAIN')} />}
    </div>
  );
}

export default App;
