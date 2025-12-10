import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Piece } from '@/types/game';
import * as THREE from 'three';

interface Piece3DProps {
  piece: Piece;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

export function Piece3D({ piece, position, isSelected, onClick }: Piece3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [targetY] = useState(position[1]);

  const getColor = () => {
    switch (piece.type) {
      case 'attacker':
        return '#2D1810';
      case 'defender':
        return '#D4B896';
      case 'king':
        return '#FFD700';
    }
  };

  const getEmissive = () => {
    if (isSelected) return '#ffaa00';
    if (hovered) return '#666666';
    return '#000000';
  };

  useFrame((state) => {
    if (!meshRef.current) return;

    // Floating animation for selected piece
    if (isSelected) {
      meshRef.current.position.y = targetY + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.rotation.y += 0.02;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }

    // Hover effect
    const targetScale = hovered && !isSelected ? 1.1 : 1;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
  });

  const height = piece.type === 'king' ? 0.6 : 0.45;
  const radius = piece.type === 'king' ? 0.35 : 0.3;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[radius * 0.8, radius, height, 32]} />
        <meshStandardMaterial
          color={getColor()}
          roughness={0.4}
          metalness={piece.type === 'king' ? 0.6 : 0.2}
          emissive={getEmissive()}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Crown for king */}
      {piece.type === 'king' && (
        <mesh position={[0, height / 2 + 0.15, 0]} castShadow>
          <coneGeometry args={[0.15, 0.2, 5]} />
          <meshStandardMaterial 
            color="#FFD700" 
            roughness={0.3} 
            metalness={0.8}
            emissive={isSelected ? '#ffaa00' : '#442200'}
            emissiveIntensity={isSelected ? 0.5 : 0.2}
          />
        </mesh>
      )}

      {/* Rune engravings for attackers */}
      {piece.type === 'attacker' && (
        <mesh position={[0, 0.1, radius + 0.01]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color="#8B4513" emissive="#8B4513" emissiveIntensity={0.1} />
        </mesh>
      )}

      {/* Selected glow ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.05, radius + 0.15, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
