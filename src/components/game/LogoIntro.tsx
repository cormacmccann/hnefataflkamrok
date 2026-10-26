import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
export function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const timer = window.setTimeout(onComplete, reducedMotion ? 250 : 1600);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);
  return <div className="tafl-intro"><motion.div initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
    <img src="/brand/tafl-emblem.png" alt="TAFL carved wooden emblem" width="260" height="260" />
    <p>Old worlds. Timeless play.</p><button onClick={onComplete}>Enter the collection <span aria-hidden>→</span></button>
  </motion.div></div>;
}
