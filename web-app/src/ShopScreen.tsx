import { Gem, Coins, Zap, Sparkles } from 'lucide-react';
import './screens.css';

export default function ShopScreen() {
  return (
    <div className="tab-screen fade-in-up">
      <div className="banner-visual">
         <Sparkles size={40} className="gold-text pulse-anim" />
         <h1 className="gold-text" style={{fontSize: '2rem', margin: '10px 0 0 0'}}>BANK</h1>
      </div>
      
      <div className="tournaments-container" style={{ margin: '0 auto', paddingBottom: '40px', marginTop: '20px' }}>
        
        {/* FLASHING WELCOME OFFER */}
        <div className="tournament-card-v2 flashing-offer">
          <div className="v2-card-bg"></div>
          <div className="v2-card-content">
            <div className="v2-card-top" style={{alignItems: 'center'}}>
              <div className="v2-title">
                <h2 style={{color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)', margin: 0, fontSize: '1.4rem'}}><Zap size={18} fill="currentColor"/> WELCOME BONUS</h2>
              </div>
              <div className="v2-prize-focus">
                <div className="focus-amount text-green" style={{fontSize: '1.2rem'}}>+50% BONUS</div>
              </div>
            </div>

            <div className="promo-visual-row">
               <div className="promo-box">
                  <Coins size={28} className="gold-text"/>
                  <span>$5 TON</span>
               </div>
               <span className="arrow">➔</span>
               <div className="promo-box highlight-box">
                  <Coins size={28} className="text-green"/>
                  <span>$7.50</span>
               </div>
               <span className="arrow" style={{color: '#60a5fa'}}>+</span>
               <div className="promo-box focus-box">
                  <Gem size={28} className="blue-text"/>
                  <span>500 💎</span>
               </div>
            </div>

            <button className="play-btn-v2" style={{width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', marginTop: '20px'}}>DEPOSIT $5 TON</button>
          </div>
        </div>

        {/* TIER 1 DEPOSIT */}
        <div className="tournament-card-v2 ton-theme">
          <div className="v2-card-bg"></div>
          <div className="v2-card-content">
            <div className="v2-card-top">
              <div className="v2-title">
                <h2>STARTER</h2>
                <div className="v2-badges">
                  <span className="visual-badge blue-glow"><Gem size={14}/> 1,000 Diamonds</span>
                </div>
              </div>
              <div className="v2-prize-focus">
                <div className="focus-amount gold-glow">$10 <Coins size={18}/></div>
              </div>
            </div>
            <button className="play-btn-v2 ton-btn" style={{width: '100%', marginTop: '20px'}}>DEPOSIT NOW</button>
          </div>
        </div>

        {/* TIER 2 DEPOSIT */}
        <div className="tournament-card-v2 ton-theme">
          <div className="v2-card-bg"></div>
          <div className="v2-card-content">
            <div className="v2-card-top">
              <div className="v2-title">
                <h2>PRO BUNDLE</h2>
                <div className="v2-badges">
                  <span className="visual-badge blue-glow"><Gem size={14}/> 3,000 Dims</span>
                  <span className="visual-badge green-glow"><Coins size={14}/> +$5 Bonus</span>
                </div>
              </div>
              <div className="v2-prize-focus">
                <div className="focus-amount gold-glow">$25 <Coins size={18}/></div>
              </div>
            </div>
            <button className="play-btn-v2 ton-btn" style={{width: '100%', marginTop: '20px'}}>DEPOSIT NOW</button>
          </div>
        </div>

        {/* TIER 3 VIP DEPOSIT */}
        <div className="tournament-card-v2 ton-theme" style={{borderColor: 'var(--accent-primary)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)'}}>
          <div className="v2-card-bg" style={{background: 'linear-gradient(180deg, rgba(212,175,55,0.1) 0%, transparent 100%)'}}></div>
          <div className="v2-card-content">
            <div className="v2-card-top">
              <div className="v2-title">
                <h2 className="gold-text"><Sparkles size={18}/> VIP BUNDLE</h2>
                <div className="v2-badges">
                  <span className="visual-badge blue-glow"><Gem size={14}/> 10K Diamonds</span>
                  <span className="visual-badge green-glow"><Coins size={14}/> +$15 Bonus</span>
                </div>
              </div>
              <div className="v2-prize-focus">
                <div className="focus-amount gold-glow">$50 <Coins size={18}/></div>
              </div>
            </div>
            <button className="play-btn-v2 ton-btn" style={{width: '100%', marginTop: '20px'}}>DEPOSIT VIP</button>
          </div>
        </div>

      </div>
    </div>
  );
}
