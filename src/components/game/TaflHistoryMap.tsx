import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GameVariant } from '@/types/game';
import { X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface TaflHistoryMapProps {
  variants: GameVariant[];
  selectedVariant: GameVariant;
  onSelectVariant: (variant: GameVariant) => void;
  onClose: () => void;
}

// Historically-attested Viking/Insular diffusion routes — connecting actual find-sites
const ROUTES: Array<{ from: [number, number]; to: [number, number]; label: string }> = [
  // Gokstad (Norway) -> Ballinderry (Ireland) — Norse settlement of Ireland, 9th c.
  { from: [59.083, 10.214], to: [53.171, -7.785], label: 'Norse → Ireland (9th c.)' },
  // Gokstad -> Canterbury — Danelaw, 9th-10th c.
  { from: [59.083, 10.214], to: [51.279, 1.083], label: 'Norse → Anglo-Saxon England' },
  // Sápmi -> Gokstad — Northern contact / Linnaeus' northern route
  { from: [68.435, 18.806], to: [59.083, 10.214], label: 'Sápmi ↔ Scandinavia' },
  // Knowth -> Aberystwyth — Insular Celtic exchange
  { from: [53.701, -6.491], to: [52.413, -4.082], label: 'Insular Celtic exchange' },
  // Ballinderry -> Knowth — within Ireland
  { from: [53.171, -7.785], to: [53.701, -6.491], label: 'Irish tafl heartland' },
];

function makeIcon(color: string, ring: string, initial: string, pulse: boolean) {
  const size = pulse ? 30 : 24;
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid ${ring};
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-family:Cinzel,serif;font-weight:700;font-size:11px;
      box-shadow:0 2px 6px rgba(0,0,0,0.6);
      ${pulse ? `color:${ring};` : ''}
    " class="${pulse ? 'tafl-marker-pulse' : ''}">${initial}</div>`;
  return L.divIcon({
    html,
    className: 'tafl-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitOnSelect({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 5), { duration: 0.8 });
  }, [center, map]);
  return null;
}

export function TaflHistoryMap({ variants, selectedVariant, onSelectVariant, onClose }: TaflHistoryMapProps) {
  const { t } = useLanguage();

  const bounds: LatLngBoundsExpression = [[44, -20], [72, 35]];

  const routeLines = useMemo(() => ROUTES.map((r, i) => (
    <Polyline
      key={i}
      positions={[r.from, r.to]}
      pathOptions={{ color: '#FFD700', weight: 2, opacity: 0.55, dashArray: '6 6' }}
    >
      <Tooltip direction="center" opacity={0.9} className="!bg-black/80 !text-amber-200 !border-none">
        {r.label}
      </Tooltip>
    </Polyline>
  )), []);

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
        className="relative bg-card sm:border border-border sm:rounded-xl p-3 sm:p-5 w-full h-[100dvh] sm:h-auto sm:max-w-4xl sm:max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
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
            {t.historyMapTitle || 'The Spread of Tafl Games'}
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            Archaeological find-sites · 4th–13th century CE
          </p>
        </div>

        <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={[58, 5]}
            zoom={4}
            minZoom={3}
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
            {variants.map(v => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <Marker
                  key={v.id}
                  position={[v.coordinates.lat, v.coordinates.lng]}
                  icon={makeIcon(v.theme.corner, v.theme.accentRing, v.name[0], isSelected)}
                  eventHandlers={{ click: () => onSelectVariant(v) }}
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
            <FitOnSelect center={[selectedVariant.coordinates.lat, selectedVariant.coordinates.lng]} />
          </MapContainer>
        </div>

        {/* Selected variant info */}
        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-secondary/30 rounded-lg text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm">
          <span className="font-['Cinzel'] text-primary font-semibold">{selectedVariant.name}</span>
          <span className="text-muted-foreground">{selectedVariant.origin}</span>
          <span className="text-muted-foreground">{selectedVariant.era}</span>
          <span className="text-muted-foreground">
            {selectedVariant.boardType === 'circular' ? '7 rings' : `${selectedVariant.boardSize}×${selectedVariant.boardSize}`}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
