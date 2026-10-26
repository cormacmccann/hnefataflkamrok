import { useLayoutEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { translateUi } from './uiTranslation';
import { translateSurface } from './surfaceTranslation';

const untouched = 'script,style,code,pre,textarea,input,[contenteditable="true"],[data-no-translate]';
const attributes = ['aria-label', 'title', 'placeholder', 'alt'] as const;
type RecordValue = { source: string; rendered: string };
const texts = new WeakMap<Text, RecordValue>();
const attrs = new WeakMap<Element, Map<string, RecordValue>>();

/** Bridges legacy game prose, engine logs and portal controls to the same phrase catalogue.
 * Only text-node data and user-facing attributes change; React's DOM structure stays intact.
 */
export function UiLocalization() {
  const { language } = useLanguage();
  useLayoutEffect(() => {
    const text = (node: Text) => {
      if (node.parentElement?.closest(untouched)) return;
      let record = texts.get(node);
      if (!record || node.data !== record.rendered) record = { source: node.data, rendered: node.data };
      const next = translateSurface(record.source,language);
      record.rendered = next; texts.set(node,record);
      if (node.data !== next) node.data = next;
    };
    const element = (node: Element) => {
      if (node.closest('script,style,code,pre,[data-no-translate]')) return;
      for (const name of attributes) {
        const value = node.getAttribute(name); if (value === null) continue;
        const records = attrs.get(node) ?? new Map<string,RecordValue>();
        let record = records.get(name);
        if (!record || value !== record.rendered) record = { source: value, rendered: value };
        const next = translateSurface(record.source,language);
        record.rendered = next; records.set(name,record); attrs.set(node,records);
        if (value !== next) node.setAttribute(name,next);
      }
    };
    const scan = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) { text(node as Text); return; }
      if (!(node instanceof Element) && !(node instanceof DocumentFragment)) return;
      if (node instanceof Element) { if (node.closest(untouched)) return; element(node); }
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { const current = walker.currentNode; if (current instanceof Text) text(current); else if (current instanceof Element) element(current); }
    };
    document.documentElement.lang = { en:'en',swe:'sv',ga:'ga',gd:'gd',cy:'cy',ang:'ang' }[language];
    document.title = `TAFL — ${translateUi('The ancient games collection',language)}`;
    scan(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') text(record.target as Text);
        else if (record.type === 'attributes') element(record.target as Element);
        else for (const added of record.addedNodes) scan(added);
      }
    });
    observer.observe(document.body,{ subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attributes] });
    return () => observer.disconnect();
  },[language]);
  return null;
}
