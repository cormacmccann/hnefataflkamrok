import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { AncientInlayLabel as Text } from './AncientInlayLabel';
import { getWoodTexture } from '@/components/game/BoardCraft';
import * as THREE from 'three';
import { RaceState, RaceMove } from '@/lib/ancient/raceEngine';

interface Props {
  state: RaceState;
  myMoves: RaceMove[];
  onMove: (m: RaceMove) => void;
  /** Visual options. */
  tileColor?: string;
  specialColor?: string;
  baseColor?: string;
  surfaceColor?: string;
  tileSize?: number;
}

export function RaceBoard3D({
  state,
  myMoves,
  onMove,
  tileColor = '#C9A877',
  specialColor = '#B5651D',
  baseColor = '#3B2412',
  surfaceColor = '#5D3A1F',
  tileSize = 0.85,
}: Props) {
  const targets = new Map<number, RaceMove>();
  myMoves.forEach((m) => { if (m.to < state.cfg.pathLength) targets.set(m.to, m); });

  // Compute bounding box for base plinth
  const xs = state.cfg.layout.map((s) => s.x);
  const zs = state.cfg.layout.map((s) => s.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const sizeX = maxX - minX + 2;
  const sizeZ = maxZ - minZ + 2;
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;

  return (
    <group>
      <mesh position={[cx, -0.18, cz]} receiveShadow>
        <boxGeometry args={[sizeX + 0.6, 0.3, sizeZ + 0.6]} />
        <meshStandardMaterial color={baseColor} map={getWoodTexture()} bumpMap={getWoodTexture()} bumpScale={.012} roughness={0.9} />
      </mesh>
      <mesh position={[cx, -0.02, cz]} receiveShadow>
        <boxGeometry args={[sizeX, 0.1, sizeZ]} />
        <meshStandardMaterial color={surfaceColor} map={getWoodTexture()} bumpMap={getWoodTexture()} bumpScale={.012} roughness={0.7} />
      </mesh>

      {state.cfg.layout.map((sq) => {
        const isSpecial = state.cfg.specialIndices?.includes(sq.index);
        const target = targets.get(sq.index);
        const def = state.cfg.squares[sq.index];
        return (
          <group key={sq.index}>
            <mesh
              position={[sq.x, 0.06, sq.z]}
              receiveShadow
              onClick={(e) => { e.stopPropagation(); if (target) onMove(target); }}
            >
              <boxGeometry args={[tileSize, 0.04, tileSize]} />
              <meshStandardMaterial
                color={isSpecial ? specialColor : tileColor}
                roughness={0.55}
                emissive={target ? '#c6b678' : '#000'}
                emissiveIntensity={target ? 0.12 : 0}
              />
            </mesh>
            {def?.extraRoll && (
              <Text position={[sq.x, 0.1, sq.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#FFD700" anchorX="center" anchorY="middle">✦</Text>
            )}
            {def?.safe && !def?.extraRoll && (
              <Text position={[sq.x, 0.1, sq.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#88ddff" anchorX="center" anchorY="middle">◆</Text>
            )}
            {target && (
              <mesh position={[sq.x, 0.18, sq.z]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#dfc885" emissive="#dfc885" emissiveIntensity={0.7} transparent opacity={0.85} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Tokens on path */}
      {(['white', 'black'] as const).map((who) => (
        (who === 'white' ? state.white : state.black).map((p, i) => {
          if (p < 0 || p >= state.cfg.pathLength) return null;
          const sq = state.cfg.layout.find((s) => s.index === p);
          if (!sq) return null;
          // small offset so two tokens at same square don't fully overlap (rare since rules block)
          const offset = (who === 'white' ? -0.05 : 0.05);
          return (
            <RaceToken
              key={`${who}-${i}`}
              position={[sq.x + offset, 0.2, sq.z]}
              who={who}
            />
          );
        })
      ))}

      {/* Start pool: left side of board */}
      {state.white.filter((p) => p === -1).map((_, i) => (
        <RaceToken key={`wp-${i}`} small position={[minX - 1.2, 0.15, minZ + i * 0.3]} who="white" />
      ))}
      {state.black.filter((p) => p === -1).map((_, i) => (
        <RaceToken key={`bp-${i}`} small position={[minX - 1.2, 0.15, maxZ - i * 0.3]} who="black" />
      ))}
      {/* Off pool: right side */}
      {state.white.filter((p) => p === state.cfg.pathLength).map((_, i) => (
        <RaceToken key={`wo-${i}`} small position={[maxX + 1.2, 0.15, minZ + i * 0.3]} who="white" />
      ))}
      {state.black.filter((p) => p === state.cfg.pathLength).map((_, i) => (
        <RaceToken key={`bo-${i}`} small position={[maxX + 1.2, 0.15, maxZ - i * 0.3]} who="black" />
      ))}
    </group>
  );
}

function RaceToken({
  position, who, small = false,
}: { position: [number, number, number]; who: 'white' | 'black'; small?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef(new THREE.Vector3(...position));
  const end = useRef(new THREE.Vector3(...position));
  const cur = useRef(new THREE.Vector3(...position));
  const progress = useRef(1);

  useEffect(() => {
    const np = new THREE.Vector3(...position);
    if (!np.equals(end.current)) {
      start.current.copy(cur.current);
      end.current.copy(np);
      progress.current = 0;
    }
  }, [position[0], position[1], position[2]]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt / 0.45);
      const e = progress.current < 0.5 ? 4 * progress.current ** 3 : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;
      cur.current.lerpVectors(start.current, end.current, e);
      const arc = Math.sin(e * Math.PI) * 0.4;
      ref.current.position.set(cur.current.x, cur.current.y + arc, cur.current.z);
    } else ref.current.position.copy(cur.current);
  });

  const color = who === 'white' ? '#F5EAD0' : '#1a1a1a';
  const r = small ? 0.15 : 0.28;
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r * 1.1, small ? 0.1 : 0.18, 32]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} />
      </mesh>
    </group>
  );
}
