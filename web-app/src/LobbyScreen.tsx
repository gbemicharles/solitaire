import { useState } from 'react';
import { Users, Gem, Coins, Medal } from 'lucide-react';
import './screens.css';

interface LobbyProps {
  onSelectTournament: (type: 'TON' | 'DIAMOND') => void;
}

export default function LobbyScreen({ onSelectTournament }: LobbyProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (type: string) => {
    setExpanded(expanded === type ? null : type);
  };

  return (
    <div className="tab-screen fade-in-up">
      <div className="lobby-header" style={{ marginBottom: '40px', position: 'relative' }}>
        <div className="banner-visual pop-in-delay-1" style={{ width: '100%', maxWidth: '400px', height: '180px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.3)' }}>
           <img src="/premium_cards_banner.png" alt="Premium Solitaire" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      <div className="tournaments-container" style={{ margin: '0 auto', marginTop: '20px', paddingBottom: '40px' }}>
        
        {/* DIAMOND TOURNAMENT */}
        <div className="tournament-card-3d" onClick={() => toggleExpand('DIAMOND')} style={{cursor: 'pointer'}}>
          <div className="card-3d-header diamond-bg">
             <div className="header-left">
               <span className="subtitle">Prize Pool</span>
               <span className="massive-title align-center">110 <Gem size={22} fill="currentColor" /></span>
             </div>
             <div className="header-right">
               <div className="players-bubble"><Users size={12}/> 6</div>
             </div>
          </div>
          <div className="card-3d-body" style={{flexDirection: 'column', alignItems: 'stretch'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div className="body-left">
                  <span className="game-title">Diamond Rush</span>
               </div>
               <div className="body-right">
                  <div className="entry-label">
                     <span className="visual-badge blue-glow"><Gem size={14}/> Entry 20</span>
                  </div>
                  <button className="btn-3d btn-3d-blue" onClick={(e) => { e.stopPropagation(); onSelectTournament('DIAMOND'); }}>
                     PLAY
                  </button>
               </div>
             </div>

             <div className={`prize-podium ${expanded === 'DIAMOND' ? 'expanded' : ''}`}>
               <div className="podium-item">
                 <div className="rank-medal rank-silver" style={{width: 44, height: 44}}><Medal size={22}/></div> 
                 <span className="podium-val silver-text">30 <Gem size={14}/></span>
               </div>
               <div className="podium-item" style={{transform: 'translateY(-10px)'}}>
                 <div className="rank-medal rank-gold" style={{width: 60, height: 60}}><Medal size={30} color="#fff"/></div> 
                 <span className="podium-val gold-text" style={{fontSize: '1.5rem'}}>50 <Gem size={16}/></span>
               </div>
               <div className="podium-item">
                 <div className="rank-medal rank-bronze" style={{width: 38, height: 38}}><Medal size={18}/></div> 
                 <span className="podium-val bronze-text">20 <Gem size={14}/></span>
               </div>
               <div className="podium-item">
                 <div className="rank-medal rank-other" style={{width: 32, height: 32, fontSize: '0.8rem'}}>4th</div> 
                 <span className="podium-val other-text">10 <Gem size={12}/></span>
               </div>
             </div>
          </div>
        </div>

        {/* TON TOURNAMENT */}
        <div className="tournament-card-3d" onClick={() => toggleExpand('TON')} style={{cursor: 'pointer'}}>
          <div className="card-3d-header gold-bg">
             <div className="header-left">
               <span className="subtitle" style={{color: '#fff'}}>Prize Pool</span>
               <span className="massive-title" style={{color: '#fff'}}>$5.00</span>
             </div>
             <div className="header-right">
               <div className="players-bubble" style={{background: 'rgba(0,0,0,0.3)', color: '#fff'}}><Users size={12}/> 7</div>
             </div>
          </div>
          <div className="card-3d-body" style={{flexDirection: 'column', alignItems: 'stretch'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div className="body-left">
                  <span className="game-title">Grand Royale</span>
               </div>
               <div className="body-right">
                  <div className="entry-label">
                     <span className="visual-badge gold-glow"><Coins size={14}/> Entry $1</span>
                  </div>
                  <button className="btn-3d btn-3d-gold" onClick={(e) => { e.stopPropagation(); onSelectTournament('TON'); }}>
                     PLAY
                  </button>
               </div>
             </div>

             <div className={`prize-podium ${expanded === 'TON' ? 'expanded' : ''}`}>
               <div className="podium-item">
                 <div className="rank-medal rank-silver" style={{width: 44, height: 44}}><Medal size={22}/></div> 
                 <span className="podium-val silver-text">$1.50</span>
               </div>
               <div className="podium-item" style={{transform: 'translateY(-10px)'}}>
                 <div className="rank-medal rank-gold" style={{width: 60, height: 60}}><Medal size={30} color="#fff"/></div> 
                 <span className="podium-val gold-text" style={{fontSize: '1.5rem'}}>$2.80</span>
               </div>
               <div className="podium-item">
                 <div className="rank-medal rank-bronze" style={{width: 38, height: 38}}><Medal size={18}/></div> 
                 <span className="podium-val bronze-text">$0.70</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
