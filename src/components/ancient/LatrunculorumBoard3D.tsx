import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LatState, LatPos, BOARD_SIZE } from '@/lib/ancient/latrunculorum';

interface Props {
  state: LatState;
  validTargets: LatPos[];
  onSquareClick: (row: number, col: number) => void;
}

const SQ = 1;
const OFFSET = (BOARD_SIZE * SQ) / 2 - SQ / 2;

export function LatrunculorumBoard3D({ state, validTargets, onSquareClick }: Props) {
  const isTarget = (r: number, c: number) => validTargets.some((p) => p.row === r && p.col === c);
  const boardWidth = BOARD_SIZE * SQ;

  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.8, 0.3, boardWidth + 0.8]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.35, 0.1, boardWidth + 0.35]} />
        <meshStandardMaterial color="#4a2820" roughness={0.7} />
      </mesh>

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
                color={light ? '#C9B280' : '#5C2A18'}
                roughness={0.55}
                emissive={valid ? '#ff3322' : selected ? '#ffaa22' : '#000000'}
                emissiveIntensity={valid ? 0.4 : selected ? 0.4 : 0}
              />
            </mesh>
          );
        })
      )}

      {validTargets.map((t, i) => (
        <mesh key={`vm-${i}`} position={[t.col * SQ - OFFSET, 0.18, t.row * SQ - OFFSET]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff5544" emissive="#ff2211" emissiveIntensity={0.7} transparent opacity={0.85} />
        </mesh>
      ))}

      {state.pieces.map((p) => (
        <LatPiece3D
          key={p.id}
          position={[p.pos.col * SQ - OFFSET, 0.2, p.pos.row * SQ - OFFSET]}
          owner={p.owner}
          dux={p.dux}
          isSelected={state.selected === p.id}
        />
      ))}
    </group>
  );
}

function LatPiece3D({
  position, owner, dux, isSelected,
}: { position: [number, number, number]; owner: 'white' | 'black'; dux: boolean; isSelected: boolean }) {
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
      const arc = Math.sin(e * Math.PI) * 0.35;
      ref.current.position.set(cur.current.x, cur.current.y + arc, cur.current.z);
    } else if (isSelected) {
      ref.current.position.set(cur.current.x, cur.current.y + 0.12 + Math.sin(s.clock.elapsedTime * 3) * 0.04, cur.current.z);
    } else {
      ref.current.position.copy(cur.current);
    }
  });

  const baseColor = owner === 'white' ? '#E8C77A' : '#3D2A1F';
  const accentColor = owner === 'white' ? '#FFD700' : '#8B0000';
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.36, dux ? 0.32 : 0.18, 32]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.5} emissive={isSelected ? '#ffaa00' : '#000'} emissiveIntensity={isSelected ? 0.5 : 0} />
      </mesh>
      {dux && (
        <mesh position={[0, 0.25, 0]} castShadow>
          <coneGeometry args={[0.2, 0.3, 6]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}
