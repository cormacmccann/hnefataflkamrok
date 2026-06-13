import { VariantSource, AlternateRuleset } from '@/types/game';
import { ScrollText, Pickaxe, BookOpen, Sparkles, ExternalLink } from 'lucide-react';

const TYPE_META: Record<VariantSource['type'], { icon: typeof ScrollText; label: string; tint: string }> = {
  manuscript:   { icon: ScrollText, label: 'Manuscript',  tint: 'text-amber-300' },
  archaeology:  { icon: Pickaxe,    label: 'Archaeology', tint: 'text-stone-300' },
  saga:         { icon: Sparkles,   label: 'Saga',        tint: 'text-rose-300' },
  scholarship:  { icon: BookOpen,   label: 'Scholarship', tint: 'text-sky-300' },
};

interface SourcesPanelProps {
  sources?: VariantSource[];
  alternates?: AlternateRuleset[];
  historianMode: boolean;
}

export function SourcesPanel({ sources, alternates, historianMode }: SourcesPanelProps) {
  if (!sources?.length && !alternates?.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-amber-800/30 space-y-3">
      {sources && sources.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-['Cinzel'] font-semibold mb-2">
            Sources &amp; Scholarship
          </h5>
          <ul className="space-y-1.5">
            {sources.map((src, idx) => {
              const meta = TYPE_META[src.type];
              const Icon = meta.icon;
              const body = (
                <>
                  <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${meta.tint}`} aria-hidden />
                  <span className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground/95">{src.title}</span>
                    {src.author && <span className="text-muted-foreground"> — {src.author}</span>}
                    {src.year && <span className="text-muted-foreground/80"> ({src.year})</span>}
                    {src.note && <span className="block text-[10px] text-muted-foreground/80 leading-snug mt-0.5">{src.note}</span>}
                  </span>
                  {src.url && <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/70" aria-hidden />}
                </>
              );
              return (
                <li key={idx} className="text-[11px] leading-snug">
                  {src.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 hover:text-primary transition-colors"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-start gap-2">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {historianMode && alternates && alternates.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-['Cinzel'] font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Alternate Rulesets
          </h5>
          <ul className="space-y-2">
            {alternates.map((alt, idx) => (
              <li key={idx} className="text-[11px] bg-amber-900/10 border border-amber-800/20 rounded p-2">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="font-['Cinzel'] font-semibold text-foreground/95">{alt.name}</span>
                  {alt.scholar && <span className="text-[9px] text-muted-foreground italic truncate">{alt.scholar}</span>}
                </div>
                <p className="text-muted-foreground/90 leading-snug">{alt.attestation}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {alt.rules.kingArmed && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">King armed</span>}
                  {alt.rules.edgeEscape && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Edge escape</span>}
                  {alt.rules.shieldwallCapture && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Shieldwall</span>}
                  {alt.rules.victoryType === 'connection' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Connection</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
