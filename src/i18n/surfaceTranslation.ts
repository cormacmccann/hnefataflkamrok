import { translateUi, uiDictionary } from './uiTranslation';
import type { Language } from './translations';
const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patternCache = new Map<Language, Array<{ regex: RegExp; keys: string[]; target: string }>>();
function patterns(language: Language) {
  if (patternCache.has(language)) return patternCache.get(language)!;
  const result: Array<{ regex: RegExp; keys: string[]; target: string }> = [];
  for (const [source,target] of uiDictionary(language)) {
    const tokens = [...source.matchAll(/\{(\w+)\}/g)];
    if (!tokens.length || source.replace(/\{\w+\}/g,'').replace(/[^A-Za-z]/g,'').length < 5) continue;
    let regex = '', offset = 0;
    for (const token of tokens) { regex += escaped(source.slice(offset, token.index)) + '(.*?)'; offset = token.index! + token[0].length; }
    regex += escaped(source.slice(offset));
    result.push({ regex: new RegExp(`^${regex}$`, 'i'), keys: tokens.map(t => t[1]), target });
  }
  result.sort((a,b) => b.regex.source.length - a.regex.source.length);
  patternCache.set(language,result); return result;
}
export function translateSurface(source: string, language: Language, depth = 0): string {
  if (language === 'en' || !/[A-Za-z]/.test(source)) return source;
  const trimmed = source.replace(/\s+/g,' ').trim();
  const direct = translateUi(trimmed,language);
  let result = direct;
  if (direct === trimmed && !uiDictionary(language).has(trimmed)) {
    const punctuation = trimmed.match(/^([·:,.\s]*)(.*?)([:.,!?·\s]*)$/);
    if (punctuation && uiDictionary(language).has(punctuation[2])) result = punctuation[1] + translateUi(punctuation[2],language) + punctuation[3];
    else if (depth < 3) {
      for (const pattern of patterns(language)) {
        const match = trimmed.match(pattern.regex); if (!match) continue;
        result = pattern.target;
        for (let i = 0; i < pattern.keys.length; i++) result = result.split(`{${pattern.keys[i]}}`).join(match[i+1] === 's' ? '' : translateSurface(match[i+1],language,depth+1));
        break;
      }
    }
  }
  const before = source.match(/^\s*/)?.[0] ?? '', after = source.match(/\s*$/)?.[0] ?? '';
  return before + result + after;
}

