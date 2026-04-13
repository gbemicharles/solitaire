import { useEffect, useState } from 'react';
import { Trophy, Target, Users } from 'lucide-react';
import { getUserData } from './tma';
import './screens.css';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

export default function ResultsHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const userId = getUserData().id.toString();
      const res = await fetch(`${API_URL}/user-tournaments/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const poll = setInterval(fetchHistory, 3000);
    return () => clearInterval(poll);
  }, []);

  const handleClaim = async (matchId: string) => {
    try {
      const userId = getUserData().id.toString();
      const res = await fetch(`${API_URL}/claim-prize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, userId })
      });
      if (res.ok) {
         fetchHistory(); // refresh balance state UI
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="tab-screen fade-in-up">
      <div className="banner-visual">
         <Trophy size={40} className="gold-text pulse-anim" />
         <h1 className="gold-text" style={{fontSize: '2rem', margin: '10px 0 0 0'}}>HISTORY</h1>
      </div>

      <div className="tournaments-container" style={{ margin: '0 auto', marginTop: '20px', paddingBottom: '40px' }}>
        {loading ? (
           <div className="spinner"></div>
        ) : history.length === 0 ? (
           <div className="empty-state">
              <Target size={48} color="#333" />
              <p>No tournament history yet.</p>
           </div>
        ) : (
          history.map(t => {
            const isTon = t.type === 'TON';
            const isWon = t.status === 'FINALIZED' && t.playerData.prize > 0;
            const isLost = t.status === 'FINALIZED' && t.playerData.prize === 0;

            return (
              <div key={t.id} className={`history-card-3d ${isWon ? 'won' : (isLost ? 'lost' : 'pending')}`}>
                <div className="history-3d-left">
                   <div className="medal-container">
                     {t.status === 'FINALIZED' ? (
                       <div className={`massive-medal ${isWon ? 'medal-gold' : 'medal-gray'}`}>
                         <span>{t.playerData.placement}</span>
                       </div>
                     ) : (
                       <div className="massive-medal medal-orange">
                         <Target size={24} color="#000" />
                       </div>
                     )}
                   </div>
                   <div className="history-3d-info">
                      <span className="h-title" style={{fontSize: '1.2rem'}}>{isTon ? 'Premium' : 'Diamond'}</span>
                      <div className="h-bubble-row">
                        <span className="players-bubble"><Users size={12}/> {t.currentPlayers}/{t.capacity}</span>
                      </div>
                      {t.status === 'FINALIZED' && <span className="h-score-label">Score: <strong style={{color: '#fff'}}>{t.playerData.score}</strong></span>}
                   </div>
                </div>
                
                <div className="history-3d-right">
                  {isWon ? (
                     <div className="win-box-3d">
                        <div className="win-label">YOU WON:</div>
                        <div className="win-amount">{isTon ? '$' : ''}{t.playerData.prize}{!isTon ? ' 💎' : ''}</div>
                        {!t.playerData.hasClaimed ? (
                           <button className="btn-3d btn-3d-green bounce" onClick={() => handleClaim(t.id)}>Collect All!</button>
                        ) : (
                           <button className="btn-3d btn-3d-gray" disabled>Collected</button>
                        )}
                     </div>
                  ) : t.status === 'PENDING' ? (
                     <div className="pending-box">
                        <span style={{color: '#f59e0b', fontWeight: '900'}}>WAITING</span>
                     </div>
                  ) : (
                     <div className="win-box-3d lost-box">
                        <div className="win-label">TRY AGAIN</div>
                        <button className="btn-3d btn-3d-gray" disabled>Lost</button>
                     </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
