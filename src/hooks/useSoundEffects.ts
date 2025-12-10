import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects(volume: number = 0.5) {
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const captureAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    moveAudioRef.current = new Audio('/audio/piece-move.mp3');
    captureAudioRef.current = new Audio('/audio/piece-defeated.wav');
    selectAudioRef.current = new Audio('/audio/select-piece.wav');

    return () => {
      moveAudioRef.current = null;
      captureAudioRef.current = null;
      selectAudioRef.current = null;
    };
  }, []);

  // Update volumes when volume prop changes
  useEffect(() => {
    if (moveAudioRef.current) moveAudioRef.current.volume = volume;
    if (captureAudioRef.current) captureAudioRef.current.volume = volume;
    if (selectAudioRef.current) selectAudioRef.current.volume = volume;
  }, [volume]);

  const playSelect = useCallback(() => {
    if (selectAudioRef.current) {
      selectAudioRef.current.currentTime = 0;
      selectAudioRef.current.play().catch(() => {});
    }
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
    playSelect,
    playMove,
    playCapture,
    playGameOver: playCapture,
  };
}
