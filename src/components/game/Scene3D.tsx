import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FittedTableCamera, SceneLoading, SceneUnavailable, TableLighting } from './BoardCraft';
import { GameState, Position, BoardTheme, BoardType, FidchellPosition } from '@/types/game';
import { Board3D } from './Board3D';
import { CircularBoard3D } from './CircularBoard3D';
import { CaptureParticles } from './CaptureParticles';
import vikingTableBg from '@/assets/viking-table-bg.jpg';
import { ERA_IMAGES } from '@/components/ancient/EraBackdrop';

interface CapturePosition {
  position: Position;
  pieceType: 'attacker' | 'defender' | 'king';
}

const NO_CAPTURES: CapturePosition[] = [];

interface Scene3DProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
  capturePositions?: CapturePosition[];
  onCaptureComplete?: () => void;
  theme?: BoardTheme;
  boardType?: BoardType;
  connectionPath?: FidchellPosition[];
  variantId?: string;
  placementMode?: boolean;
}

export function Scene3D({ 
  gameState, 
  onSquareClick, 
  onPieceClick, 
  capturePositions = NO_CAPTURES,
  onCaptureComplete,
  theme,
  boardType = 'square',
  connectionPath = [],
  variantId,
  placementMode = false,
}: Scene3DProps) {
  const [completedParticles, setCompletedParticles] = useState<Set<string>>(new Set());

  const squareSize = 1;
  const boardWidth = gameState.boardSize * squareSize;
  const offset = boardWidth / 2 - squareSize / 2;

  const handleParticleComplete = useCallback((key: string) => {
    setCompletedParticles(previous => previous.has(key) ? previous : new Set([...previous, key]));
  }, []);

  useEffect(() => {
    if (!capturePositions.length || completedParticles.size < capturePositions.length) return;
    const timer = window.setTimeout(() => { onCaptureComplete?.(); setCompletedParticles(new Set()); }, 100);
    return () => window.clearTimeout(timer);
  }, [completedParticles, capturePositions.length, onCaptureComplete]);

  useEffect(() => { setCompletedParticles(new Set()); }, [capturePositions]);

  const getParticleColor = (type: 'attacker' | 'defender' | 'king') => {
    switch (type) {
      case 'attacker': return '#2a2a2a';
      case 'defender': return '#D4A574';
      case 'king': return '#FFD700';
    }
  };

  // Handle circular board node clicks
  const handleNodeClick = (fidchellPos: FidchellPosition) => {
    // Convert to Position format for compatibility
    onSquareClick({ row: fidchellPos.ring, col: fidchellPos.spoke });
  };

  const isCircular = boardType === 'circular';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Era backdrop — period landscape of the variant's homeland */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${(variantId && ERA_IMAGES[variantId]) || vikingTableBg})` }}
      />
      {/* Warm vignette so the board stays legible */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(20,17,13,0.45) 0%, rgba(12,11,10,0.78) 100%)' }}
      />
      {/* Period-paper grain */}
      <div className="absolute inset-0 opacity-[0.10] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,220,160,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px' }}
      />

      
      <Canvas fallback={<SceneUnavailable />} shadows dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }} className="w-full h-full relative z-10">
        <FittedTableCamera span={isCircular ? 12.7 : boardWidth + 1.5} />
        <OrbitControls 
          enablePan={false}
          enableRotate={true}
          enableZoom={true}
          minDistance={8}
          maxDistance={120}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, .55]}
        />
        
        <TableLighting span={isCircular ? 13 : boardWidth + 2} />
        
        <Suspense fallback={null}>
        {/* Conditional board rendering */}
        {isCircular ? (
          <CircularBoard3D
            gameState={gameState}
            onNodeClick={handleNodeClick}
            onPieceClick={onPieceClick}
            theme={theme}
            connectionPath={connectionPath}
            placementMode={placementMode}
          />
        ) : (
          <Board3D
            gameState={gameState}
            onSquareClick={onSquareClick}
            onPieceClick={onPieceClick}
            theme={theme}
          />
        )}

        {/* Capture particle effects (square board only) */}
        {!isCircular && capturePositions.map((cp, idx) => {
          const key = `${cp.position.row}-${cp.position.col}-${idx}`;
          if (completedParticles.has(key)) return null;
          
          const x = cp.position.col * squareSize - offset;
          const z = cp.position.row * squareSize - offset;
          
          return (
            <CaptureParticles
              key={key}
              position={[x, 0.3, z]}
              color={getParticleColor(cp.pieceType)}
              onComplete={() => handleParticleComplete(key)}
            />
          );
        })}
        </Suspense>
      </Canvas>
      <SceneLoading />
    </div>
  );
}