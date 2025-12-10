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
    <div className="fixed inset-0 w-full h-full">
      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 14, 10]} fov={40} />
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={12}
          maxDistance={25}
          target={[0, 0, 0]}
        />
        
        {/* Environment and lighting */}
        <color attach="background" args={['#1a1208']} />
        <fog attach="fog" args={['#1a1208', 20, 45]} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 12, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-6, 8, -6]} intensity={0.6} color="#ff9944" />
        <pointLight position={[6, 8, -6]} intensity={0.4} color="#ff7733" />
        <pointLight position={[0, 6, 8]} intensity={0.3} color="#ffaa66" />
        
        {/* Ground plane for atmosphere */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0d0905" />
        </mesh>
        
        <Board3D
          gameState={gameState}
          onSquareClick={onSquareClick}
          onPieceClick={onPieceClick}
        />
      </Canvas>
    </div>
  );
}
