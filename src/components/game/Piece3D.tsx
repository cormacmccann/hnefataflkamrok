import { useRef, useState, useEffect, useMemo } from 'react';
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

// Easing function for smooth animation (ease-out cubic)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Easing function for smooth start and end (ease-in-out cubic)
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function Piece3D({ piece, position, isSelected, onClick }: Piece3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation state
  const animationRef = useRef({
    startPos: new THREE.Vector3(...position),
    endPos: new THREE.Vector3(...position),
    currentPos: new THREE.Vector3(...position),
    progress: 1, // 0 to 1, 1 = animation complete
    isAnimating: false,
    duration: 0.4, // Animation duration in seconds
  });
  
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

  // Detect position change and start animation
  useEffect(() => {
    const newPos = new THREE.Vector3(...position);
    const currentEnd = animationRef.current.endPos;
    
    // Check if position actually changed
    if (!newPos.equals(currentEnd)) {
      const anim = animationRef.current;
      anim.startPos.copy(anim.currentPos);
      anim.endPos.copy(newPos);
      anim.progress = 0;
      anim.isAnimating = true;
    }
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

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const anim = animationRef.current;

    // Handle smooth movement animation with easing
    if (anim.isAnimating && anim.progress < 1) {
      anim.progress = Math.min(1, anim.progress + delta / anim.duration);
      const easedProgress = easeInOutCubic(anim.progress);
      
      // Interpolate position with easing
      anim.currentPos.lerpVectors(anim.startPos, anim.endPos, easedProgress);
      
      // Add arc motion (slight hop) for more natural movement
      const arcHeight = 0.3;
      const arcProgress = Math.sin(easedProgress * Math.PI);
      
      if (anim.progress >= 1) {
        anim.isAnimating = false;
        anim.currentPos.copy(anim.endPos);
      }
      
      // Apply position with arc
      meshRef.current.position.set(
        anim.currentPos.x,
        anim.currentPos.y + arcProgress * arcHeight,
        anim.currentPos.z
      );
    } else if (isSelected) {
      // Floating effect for selected pieces
      meshRef.current.position.set(
        anim.currentPos.x,
        anim.currentPos.y + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05,
        anim.currentPos.z
      );
      meshRef.current.rotation.y += 0.02;
    } else {
      // Idle state
      meshRef.current.position.copy(anim.currentPos);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }

    // Hover scale effect with smooth easing
    const targetScale = hovered && !isSelected ? 1.1 : 1;
    const currentScale = meshRef.current.scale.x;
    const scaleSpeed = 0.15;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, scaleSpeed);
    meshRef.current.scale.setScalar(newScale);
  });

  // Clone the scene for each instance with memoization
  const clonedScene = useMemo(() => {
    const scene = getModel().clone();
    return scene;
  }, [piece.type, defenderGltf, attackerGltf, kingGltf]);
  
  // Apply materials to the cloned scene
  useEffect(() => {
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
  }, [clonedScene, isSelected, hovered, piece.type]);

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
