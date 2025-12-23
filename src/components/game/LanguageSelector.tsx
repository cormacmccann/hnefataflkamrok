import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language, languageFlags } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['en', 'swe', 'ga', 'gd', 'cy', 'ang'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
        aria-label="Select language"
      >
        <span className="text-lg">{languageFlags[language].flag}</span>
        <Languages className="w-4 h-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[160px] bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl overflow-hidden"
            >
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors",
                    language === lang && "bg-secondary"
                  )}
                >
                  <span className="text-lg">{languageFlags[lang].flag}</span>
                  <span className="text-sm font-medium">{languageFlags[lang].name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
