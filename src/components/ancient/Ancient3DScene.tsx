import { ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FittedTableCamera, SceneLoading, SceneUnavailable, TableLighting } from '@/components/game/BoardCraft';
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
  const spans: Record<string, [number, number]> = { 'royal-ur': [12, 6], petteia: [10, 10], latrunculorum: [11, 10], bao: [14, 8], senet: [12, 5], patolli: [25, 25], liubo: [16, 5] };
  const [span, depth] = (eraId && spans[eraId]) || [12, 12];
  const bg = (eraId && ERA_IMAGES[eraId]) || vikingTableBg;
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Era painting backdrop with subtle Ken-Burns drift */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
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
      <Canvas fallback={<SceneUnavailable />} shadows dpr={[1, 1.7]} className="w-full h-full relative z-10">
        <FittedTableCamera span={span} depth={depth} direction={cameraPosition} />
        <OrbitControls
          enablePan={false}
          enableRotate
          enableZoom
          minDistance={minDistance}
          maxDistance={Math.max(maxDistance, 120)}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          target={[0, 0, .55]}
        />
        <TableLighting span={span} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
      <SceneLoading />
    </div>
  );
}
