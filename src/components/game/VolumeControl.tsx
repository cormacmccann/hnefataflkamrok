import { useEffect, useId, useRef, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingClick = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMuteAt = useRef(-Infinity);
  const panelId = useId();
  const isMuted = musicVolume === 0 && sfxVolume === 0;
  useEffect(() => () => { if (pendingClick.current !== null) clearTimeout(pendingClick.current); }, []);
  const cancelPendingClick = () => { if (pendingClick.current !== null) clearTimeout(pendingClick.current); pendingClick.current = null; };
  const muteOrRestore = () => { onToggleMute(); setIsOpen(false); lastMuteAt.current = performance.now(); };
  const handleClick = () => {
    if (pendingClick.current !== null) { cancelPendingClick(); muteOrRestore(); return; }
    pendingClick.current = setTimeout(() => { pendingClick.current = null; setIsOpen(open => !open); }, 320);
  };
  const handleDoubleClick = () => {
    cancelPendingClick();
    // Native dblclick also covers the user's longer OS double-click interval.
    if (performance.now() - lastMuteAt.current > 100) muteOrRestore();
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className="relative" onKeyDown={event => { if (event.key === 'Escape') setIsOpen(false); }}>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        type="button"
        className="carved-button rounded-lg flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[56px] tap-target text-foreground hover:text-primary transition-colors"
        title={isMuted ? "Tap for levels · Double-tap to restore sound" : "Tap for levels · Double-tap to mute sound"}
        aria-label={isMuted ? "Volume settings, sound muted" : "Volume settings"}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        {getVolumeIcon(Math.max(musicVolume, sfxVolume))}
        <span className="text-[9px] uppercase tracking-wider font-['Cinzel'] leading-none">{isMuted ? 'Muted' : 'Sound'}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="group"
            aria-label="Sound levels"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute right-0 mt-2 p-4 bg-card/95 backdrop-blur rounded-lg border border-border shadow-xl min-w-[200px] z-50"
          >
            <div className="space-y-4">
              <button type="button" onClick={muteOrRestore} className="flex min-h-9 w-full items-center justify-center gap-2 rounded border border-border px-3 py-2 text-xs text-primary">
                {isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}{isMuted ? 'Restore sound' : 'Mute all sound'}
              </button>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Music</span>
                  <span className="text-primary font-medium">{Math.round(musicVolume * 100)}%</span>
                </div>
                <Slider
                  aria-label="Music volume"
                  value={[musicVolume * 100]}
                  onValueChange={([val]) => onMusicVolumeChange(val / 100)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sound Effects</span>
                  <span className="text-primary font-medium">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <Slider
                  aria-label="Sound effects volume"
                  value={[sfxVolume * 100]}
                  onValueChange={([val]) => onSfxVolumeChange(val / 100)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
              <p className="border-t border-border pt-2 text-[10px] text-muted-foreground">Double-tap Sound to mute or restore.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
