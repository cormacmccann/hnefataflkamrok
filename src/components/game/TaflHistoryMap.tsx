import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GameVariant } from '@/types/game';
import { LORE_GAMES, LoreGame } from '@/constants/loreGames';
import { X, Sparkles, Scroll, Play, Hourglass } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { AncientGameModal } from '@/components/ancient/AncientGameModal';

interface TaflHistoryMapProps {
  variants: GameVariant[];
  selectedVariant: GameVariant;
  onSelectVariant: (variant: GameVariant) => void;
  onClose: () => void;
}

const ROUTES: Array<{ from: [number, number]; to: [number, number]; label: string }> = [
  { from: [59.083, 10.214], to: [53.171, -7.785], label: 'Norse → Ireland (9th c.)' },
  { from: [59.083, 10.214], to: [51.279, 1.083], label: 'Norse → Anglo-Saxon England' },
  { from: [68.435, 18.806], to: [59.083, 10.214], label: 'Sápmi ↔ Scandinavia' },
  { from: [53.701, -6.491], to: [52.413, -4.082], label: 'Insular Celtic exchange' },
  { from: [53.171, -7.785], to: [53.701, -6.491], label: 'Irish tafl heartland' },
  // Ancient lineage routes
  { from: [37.984, 23.728], to: [55.025, -2.272], label: 'Greek Petteia → Roman Latrunculorum' },
  { from: [55.025, -2.272], to: [51.279, 1.083], label: 'Roman → post-Roman Britain' },
];

function makeIcon(color: string, ring: string, initial: string, pulse: boolean) {
  const size = pulse ? 32 : 24;
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid ${ring};
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-family:Cinzel,serif;font-weight:700;font-size:12px;
      box-shadow:0 2px 8px rgba(0,0,0,0.7);
    " class="${pulse ? 'tafl-marker-pulse' : ''}">${initial}</div>`;
  return L.divIcon({ html, className: 'tafl-marker-icon', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function makeLoreIcon(family: LoreGame['family'], initial: string) {
  const familyColors: Record<LoreGame['family'], string> = {
    custodial: '#7a5a3a',
    race: '#5a4a7a',
    sowing: '#3a6a5a',
    territory: '#7a3a5a',
  };
  const html = `
    <div style="
      width:22px;height:22px;border-radius:50%;
      background:${familyColors[family]};border:1.5px dashed #f5f0e0;
      display:flex;align-items:center;justify-content:center;
      color:#f5f0e0;font-family:Cinzel,serif;font-weight:600;font-size:10px;
      box-shadow:0 1px 4px rgba(0,0,0,0.6);opacity:0.92;
    ">${initial}</div>`;
  return L.divIcon({ html, className: 'tafl-lore-icon', iconSize: [22, 22], iconAnchor: [11, 11] });
}

function FitOnSelect({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 4), { duration: 0.8 });
  }, [center, map]);
  return null;
}

export function TaflHistoryMap({ variants, selectedVariant, onSelectVariant, onClose }: TaflHistoryMapProps) {
  const { t } = useLanguage();
  const [showLore, setShowLore] = useState(true);
  const [activeLore, setActiveLore] = useState<LoreGame | null>(null);
  const [playingGame, setPlayingGame] = useState<LoreGame | null>(null);

  // Global bounds so lore pins (Egypt, China, Mesoamerica, East Africa) are reachable
  const bounds: LatLngBoundsExpression = [[-40, -130], [78, 150]];

  const routeLines = useMemo(
    () =>
      ROUTES.map((r, i) => (
        <Polyline
          key={i}
          positions={[r.from, r.to]}
          pathOptions={{ color: '#FFD700', weight: 2, opacity: 0.5, dashArray: '6 6' }}
        >
          <Tooltip direction="center" opacity={0.9} className="!bg-black/80 !text-amber-200 !border-none">
            {r.label}
          </Tooltip>
        </Polyline>
      )),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-card sm:border border-border sm:rounded-xl p-3 sm:p-5 w-full h-[100dvh] sm:h-auto sm:max-w-6xl sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close map"
          className="absolute top-2 right-2 tap-target rounded-lg hover:bg-secondary active:bg-secondary/80 transition-colors flex items-center justify-center z-[1000]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-2 sm:mb-3 pr-12">
          <h2 className="text-base sm:text-xl font-['Cinzel'] text-primary leading-tight">
            {t.historyMapTitle || 'Atlas of Ancient Strategy Games'}
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            Tafl find-sites · plus the lost games of the ancient world
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
          {/* Side panel — variants + lore list */}
          <aside className="md:w-64 shrink-0 overflow-y-auto rounded-lg border border-border bg-background/30 p-2 hidden md:block">
            <h3 className="text-[10px] uppercase tracking-wider text-primary font-semibold px-2 py-1 flex items-center gap-1.5">
              <Scroll className="w-3 h-3" /> Tafl variants
            </h3>
            <div className="space-y-1">
              {variants.map((v) => {
                const active = v.id === selectedVariant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveLore(null);
                      onSelectVariant(v);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      active ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50 text-foreground/80'
                    }`}
                  >
                    <div className="font-['Cinzel'] font-semibold">{v.name}</div>
                    <div className="text-[10px] opacity-70">{v.origin} · {v.era}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowLore((s) => !s)}
              className="mt-3 w-full text-[10px] uppercase tracking-wider text-primary font-semibold px-2 py-1 flex items-center justify-between hover:text-primary/80"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Lost games
              </span>
              <span className="opacity-60">{showLore ? '−' : '+'}</span>
            </button>
            {showLore && (
              <div className="space-y-1">
                {LORE_GAMES.map((g) => {
                  const active = activeLore?.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveLore(g)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                        active ? 'bg-accent/30 text-foreground' : 'hover:bg-secondary/40 text-foreground/70'
                      }`}
                    >
                      <div className="font-['Cinzel'] font-semibold flex items-center gap-1">
                        {g.name}
                        {g.status === 'playable' ? (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-600/40 text-emerald-100 uppercase tracking-wider">
                            play
                          </span>
                        ) : (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-amber-700/30 text-amber-200 uppercase tracking-wider">
                            dev
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] opacity-70">{g.region}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Map */}
          <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border">
            <MapContainer
              center={[35, 15]}
              zoom={2}
              minZoom={2}
              maxZoom={8}
              maxBounds={bounds}
              scrollWheelZoom={false}
              touchZoom
              dragging
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {routeLines}
              {variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <Marker
                    key={v.id}
                    position={[v.coordinates.lat, v.coordinates.lng]}
                    icon={makeIcon(v.theme.corner, v.theme.accentRing, v.name[0], isSelected)}
                    eventHandlers={{ click: () => { setActiveLore(null); onSelectVariant(v); } }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -12]}
                      opacity={0.95}
                      className="!bg-black/85 !text-amber-100 !border-none"
                    >
                      <div className="text-center">
                        <div className="font-['Cinzel'] font-semibold text-amber-200">{v.name}</div>
                        <div className="text-[10px] opacity-80">{v.origin}</div>
                        <div className="text-[10px] opacity-60">{v.era}</div>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}
              {showLore && LORE_GAMES.map((g) => (
                <Marker
                  key={g.id}
                  position={[g.coordinates.lat, g.coordinates.lng]}
                  icon={makeLoreIcon(g.family, g.name[0])}
                  eventHandlers={{ click: () => setActiveLore(g) }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={0.95}
                    className="!bg-black/85 !text-amber-100 !border-none"
                  >
                    <div className="text-center">
                      <div className="font-['Cinzel'] font-semibold text-amber-200">{g.name}</div>
                      <div className="text-[10px] opacity-80">{g.region}</div>
                      <div className="text-[10px] opacity-60">{g.era}</div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
              <FitOnSelect
                center={
                  activeLore
                    ? [activeLore.coordinates.lat, activeLore.coordinates.lng]
                    : [selectedVariant.coordinates.lat, selectedVariant.coordinates.lng]
                }
              />
            </MapContainer>
          </div>
        </div>

        {/* Bottom info card */}
        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-secondary/30 rounded-lg text-xs sm:text-sm">
          {activeLore ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-['Cinzel'] text-primary font-semibold">{activeLore.name}</span>
                <span className="text-muted-foreground">{activeLore.region}</span>
                <span className="text-muted-foreground">{activeLore.era}</span>
              </div>
              <p className="text-foreground/80 text-[11px] sm:text-xs leading-relaxed">{activeLore.description}</p>
              <button
                onClick={() => setPlayingGame(activeLore)}
                className={`tap-target px-3 rounded-md inline-flex items-center gap-1.5 text-xs font-semibold ${
                  activeLore.status === 'playable'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-amber-700/30 text-amber-100 hover:bg-amber-700/40'
                }`}
              >
                {activeLore.status === 'playable' ? (
                  <><Play className="w-3.5 h-3.5" /> Play now</>
                ) : (
                  <><Hourglass className="w-3.5 h-3.5" /> See progress</>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
              <span className="font-['Cinzel'] text-primary font-semibold">{selectedVariant.name}</span>
              <span className="text-muted-foreground">{selectedVariant.origin}</span>
              <span className="text-muted-foreground">{selectedVariant.era}</span>
              <span className="text-muted-foreground">
                {selectedVariant.boardType === 'circular' ? '7 rings' : `${selectedVariant.boardSize}×${selectedVariant.boardSize}`}
              </span>
            </div>
          )}
        </div>
      </motion.div>
      <AncientGameModal game={playingGame} onClose={() => setPlayingGame(null)} />
    </motion.div>
  );
}
