import { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import vikingTableBg from '@/assets/viking-table-bg.jpg';

interface Props {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Shared 3D scene wrapper for ancient lost-games — matches the look & feel
 * of the main Tafl Scene3D (viking table background, warm point-lights,
 * orbit controls).
 */
export function Ancient3DScene({
  children,
  cameraPosition = [0, 10, 8],
  minDistance = 6,
  maxDistance = 22,
}: Props) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${vikingTableBg})` }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <Canvas shadows className="w-full h-full relative z-10">
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        <OrbitControls
          enablePan={false}
          enableRotate
          enableZoom
          minDistance={minDistance}
          maxDistance={maxDistance}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          target={[0, 0, 0]}
        />
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 15, 0]} intensity={0.6} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-6, 8, -6]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[6, 8, -6]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[-6, 8, 6]} intensity={0.4} color="#ffcc88" />
        <pointLight position={[6, 8, 6]} intensity={0.4} color="#ffcc88" />
        {children}
      </Canvas>
    </div>
  );
}
