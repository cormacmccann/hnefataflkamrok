import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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
}

export function Scene3D({ 
  gameState, 
  onSquareClick, 
  onPieceClick, 
  capturePositions = [], 
  onCaptureComplete,
  theme,
  boardType = 'square',
  connectionPath = [],
  variantId,
}: Scene3DProps) {
  const [completedParticles, setCompletedParticles] = useState<Set<string>>(new Set());

  const squareSize = 1;
  const boardWidth = gameState.boardSize * squareSize;
  const offset = boardWidth / 2 - squareSize / 2;

  const handleParticleComplete = (key: string) => {
    setCompletedParticles(prev => {
      const next = new Set(prev);
      next.add(key);
      if (next.size === capturePositions.length && onCaptureComplete) {
        setTimeout(() => {
          onCaptureComplete();
          setCompletedParticles(new Set());
        }, 100);
      }
      return next;
    });
  };

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
    <div className="fixed inset-0 w-full h-full">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${vikingTableBg})` }}
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <Canvas shadows className="w-full h-full relative z-10">
        <PerspectiveCamera makeDefault position={[0, 12, 8]} fov={50} />
        <OrbitControls 
          enablePan={false}
          enableRotate={true}
          enableZoom={true}
          minDistance={8}
          maxDistance={25}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, 0]}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[0, 15, 0]}
          intensity={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[5, 8, -5]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[-5, 8, 5]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[5, 8, 5]} intensity={0.4} color="#ffcc88" />
        
        {/* Conditional board rendering */}
        {isCircular ? (
          <CircularBoard3D
            gameState={gameState}
            onNodeClick={handleNodeClick}
            onPieceClick={onPieceClick}
            theme={theme}
            connectionPath={connectionPath}
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
      </Canvas>
    </div>
  );
}