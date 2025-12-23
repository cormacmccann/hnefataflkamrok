import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameVariant } from '@/types/game';
import { X } from 'lucide-react';

interface TaflHistoryMapProps {
  variants: GameVariant[];
  selectedVariant: GameVariant;
  onSelectVariant: (variant: GameVariant) => void;
  onClose: () => void;
}

// Convert lat/lng to SVG coordinates (simplified mercator-ish projection)
const toSvgCoords = (lat: number, lng: number) => {
  // Map bounds: roughly lat 45-72, lng -15 to 35 (Northern Europe)
  const x = ((lng + 15) / 50) * 400 + 50;
  const y = ((72 - lat) / 27) * 300 + 25;
  return { x, y };
};

export function TaflHistoryMap({ variants, selectedVariant, onSelectVariant, onClose }: TaflHistoryMapProps) {
  const [animatedPaths, setAnimatedPaths] = useState<number>(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedPaths(prev => (prev < variants.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(timer);
  }, [variants.length]);

  // Viking trade/travel routes (simplified)
  const routes = [
    { from: { lat: 59.9, lng: 10.7 }, to: { lat: 68.4, lng: 18.5 } }, // Norway to Sweden
    { from: { lat: 59.9, lng: 10.7 }, to: { lat: 53.3, lng: -8.0 } }, // Norway to Ireland
    { from: { lat: 59.9, lng: 10.7 }, to: { lat: 52.1, lng: -3.8 } }, // Norway to Wales
    { from: { lat: 59.9, lng: 10.7 }, to: { lat: 51.3, lng: 1.1 } }, // Norway to England
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-card border border-border rounded-xl p-6 max-w-3xl w-full"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-['Cinzel'] text-primary mb-4 text-center">
          The Spread of Tafl Games
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          4th - 13th Century CE
        </p>

        <svg viewBox="0 0 500 350" className="w-full h-auto">
          {/* Ocean background */}
          <rect x="0" y="0" width="500" height="350" fill="#1a3a4a" />
          
          {/* Simplified landmass outlines */}
          {/* Scandinavia */}
          <path
            d="M280,30 Q320,40 340,80 Q350,120 330,150 Q310,160 290,140 Q270,130 260,100 Q250,70 260,50 Q270,35 280,30"
            fill="#3d5a4a"
            stroke="#5a7a6a"
            strokeWidth="1"
          />
          {/* British Isles */}
          <path
            d="M120,180 Q140,160 160,165 Q180,170 185,190 Q190,220 175,240 Q160,250 145,245 Q130,240 125,220 Q120,200 120,180"
            fill="#3d5a4a"
            stroke="#5a7a6a"
            strokeWidth="1"
          />
          {/* Ireland */}
          <path
            d="M80,170 Q100,160 110,175 Q115,195 105,210 Q90,220 80,210 Q70,195 80,170"
            fill="#3d5a4a"
            stroke="#5a7a6a"
            strokeWidth="1"
          />
          {/* Continental Europe */}
          <path
            d="M150,260 Q200,250 250,255 Q300,260 350,250 Q400,240 450,250 L450,350 L100,350 L100,280 Q120,270 150,260"
            fill="#3d5a4a"
            stroke="#5a7a6a"
            strokeWidth="1"
          />
          
          {/* Animated trade routes */}
          {routes.map((route, idx) => {
            const from = toSvgCoords(route.from.lat, route.from.lng);
            const to = toSvgCoords(route.to.lat, route.to.lng);
            const midX = (from.x + to.x) / 2;
            const midY = Math.min(from.y, to.y) - 30;
            
            return (
              <motion.path
                key={idx}
                d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="8,4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: animatedPaths > idx ? 1 : 0,
                  opacity: animatedPaths > idx ? 0.6 : 0
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            );
          })}
          
          {/* Location markers */}
          {variants.map((variant, idx) => {
            const coords = toSvgCoords(variant.coordinates.lat, variant.coordinates.lng);
            const isSelected = selectedVariant.id === variant.id;
            
            return (
              <motion.g
                key={variant.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: animatedPaths > idx ? 1 : 0,
                  opacity: animatedPaths > idx ? 1 : 0
                }}
                transition={{ delay: idx * 0.3, type: "spring" }}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectVariant(variant)}
              >
                {/* Pulse effect for selected */}
                {isSelected && (
                  <motion.circle
                    cx={coords.x}
                    cy={coords.y}
                    r="20"
                    fill="none"
                    stroke={variant.theme.accentRing}
                    strokeWidth="2"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                {/* Main marker */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 12 : 8}
                  fill={variant.theme.corner}
                  stroke={variant.theme.accentRing}
                  strokeWidth="2"
                />
                
                {/* Label */}
                <text
                  x={coords.x}
                  y={coords.y + 24}
                  textAnchor="middle"
                  fill="#e0e0e0"
                  fontSize="10"
                  fontFamily="Cinzel, serif"
                >
                  {variant.name}
                </text>
                <text
                  x={coords.x}
                  y={coords.y + 36}
                  textAnchor="middle"
                  fill="#888"
                  fontSize="8"
                >
                  {variant.era}
                </text>
              </motion.g>
            );
          })}
          
          {/* Compass rose */}
          <g transform="translate(440, 50)">
            <circle cx="0" cy="0" r="20" fill="none" stroke="#666" strokeWidth="1" />
            <path d="M0,-18 L3,0 L0,18 L-3,0 Z" fill="#888" />
            <path d="M-18,0 L0,3 L18,0 L0,-3 Z" fill="#666" />
            <text x="0" y="-22" textAnchor="middle" fill="#888" fontSize="8">N</text>
          </g>
          
          {/* Title plaque */}
          <rect x="20" y="300" width="220" height="40" rx="4" fill="#2a2a2a" stroke="#555" />
          <text x="130" y="322" textAnchor="middle" fill="#ddd" fontSize="11" fontFamily="Cinzel, serif">
            Norse & Celtic Trade Routes
          </text>
          <text x="130" y="334" textAnchor="middle" fill="#888" fontSize="8">
            Click a location to select variant
          </text>
        </svg>

        {/* Selected variant info */}
        <div className="mt-4 p-3 bg-secondary/30 rounded-lg text-center">
          <span className="font-['Cinzel'] text-primary">{selectedVariant.name}</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-sm text-muted-foreground">{selectedVariant.origin}</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-sm text-muted-foreground">{selectedVariant.boardSize}×{selectedVariant.boardSize}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
