import { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
}

export function VolumeControl({
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
}: VolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
    return <Volume2 className="w-5 h-5" />;
  };

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="carved-button rounded-lg flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[56px] tap-target text-foreground hover:text-primary transition-colors"
        title="Volume settings"
        aria-label="Volume settings"
      >
        {getVolumeIcon(Math.max(musicVolume, sfxVolume))}
        <span className="text-[9px] uppercase tracking-wider font-['Cinzel'] leading-none">Sound</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute right-0 mt-2 p-4 bg-card/95 backdrop-blur rounded-lg border border-border shadow-xl min-w-[200px] z-50"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Music</span>
                  <span className="text-primary font-medium">{Math.round(musicVolume * 100)}%</span>
                </div>
                <Slider
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
                  value={[sfxVolume * 100]}
                  onValueChange={([val]) => onSfxVolumeChange(val / 100)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
