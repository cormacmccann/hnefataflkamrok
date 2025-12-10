import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GameState, Position } from '@/types/game';
import { Board3D } from './Board3D';
import vikingTableBg from '@/assets/viking-table-bg.jpg';

interface Scene3DProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
}

export function Scene3D({ gameState, onSquareClick, onPieceClick }: Scene3DProps) {
  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Viking table background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${vikingTableBg})` }}
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <Canvas shadows className="w-full h-full relative z-10">
        <PerspectiveCamera makeDefault position={[0, 15, 0.01]} fov={45} />
        <OrbitControls 
          enablePan={false}
          enableRotate={false}
          enableZoom={true}
          minDistance={10}
          maxDistance={20}
          target={[0, 0, 0]}
        />
        
        {/* Soft ambient lighting from all directions */}
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
        
        <Board3D
          gameState={gameState}
          onSquareClick={onSquareClick}
          onPieceClick={onPieceClick}
        />
      </Canvas>
    </div>
  );
}
