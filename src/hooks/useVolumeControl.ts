import { useState, useCallback, useEffect, useRef } from 'react';

const MUSIC_VOLUME_KEY = 'hnefatafl-music-volume';
const SFX_VOLUME_KEY = 'hnefatafl-sfx-volume';
const PREVIOUS_LEVELS_KEY = 'tafl-previous-sound-levels';
const validVolume = (value: number, fallback: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

export function useVolumeControl() {
  const [musicVolume, setMusicVolume] = useState(() => validVolume(parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY) ?? '0.3'), 0.3));
  const [sfxVolume, setSfxVolume] = useState(() => validVolume(parseFloat(localStorage.getItem(SFX_VOLUME_KEY) ?? '0.5'), 0.5));
  const previousLevels = useRef({ music: 0.3, sfx: 0.5 });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREVIOUS_LEVELS_KEY) ?? 'null');
      if (saved && (saved.music > 0 || saved.sfx > 0)) previousLevels.current = { music: validVolume(saved.music, 0.3), sfx: validVolume(saved.sfx, 0.5) };
    } catch { /* Keep the default levels when stored preferences are malformed. */ }
  }, []);

  useEffect(() => {
    if (musicVolume > 0 || sfxVolume > 0) {
      previousLevels.current = { music: musicVolume, sfx: sfxVolume };
      localStorage.setItem(PREVIOUS_LEVELS_KEY, JSON.stringify(previousLevels.current));
    }
  }, [musicVolume, sfxVolume]);

  const updateMusicVolume = useCallback((volume: number) => {
    const next = validVolume(volume, 0.3);
    setMusicVolume(next);
    localStorage.setItem(MUSIC_VOLUME_KEY, next.toString());
  }, []);
  const updateSfxVolume = useCallback((volume: number) => {
    const next = validVolume(volume, 0.5);
    setSfxVolume(next);
    localStorage.setItem(SFX_VOLUME_KEY, next.toString());
  }, []);
  const toggleMute = useCallback(() => {
    const muted = musicVolume === 0 && sfxVolume === 0;
    if (!muted) previousLevels.current = { music: musicVolume, sfx: sfxVolume };
    updateMusicVolume(muted ? previousLevels.current.music : 0);
    updateSfxVolume(muted ? previousLevels.current.sfx : 0);
  }, [musicVolume, sfxVolume, updateMusicVolume, updateSfxVolume]);

  return { musicVolume, sfxVolume, updateMusicVolume, updateSfxVolume, toggleMute };
}
