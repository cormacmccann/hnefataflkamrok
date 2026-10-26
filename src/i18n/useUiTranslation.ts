import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { translateSurface } from './surfaceTranslation';
import { translateUi } from './uiTranslation';
export function useUiTranslation() {
  const { language } = useLanguage();
  const tr = useCallback((phrase: string, values: Record<string, string | number> = {}) => translateUi(phrase, language, values), [language]);
  const trText = useCallback((text: string) => translateSurface(text, language), [language]);
  return { tr, trText, language };
}
