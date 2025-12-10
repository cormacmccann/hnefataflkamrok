import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CaptureParticlesProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}

export function CaptureParticles({ position, color, onComplete }: CaptureParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const duration = 1.5;

  const { positions, velocities, particleCount } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const vel: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1] + 0.3;
      pos[i * 3 + 2] = position[2];

      // Random explosion direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1 + Math.random() * 2;
      vel.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed + 1.5, // Upward bias
        Math.sin(phi) * Math.sin(theta) * speed
      ));
    }

    return { positions: pos, velocities: vel, particleCount: count };
  }, [position]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    timeRef.current += delta;
    const progress = timeRef.current / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i].x * delta;
      posArray[i * 3 + 1] += velocities[i].y * delta - 4 * delta * timeRef.current; // Gravity
      posArray[i * 3 + 2] += velocities[i].z * delta;
    }

    positionAttribute.needsUpdate = true;

    // Fade out
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - progress;
    material.size = 0.12 * (1 - progress * 0.5);
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.12}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
