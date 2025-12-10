import { useState, useRef, useEffect, useCallback } from 'react';

export function useMusicPlayer(volume: number = 0.3) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio('/audio/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Attempt to autoplay only once
    if (!hasAttemptedAutoplay.current) {
      hasAttemptedAutoplay.current = true;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when prop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // If volume goes from 0 to something, auto-start
      if (volume > 0 && !isPlaying && audioRef.current.paused) {
        // Don't auto-start, wait for user interaction
      }
    }
  }, [volume, isPlaying]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const startMusic = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  return {
    isPlaying,
    toggleMusic,
    startMusic,
  };
}
