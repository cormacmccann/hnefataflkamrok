import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects() {
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const captureAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    moveAudioRef.current = new Audio('/audio/piece-move.mp3');
    moveAudioRef.current.volume = 0.5;
    
    captureAudioRef.current = new Audio('/audio/piece-defeated.wav');
    captureAudioRef.current.volume = 0.5;

    return () => {
      moveAudioRef.current = null;
      captureAudioRef.current = null;
    };
  }, []);

  const playMove = useCallback(() => {
    if (moveAudioRef.current) {
      moveAudioRef.current.currentTime = 0;
      moveAudioRef.current.play().catch(() => {});
    }
  }, []);

  const playCapture = useCallback(() => {
    if (captureAudioRef.current) {
      captureAudioRef.current.currentTime = 0;
      captureAudioRef.current.play().catch(() => {});
    }
  }, []);

  return {
    playSelect: playMove,
    playMove,
    playCapture,
    playGameOver: playCapture,
  };
}
