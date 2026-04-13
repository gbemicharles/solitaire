import { useEffect } from 'react';
import './screens.css';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-title">
          <span className="gold-text pop-in-delay-1">SOLITAIRE</span>
          <br/>
          <span className="small-text pop-in-delay-2">ON TELEGRAM</span>
        </h1>
        <div className="loading-bar-container fade-in-delay-3">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
