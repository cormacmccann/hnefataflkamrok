import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface HistorianCtx {
  historianMode: boolean;
  toggleHistorianMode: () => void;
}

const Ctx = createContext<HistorianCtx | null>(null);
const STORAGE_KEY = 'tafl:historianMode';

export function HistorianModeProvider({ children }: { children: ReactNode }) {
  const [historianMode, setHistorianMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, historianMode ? '1' : '0');
  }, [historianMode]);

  const toggleHistorianMode = () => setHistorianMode((v) => !v);

  return (
    <Ctx.Provider value={{ historianMode, toggleHistorianMode }}>{children}</Ctx.Provider>
  );
}

export function useHistorianMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHistorianMode must be used within HistorianModeProvider');
  return ctx;
}
