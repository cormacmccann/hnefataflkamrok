import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PettState, PettPos, BOARD_SIZE } from '@/lib/ancient/petteia';

interface Props {
  state: PettState;
  validTargets: PettPos[];
  onSquareClick: (row: number, col: number) => void;
}

const SQ = 1;
const OFFSET = (BOARD_SIZE * SQ) / 2 - SQ / 2;

export function PetteiaBoard3D({ state, validTargets, onSquareClick }: Props) {
  const isTarget = (r: number, c: number) => validTargets.some((p) => p.row === r && p.col === c);
  const boardWidth = BOARD_SIZE * SQ;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.6, 0.3, boardWidth + 0.6]} />
        <meshStandardMaterial color="#4A3728" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.35, 0.1, boardWidth + 0.35]} />
        <meshStandardMaterial color="#5D4037" roughness={0.7} />
      </mesh>

      {/* Squares (marble-ish for Greek feel) */}
      {Array.from({ length: BOARD_SIZE }).map((_, row) =>
        Array.from({ length: BOARD_SIZE }).map((_, col) => {
          const x = col * SQ - OFFSET;
          const z = row * SQ - OFFSET;
          const light = (row + col) % 2 === 0;
          const valid = isTarget(row, col);
          const piece = state.pieces.find((p) => p.pos.row === row && p.pos.col === col);
          const selected = piece && state.selected === piece.id;
          return (
            <mesh
              key={`${row}-${col}`}
              position={[x, 0.06, z]}
              receiveShadow
              onClick={(e) => { e.stopPropagation(); onSquareClick(row, col); }}
            >
              <boxGeometry args={[SQ - 0.02, 0.02, SQ - 0.02]} />
              <meshStandardMaterial
                color={light ? '#E5DCC5' : '#7B6B52'}
                roughness={0.5}
                emissive={valid ? '#22ff22' : selected ? '#ffdd44' : '#000000'}
                emissiveIntensity={valid ? 0.3 : selected ? 0.4 : 0}
              />
            </mesh>
          );
        })
      )}

      {/* Valid-move indicators */}
      {validTargets.map((t, i) => (
        <mesh key={`vm-${i}`} position={[t.col * SQ - OFFSET, 0.18, t.row * SQ - OFFSET]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#44ff44" emissive="#22ff22" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Pieces */}
      {state.pieces.map((p) => (
        <PettPiece3D
          key={p.id}
          position={[p.pos.col * SQ - OFFSET, 0.2, p.pos.row * SQ - OFFSET]}
          owner={p.owner}
          isSelected={state.selected === p.id}
        />
      ))}
    </group>
  );
}

function PettPiece3D({
  position, owner, isSelected,
}: { position: [number, number, number]; owner: 'white' | 'black'; isSelected: boolean }) {
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

  useFrame((s, dt) => {
    if (!ref.current) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt / 0.4);
      const e = progress.current < 0.5 ? 4 * progress.current ** 3 : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;
      cur.current.lerpVectors(start.current, end.current, e);
      const arc = Math.sin(e * Math.PI) * 0.3;
      ref.current.position.set(cur.current.x, cur.current.y + arc, cur.current.z);
    } else if (isSelected) {
      ref.current.position.set(cur.current.x, cur.current.y + 0.15 + Math.sin(s.clock.elapsedTime * 3) * 0.04, cur.current.z);
    } else {
      ref.current.position.copy(cur.current);
    }
  });

  const color = owner === 'white' ? '#F5EAD0' : '#1a1a1a';
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.18, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.45}
          metalness={0.2}
          emissive={isSelected ? '#ffaa00' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.04, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}
