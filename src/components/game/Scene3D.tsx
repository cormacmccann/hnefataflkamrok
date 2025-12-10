import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GameState, Position } from '@/types/game';
import { Board3D } from './Board3D';

interface Scene3DProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
}

export function Scene3D({ gameState, onSquareClick, onPieceClick }: Scene3DProps) {
  return (
    <div className="w-full aspect-square max-w-[600px] rounded-lg overflow-hidden viking-border">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 12, 8]} fov={45} />
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={10}
          maxDistance={20}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.5} color="#ffaa55" />
        <pointLight position={[5, 8, -5]} intensity={0.3} color="#ff8844" />
        
        <Board3D
          gameState={gameState}
          onSquareClick={onSquareClick}
          onPieceClick={onPieceClick}
        />
      </Canvas>
    </div>
  );
}
