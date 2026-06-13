import { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import vikingTableBg from '@/assets/viking-table-bg.jpg';
import { ERA_IMAGES } from './EraBackdrop';

interface Props {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  /** Era id (matches loreGames.id) — used to pick the period-correct backdrop. */
  eraId?: string;
  /** Overlay darkness (0-1). Defaults to 0.55 so the board reads well over the photo. */
  overlayOpacity?: number;
}

/**
 * Shared 3D scene wrapper for ancient lost-games. The backdrop is the
 * era-correct landscape/cityscape painting so the player feels they are
 * sitting at a table in that civilisation at that time.
 */
export function Ancient3DScene({
  children,
  cameraPosition = [0, 10, 8],
  minDistance = 6,
  maxDistance = 22,
  eraId,
  overlayOpacity = 0.55,
}: Props) {
  const bg = (eraId && ERA_IMAGES[eraId]) || vikingTableBg;
  return (
    <div className="absolute inset-0">
      {/* Era painting backdrop with subtle Ken-Burns drift */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-[era-pan_60s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${bg})` }}
      />
      {/* Warm vignette + darkening so the 3D board stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${overlayOpacity * 0.6}) 0%, rgba(0,0,0,${overlayOpacity}) 60%, rgba(0,0,0,${Math.min(0.85, overlayOpacity + 0.2)}) 100%)`,
        }}
      />
      {/* Subtle period-paper grain */}
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,220,160,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px' }}
      />
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
        <ambientLight intensity={0.75} />
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
