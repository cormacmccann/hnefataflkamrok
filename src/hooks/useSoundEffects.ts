import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playSelect = useCallback(() => {
    playTone(400, 0.1, 'sine', 0.2);
  }, [playTone]);

  const playMove = useCallback(() => {
    playTone(300, 0.15, 'triangle', 0.25);
    setTimeout(() => playTone(350, 0.1, 'triangle', 0.2), 50);
  }, [playTone]);

  const playCapture = useCallback(() => {
    playTone(200, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.15), 100);
  }, [playTone]);

  const playGameOver = useCallback((isVictory: boolean) => {
    if (isVictory) {
      playTone(400, 0.2, 'sine', 0.3);
      setTimeout(() => playTone(500, 0.2, 'sine', 0.3), 150);
      setTimeout(() => playTone(600, 0.4, 'sine', 0.3), 300);
    } else {
      playTone(300, 0.3, 'sine', 0.3);
      setTimeout(() => playTone(200, 0.5, 'sine', 0.3), 200);
    }
  }, [playTone]);

  return {
    playSelect,
    playMove,
    playCapture,
    playGameOver,
  };
}
