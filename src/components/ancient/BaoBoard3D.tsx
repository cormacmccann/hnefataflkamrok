import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { BaoState } from '@/lib/ancient/bao';

interface Props {
  state: BaoState;
  legalMoves: number[];
  onPit: (i: number) => void;
}

const PIT_SPACING = 1.0;
// Pits 0..7 = white row at +z, pits 8..15 = black row at -z (right-to-left from black's POV)
// Visual layout: white row left-to-right at +z, black row reversed at -z so index 8 sits above index 7.
function pitPosition(i: number): [number, number] {
  if (i < 8) {
    const col = i;            // 0..7
    return [col * PIT_SPACING - (7 * PIT_SPACING) / 2, 1.0];
  } else {
    const col = 15 - i;       // black row reversed: 8→7, 15→0
    return [col * PIT_SPACING - (7 * PIT_SPACING) / 2, -1.0];
  }
}

export function BaoBoard3D({ state, legalMoves, onPit }: Props) {
  return (
    <group>
      {/* Big wooden board base */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[10, 0.4, 4]} />
        <meshStandardMaterial color="#3d2412" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[9.5, 0.1, 3.5]} />
        <meshStandardMaterial color="#5a3520" roughness={0.7} />
      </mesh>

      {/* Stores at the ends */}
      <Store position={[-4.6, 0.1, 0]} count={state.storeW} who="white" />
      <Store position={[4.6, 0.1, 0]} count={state.storeB} who="black" />

      {state.pits.map((seeds, i) => {
        const [x, z] = pitPosition(i);
        const isLegal = legalMoves.includes(i);
        const isLast = state.highlight === i;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Pit bowl */}
            <mesh
              position={[0, 0.05, 0]}
              onClick={(e) => { e.stopPropagation(); if (isLegal) onPit(i); }}
            >
              <cylinderGeometry args={[0.4, 0.36, 0.12, 32]} />
              <meshStandardMaterial
                color={i < 8 ? '#7a4a28' : '#4a2818'}
                roughness={0.6}
                emissive={isLegal ? '#22ff22' : isLast ? '#ffaa22' : '#000'}
                emissiveIntensity={isLegal ? 0.4 : isLast ? 0.35 : 0}
              />
            </mesh>
            {/* Pit number */}
            <Text position={[0, 0.13, 0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#fff8e0" anchorX="center" anchorY="middle">
              {i < 8 ? `${i + 1}` : `${16 - i}`}
            </Text>
            {/* Seeds */}
            {Array.from({ length: Math.min(seeds, 8) }).map((_, s) => {
              const angle = (s / 8) * Math.PI * 2;
              return (
                <mesh
                  key={s}
                  position={[Math.cos(angle) * 0.15, 0.15 + (s > 7 ? 0.05 : 0), Math.sin(angle) * 0.15]}
                  castShadow
                >
                  <sphereGeometry args={[0.06, 12, 12]} />
                  <meshStandardMaterial color="#3a1f0e" roughness={0.4} metalness={0.1} />
                </mesh>
              );
            })}
            {seeds > 8 && (
              <Text position={[0, 0.35, 0]} fontSize={0.2} color="#fff8e0" anchorX="center" anchorY="middle">
                {seeds}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Store({ position, count, who }: { position: [number, number, number]; count: number; who: 'white' | 'black' }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.5, 0.2, 32]} />
        <meshStandardMaterial color={who === 'white' ? '#a08055' : '#3a2515'} roughness={0.55} />
      </mesh>
      <Text position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#fff8e0" anchorX="center" anchorY="middle">
        {count}
      </Text>
    </group>
  );
}
