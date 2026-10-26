type Translate = (phrase: string, values?: Record<string, string | number>) => string;

/** Keep engine records stable while rendering their structured move notation locally. */
export function localizeAncientLog(text: string, tr: Translate, trText: (text: string) => string): string {
  const side = (name: string) => tr(name === 'Rome' ? 'White' : name === 'Foe' ? 'Black' : name);
  const tags = (value: string) => value.split(/(?=✦|↩)/).map(part => trText(part.trim())).filter(Boolean).join(' · ');
  let match = text.match(/^(White|Black|Rome|Foe) wins(?:[!.]| — (.*?)[.]?)$/);
  if (match) return tr('{side} wins', { side: side(match[1]) }) + (match[2] ? ` · ${trText(match[2].replace(/\.$/, ''))}` : '');
  match = text.match(/^(White|Black) (entered|from (\d+)) → (borne off|\d+)(.*)$/);
  if (match) return `${side(match[1])} · ${match[2] === 'entered' ? tr('Enter') : match[3]} → ${match[4] === 'borne off' ? tr('home') : match[4]}${match[5] ? ` · ${tags(match[5])}` : ''}`;
  match = text.match(/^(White|Black) (entered|from ([wbs]\d+)) (?:to ([wbs]\d+)|(borne off))\.\s*(.*)$/);
  if (match) return `${side(match[1])} · ${match[2] === 'entered' ? tr('Enter') : match[3]} → ${match[5] ? tr('home') : match[4]}${match[6] ? ` · ${tags(match[6])}` : ''}`;
  match = text.match(/^(White|Black) ([a-h]\d+)→([a-h]\d+)(.*)$/);
  if (match) return `${side(match[1])} · ${match[2]}→${match[3]}${match[4] ? ` · ${tags(match[4])}` : ''}`;
  match = text.match(/^(Rome|Foe)( \(Dux\))? → ([a-h]\d+)(.*)$/);
  if (match) return `${side(match[1])}${match[2] ? ` (${tr('Dux')})` : ''} → ${match[3]}${match[4] ? ` · ${tags(match[4])}` : ''}`;
  match = text.match(/^(.+) casts: (\d+)$/);
  if (match) return `${match[1]} · ${tr('cast {v0} · choose a move', { v0: match[2] })}`;
  const translated = trText(text);
  if (translated !== text) return translated;
  match = text.match(/^([^:]+): (.*)$/);
  if (match) {
    const reason = trText(match[2]);
    return `${side(match[1])}: ${reason === match[2] ? trText(match[2].replace(/\.$/, '')) : reason}`;
  }
  return translated;
}
