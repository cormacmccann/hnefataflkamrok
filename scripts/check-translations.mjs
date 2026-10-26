import fs from 'node:fs';
import assert from 'node:assert/strict';
const phrases = JSON.parse(fs.readFileSync(new URL('../src/i18n/phrases.source.json',import.meta.url)));
const placeholders = value => [...new Set(value.match(/\{\w+\}/g) ?? [])].sort();
let total=0;
for (const language of ['swe','ga','gd','cy','ang']) {
  const dictionary = JSON.parse(fs.readFileSync(new URL(`../src/i18n/locales/${language}.json`,import.meta.url)));
  const missing = phrases.filter(key => typeof dictionary[key] !== 'string' || !dictionary[key].trim());
  assert.equal(missing.length,0,`${language}: missing ${missing.length} phrases:\n${missing.join('\n')}`);
  for (const key of phrases) assert.deepEqual(placeholders(dictionary[key]),placeholders(key),`${language}: changed placeholders for ${key}`);
  console.log(`✓ ${language}: ${phrases.length} complete phrases with matching placeholders`); total+=phrases.length;
}
console.log(`${total} translated phrase checks passed.`);
