import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import defenderModelUrl from '@/assets/defender-piece.glb?url';
import attackerModelUrl from '@/assets/attacker-piece.glb?url';
import kingModelUrl from '@/assets/king-piece.glb?url';

// Preload models
useGLTF.preload(defenderModelUrl);
useGLTF.preload(attackerModelUrl);
useGLTF.preload(kingModelUrl);

interface RotatingModelProps {
  type: 'king' | 'defender' | 'attacker' | 'capture' | 'victory';
}

function RotatingModel({ type }: RotatingModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const defenderGltf = useGLTF(defenderModelUrl);
  const attackerGltf = useGLTF(attackerModelUrl);
  const kingGltf = useGLTF(kingModelUrl);

  const getModelScene = () => {
    switch (type) {
      case 'king':
      case 'victory':
        return kingGltf.scene;
      case 'attacker':
      case 'capture':
        return attackerGltf.scene;
      default:
        return defenderGltf.scene;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'attacker':
      case 'capture':
        return '#2D1810';
      case 'defender':
        return '#D4B896';
      case 'king':
      case 'victory':
        return '#FFD700';
    }
  };

  const clonedScene = useMemo(() => {
    const scene = getModelScene().clone();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: getColor(),
          roughness: 0.4,
          metalness: type === 'king' || type === 'victory' ? 0.6 : 0.3,
        });
      }
    });
    return scene;
  }, [type, defenderGltf, attackerGltf, kingGltf]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} scale={1.2} />
    </group>
  );
}

function FallbackBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
      <meshStandardMaterial color="#D4B896" />
    </mesh>
  );
}

interface PiecePreview3DProps {
  type: 'king' | 'defender' | 'attacker' | 'capture' | 'victory';
  className?: string;
}

export function PiecePreview3D({ type, className = '' }: PiecePreview3DProps) {
  return (
    <div className={`w-32 h-32 ${className}`}>
      <Canvas camera={{ position: [0, 2, 4], fov: 35 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 3, -5]} intensity={0.4} color="#ffcc88" />
        <Suspense fallback={<FallbackBox />}>
          <RotatingModel type={type} />
        </Suspense>
      </Canvas>
    </div>
  );
}
