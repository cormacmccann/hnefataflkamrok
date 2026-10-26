import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Piece } from '@/types/game';
import * as THREE from 'three';
import { getWoodTexture } from './BoardCraft';
import defenderModelUrl from '@/assets/defender-piece-geometry.glb?url';
import attackerModelUrl from '@/assets/attacker-piece-geometry.glb?url';
import kingModelUrl from '@/assets/king-piece-geometry.glb?url';

interface Piece3DProps {
  piece: Piece; position: [number, number, number]; isSelected: boolean; onClick: () => void;
  boardType?: 'square' | 'circular';
}

export function Piece3D({ piece, position, isSelected, onClick, boardType = 'square' }: Piece3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = position;
  const modelUrl = piece.type === 'attacker' ? attackerModelUrl : piece.type === 'king' ? kingModelUrl : defenderModelUrl;
  const { scene: sourceScene } = useGLTF(modelUrl);
  const reducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const animation = useRef({ from: new THREE.Vector3(...position), to: new THREE.Vector3(...position), current: new THREE.Vector3(...position), progress: 1 });
  const color = piece.type === 'attacker' ? '#473124' : piece.type === 'king' ? '#bc9b5e' : '#e0cfad';
  const clonedScene = useMemo(() => {
    const scene = sourceScene.clone();
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color, roughness: piece.type === 'king' ? .47 : .64,
          metalness: piece.type === 'king' ? .62 : 0, map: piece.type === 'king' ? null : getWoodTexture(),
          bumpMap: getWoodTexture(), bumpScale: .006 });
        child.castShadow = true; child.receiveShadow = true;
      }
    });
    return scene;
  }, [piece.type, sourceScene, color]);

  useEffect(() => () => {
    clonedScene.traverse(child => { if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) child.material.dispose(); });
  }, [clonedScene]);

  useEffect(() => {
    const next = new THREE.Vector3(x, y, z), anim = animation.current;
    if (!next.equals(anim.to)) { anim.from.copy(anim.current); anim.to.copy(next); anim.progress = reducedMotion ? 1 : 0; }
  }, [x, y, z, reducedMotion]);

  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  useEffect(() => {
    clonedScene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.set(isSelected ? '#8b6b35' : '#000000');
        child.material.emissiveIntensity = isSelected ? .15 : 0;
      }
    });
  }, [clonedScene, isSelected]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const anim = animation.current;
    anim.progress = Math.min(1, anim.progress + delta / .33);
    const eased = anim.progress < .5 ? 4 * anim.progress ** 3 : 1 - (-2 * anim.progress + 2) ** 3 / 2;
    anim.current.lerpVectors(anim.from, anim.to, eased);
    const lift = Math.sin(eased * Math.PI) * .12 + (isSelected ? .055 : 0);
    groupRef.current.position.set(anim.current.x, anim.current.y + lift, anim.current.z);
    groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, hovered ? 1.035 : 1, 14, delta));
  });

  const scale = (piece.type === 'king' ? .5 : .4) * (boardType === 'circular' ? .83 : 1);
  return <group ref={groupRef} position={position}
    onClick={e => { e.stopPropagation(); onClick(); }}
    onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}>
    <primitive object={clonedScene} scale={scale} />
    {isSelected && <mesh position={[0, -.035, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <ringGeometry args={[.35, .39, 40]} />
      <meshStandardMaterial color="#d5bd7e" metalness={.5} roughness={.5} />
    </mesh>}
  </group>;
}
