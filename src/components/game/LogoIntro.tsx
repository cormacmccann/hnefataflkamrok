import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';
import vikingBackground from '@/assets/viking-background.jpg';

interface LogoIntroProps {
  onComplete: () => void;
}

export function LogoIntro({ onComplete }: LogoIntroProps) {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${vikingBackground})` }}
    >
      <div className="absolute inset-0 bg-background/80" />
      
      <AnimatePresence onExitComplete={handleExitComplete}>
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ 
              duration: 0.8,
              exit: { duration: 0.5 }
            }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.img 
              src={hnefataflLogo} 
              alt="Hnefatafl" 
              className="h-32 sm:h-40 md:h-48 drop-shadow-2xl"
              animate={{ 
                filter: ['drop-shadow(0 0 20px hsl(var(--primary)/0.3))', 'drop-shadow(0 0 40px hsl(var(--primary)/0.5))', 'drop-shadow(0 0 20px hsl(var(--primary)/0.3))']
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 text-lg text-muted-foreground font-['Cinzel'] tracking-widest"
            >
              The Viking Game of Strategy
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
