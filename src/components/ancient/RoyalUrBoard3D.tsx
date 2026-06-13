import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  UrState, UrMove, SquareId, SQUARE_COORDS, ROSETTE_SQUARES,
  WHITE_PATH, BLACK_PATH,
} from '@/lib/ancient/royalUr';

interface Props {
  state: UrState;
  myMoves: UrMove[];
  onMove: (m: UrMove) => void;
}

const SQ = 1.1;
const COLS = 8;
const ROWS = 3;
const X_OFFSET = (COLS * SQ) / 2 - SQ / 2;
const Z_OFFSET = (ROWS * SQ) / 2 - SQ / 2;

const ALL_SQUARES: SquareId[] = Object.keys(SQUARE_COORDS) as SquareId[];

export function RoyalUrBoard3D({ state, myMoves, onMove }: Props) {
  const targets = new Map<SquareId, UrMove>();
  myMoves.forEach((m) => {
    if (m.toPathIdx < 14) targets.set(WHITE_PATH[m.toPathIdx], m);
  });

  // Group pieces by square
  type Tok = { who: 'white' | 'black'; idx: number };
  const tokenAt = (sq: SquareId): Tok | null => {
    for (let i = 0; i < state.white.length; i++) {
      const p = state.white[i];
      if (p >= 0 && p < 14 && WHITE_PATH[p] === sq) return { who: 'white', idx: i };
    }
    for (let i = 0; i < state.black.length; i++) {
      const p = state.black[i];
      if (p >= 0 && p < 14 && BLACK_PATH[p] === sq) return { who: 'black', idx: i };
    }
    return null;
  };

  // Bear-off and pool positions (off-board)
  const wStartCount = state.white.filter((p) => p === -1).length;
  const wOffCount = state.white.filter((p) => p === 14).length;
  const bStartCount = state.black.filter((p) => p === -1).length;
  const bOffCount = state.black.filter((p) => p === 14).length;

  const boardW = COLS * SQ + 0.6;
  const boardD = ROWS * SQ + 0.6;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[boardW + 1.2, 0.3, boardD + 1.2]} />
        <meshStandardMaterial color="#3B2412" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[boardW, 0.1, boardD]} />
        <meshStandardMaterial color="#5D3A1F" roughness={0.7} />
      </mesh>

      {/* Squares */}
      {ALL_SQUARES.map((sq) => {
        const { row, col } = SQUARE_COORDS[sq];
        const x = col * SQ - X_OFFSET;
        const z = row * SQ - Z_OFFSET;
        const isRosette = ROSETTE_SQUARES.has(sq);
        const target = targets.get(sq);
        return (
          <group key={sq}>
            <mesh
              position={[x, 0.06, z]}
              receiveShadow
              onClick={(e) => { e.stopPropagation(); if (target) onMove(target); }}
            >
              <boxGeometry args={[SQ - 0.06, 0.04, SQ - 0.06]} />
              <meshStandardMaterial
                color={isRosette ? '#B5651D' : '#C9A877'}
                roughness={0.55}
                emissive={target ? '#22ff22' : '#000000'}
                emissiveIntensity={target ? 0.4 : 0}
              />
            </mesh>
            {isRosette && (
              <Text
                position={[x, 0.10, z]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.6}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
              >
                ✦
              </Text>
            )}
            {target && (
              <mesh position={[x, 0.18, z]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#44ff44" emissive="#22ff22" emissiveIntensity={0.6} transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* On-board tokens */}
      {ALL_SQUARES.map((sq) => {
        const tok = tokenAt(sq);
        if (!tok) return null;
        const { row, col } = SQUARE_COORDS[sq];
        const x = col * SQ - X_OFFSET;
        const z = row * SQ - Z_OFFSET;
        return (
          <UrToken
            key={`${tok.who}-${tok.idx}`}
            position={[x, 0.2, z]}
            who={tok.who}
          />
        );
      })}

      {/* Pool: start (left) */}
      {Array.from({ length: wStartCount }).map((_, i) => (
        <UrToken key={`ws-${i}`} position={[-X_OFFSET - 1.2, 0.2, -Z_OFFSET + i * 0.35]} who="white" small />
      ))}
      {Array.from({ length: bStartCount }).map((_, i) => (
        <UrToken key={`bs-${i}`} position={[-X_OFFSET - 1.2, 0.2, Z_OFFSET - i * 0.35]} who="black" small />
      ))}
      {/* Pool: off (right) */}
      {Array.from({ length: wOffCount }).map((_, i) => (
        <UrToken key={`wo-${i}`} position={[X_OFFSET + 1.2, 0.2, -Z_OFFSET + i * 0.35]} who="white" small />
      ))}
      {Array.from({ length: bOffCount }).map((_, i) => (
        <UrToken key={`bo-${i}`} position={[X_OFFSET + 1.2, 0.2, Z_OFFSET - i * 0.35]} who="black" small />
      ))}
    </group>
  );
}

function UrToken({
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
    } else {
      ref.current.position.copy(cur.current);
    }
  });

  const color = who === 'white' ? '#F5EAD0' : '#1a1a1a';
  const r = small ? 0.15 : 0.3;
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r * 1.1, small ? 0.1 : 0.18, 32]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} />
      </mesh>
    </group>
  );
}
