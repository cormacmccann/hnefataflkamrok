import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Piece } from '@/types/game';
import * as THREE from 'three';
import defenderModelUrl from '@/assets/defender-piece.glb?url';
import attackerModelUrl from '@/assets/attacker-piece.glb?url';
import kingModelUrl from '@/assets/king-piece.glb?url';

interface Piece3DProps {
  piece: Piece;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

// Preload all models
useGLTF.preload(defenderModelUrl);
useGLTF.preload(attackerModelUrl);
useGLTF.preload(kingModelUrl);

export function Piece3D({ piece, position, isSelected, onClick }: Piece3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [currentPos, setCurrentPos] = useState<THREE.Vector3>(new THREE.Vector3(...position));
  const targetPos = useRef(new THREE.Vector3(...position));
  
  // Load all models
  const defenderGltf = useGLTF(defenderModelUrl);
  const attackerGltf = useGLTF(attackerModelUrl);
  const kingGltf = useGLTF(kingModelUrl);

  // Get the appropriate model based on piece type
  const getModel = () => {
    switch (piece.type) {
      case 'attacker':
        return attackerGltf.scene;
      case 'king':
        return kingGltf.scene;
      default:
        return defenderGltf.scene;
    }
  };

  // Update target position when position prop changes
  useEffect(() => {
    targetPos.current.set(position[0], position[1], position[2]);
  }, [position[0], position[1], position[2]]);

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

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth movement animation
    const lerpFactor = 0.12;
    currentPos.lerp(targetPos.current, lerpFactor);
    
    // Apply position with floating effect for selected
    if (isSelected) {
      meshRef.current.position.set(
        currentPos.x,
        currentPos.y + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05,
        currentPos.z
      );
      meshRef.current.rotation.y += 0.02;
    } else {
      meshRef.current.position.copy(currentPos);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }

    // Hover effect
    const targetScale = hovered && !isSelected ? 1.1 : 1;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    meshRef.current.scale.setScalar(newScale);
  });

  // Clone the scene for each instance
  const clonedScene = getModel().clone();
  
  // Apply materials to the cloned scene
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: getColor(),
        roughness: 0.4,
        metalness: piece.type === 'king' ? 0.6 : 0.3,
        emissive: isSelected ? '#ffaa00' : hovered ? '#666666' : '#000000',
        emissiveIntensity: isSelected ? 0.5 : hovered ? 0.2 : 0,
      });
      child.castShadow = true;
    }
  });

  const radius = piece.type === 'king' ? 0.35 : 0.3;
  const modelScale = piece.type === 'king' ? 0.5 : 0.4;

  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive 
        object={clonedScene} 
        scale={modelScale}
        position={[0, 0, 0]}
      />

      {/* Selected glow ring */}
      {isSelected && (
        <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
