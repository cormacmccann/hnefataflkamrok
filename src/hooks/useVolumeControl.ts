import { useState, useCallback, useEffect } from 'react';

const MUSIC_VOLUME_KEY = 'hnefatafl-music-volume';
const SFX_VOLUME_KEY = 'hnefatafl-sfx-volume';

export function useVolumeControl() {
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem(MUSIC_VOLUME_KEY);
    return saved ? parseFloat(saved) : 0.3;
  });

  const [sfxVolume, setSfxVolume] = useState(() => {
    const saved = localStorage.getItem(SFX_VOLUME_KEY);
    return saved ? parseFloat(saved) : 0.5;
  });

  const updateMusicVolume = useCallback((volume: number) => {
    setMusicVolume(volume);
    localStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  }, []);

  const updateSfxVolume = useCallback((volume: number) => {
    setSfxVolume(volume);
    localStorage.setItem(SFX_VOLUME_KEY, volume.toString());
  }, []);

  return {
    musicVolume,
    sfxVolume,
    updateMusicVolume,
    updateSfxVolume,
  };
}
