import { translations, type Language } from './translations';
import swe from './locales/swe.json';
import ga from './locales/ga.json';
import gd from './locales/gd.json';
import cy from './locales/cy.json';
import ang from './locales/ang.json';

export const uiCatalogs: Record<Exclude<Language, 'en'>, Record<string, string>> = { swe, ga, gd, cy, ang };
const dictionaries = new Map<Language, Map<string, string>>();
const normalized = (text: string) => text.replace(/\s+/g, ' ').trim();
function flattenPair(english: unknown, target: unknown, result: Map<string,string>, path = '') {
  // Historical copy comes from the corrected collection catalogue, not older translations.
  if (path.startsWith('variantHistories') || path.startsWith('variantDescriptions') || path === 'languageName') return;
  if (typeof english === 'string' && typeof target === 'string') result.set(normalized(english), target);
  else if (english && target && typeof english === 'object' && typeof target === 'object') for (const key of Object.keys(english)) flattenPair(english[key], target[key], result, path ? `${path}.${key}` : key);
}
export function uiDictionary(language: Language) {
  const existing = dictionaries.get(language); if (existing) return existing;
  const result = new Map<string,string>();
  flattenPair(translations.en, translations[language], result);
  if (language !== 'en') for (const [key, value] of Object.entries(uiCatalogs[language])) result.set(normalized(key), value);
  dictionaries.set(language,result); return result;
}
export function translateUi(phrase: string, language: Language, values: Record<string,string|number> = {}) {
  const source = normalized(phrase);
  let result = language === 'en' ? phrase : uiDictionary(language).get(source) ?? phrase;
  for (const [key,value] of Object.entries(values)) result = result.split(`{${key}}`).join(String(value));
  return result;
}
