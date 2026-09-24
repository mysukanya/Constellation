import { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [typedWord, setTypedWord] = useState('');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const targetWord = 'Constellation';
    let index = 0;
    setTypedWord('');

    const interval = setInterval(() => {
      index++;
      setTypedWord(targetWord.slice(0, index));
      if (index >= targetWord.length) {
        clearInterval(interval);
        // Hold for a moment, then smoothly fade out
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600);
        }, 800);
      }
    }, 110); // slow and even deliberate pace

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 250);
  };

  return (
    <div
      className={`app-splash-overlay ${isFading ? 'is-fading' : ''}`}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      title="Click to skip"
    >
      <div className="app-splash-content font-mono">
        <span className="app-splash-word">{typedWord}</span>
        <span className="app-splash-cursor">|</span>
      </div>
    </div>
  );
}
