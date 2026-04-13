import { useState, useEffect } from 'react';
import './screens.css';

interface ResultProps {
  stats: any;
  tournamentType: string;
  onReturnLobby: () => void;
}

export default function ResultScreen({ stats, tournamentType, onReturnLobby }: ResultProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2200);
    const timer4 = setTimeout(() => setStep(4), 3000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, []);

  return (
    <div className="result-screen fade-in-down">
      <h1 className="gold-text">{stats?.isVictory ? "BOARD CLEARED!" : "MATCH SUBMITTED!"}</h1>
      <h3 className="tournament-label">{tournamentType} TOURNAMENT</h3>
      
      <div className="result-stats-card pop-in">
        {step >= 1 && (
          <div className="result-row slide-in-right">
            <span>Base Gameplay Score:</span>
            <span>{stats?.baseScore || 0}</span>
          </div>
        )}
        {step >= 2 && (
           <div className="result-row slide-in-right">
             <span>Efficiency Bonus ({stats?.moves || 0} moves):</span>
             <span className="text-green">+{stats?.efficiencyBonus || 0}</span>
           </div>
        )}
        {step >= 3 && (
           <div className="result-row slide-in-right">
             <span>Time Bonus ({stats?.timeString || '00:00'}):</span>
             <span className="text-green">+{stats?.timeBonus || 0}</span>
           </div>
        )}
        {step >= 4 && (
           <div className="result-row final-total pop-in">
             <span>FINAL SCORE:</span>
             <span>{stats?.totalScore || 0}</span>
           </div>
        )}
      </div>

      {step >= 4 && (
        <>
          <div className="waiting-box fade-in-up">
            <p>Waiting for other players to finish...</p>
            <div className="spinner"></div>
          </div>
          <button className="return-btn mt-4 fade-in-up" onClick={onReturnLobby}>RETURN TO LOBBY</button>
        </>
      )}
    </div>
  );
}
