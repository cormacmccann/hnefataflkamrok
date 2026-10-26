import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// A small, deterministic grain texture: no asset download and no randomness on re-render.
let woodTexture: THREE.DataTexture | undefined;
// eslint-disable-next-line react-refresh/only-export-components
export function getWoodTexture() {
  if (woodTexture) return woodTexture;
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const drift = Math.sin(x * .017) * 2.4 + Math.sin(x * .041) * .7;
      const grain = Math.sin(y * .23 + drift) * .35 + Math.sin(y * .97 + drift * .4) * .09;
      const pore = Math.sin((x * 73.1 + y * 217.7)) * 43758.5453;
      const noise = (pore - Math.floor(pore)) * 3;
      const shade = 220 + grain * 9 + noise;
      const i = (y * size + x) * 4;
      data[i] = shade; data[i + 1] = shade * .91; data[i + 2] = shade * .77; data[i + 3] = 255;
    }
  }
  woodTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.needsUpdate = true;
  return woodTexture;
}

/** Local-font surface engraving, without a runtime CDN font dependency. */
export function InlayLabel({ children, position, rotation = [-Math.PI / 2, 0, 0], size = .3, color = '#bca578' }: {
  children: string; position: [number, number, number]; rotation?: [number, number, number]; size?: number; color?: string;
}) {
  const { tr } = useUiTranslation();
  const label = tr(children);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(128 * Math.max(2, label.length * .8)); canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.font = '600 86px Georgia, serif';
    ctx.fillText(label, canvas.width / 2, 69, canvas.width - 14);
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [label, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position} rotation={rotation} raycast={() => null}>
    <planeGeometry args={[size * Math.max(2, label.length * .8), size]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>;
}

export function FittedTableCamera({ span = 12, depth = span, direction = [0, 12, 8] }: {
  span?: number; depth?: number; direction?: [number, number, number];
}) {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  const [cameraX, cameraY, cameraZ] = direction;
  useLayoutEffect(() => {
    if (!ref.current || !size.width || !size.height) return;
    const aspect = size.width / size.height;
    const vector = new THREE.Vector3(cameraX, cameraY, cameraZ).normalize();
    const projectedDepth = depth * vector.y + 1.2;
    const tangent = Math.tan(42 * Math.PI / 360);
    const nearEdgeAllowance = depth * Math.abs(vector.z) / 2;
    const distance = Math.max(span / (2 * tangent * aspect) + nearEdgeAllowance, projectedDepth / (2 * tangent)) * 1.13;
    ref.current.position.copy(vector.multiplyScalar(distance));
    ref.current.lookAt(0, 0, .55);
    ref.current.updateProjectionMatrix();
  }, [size.width, size.height, span, depth, cameraX, cameraY, cameraZ]);
  return <PerspectiveCamera ref={ref} makeDefault position={direction} fov={42} near={.1} far={180} />;
}

export function TableLighting({ span = 12 }: { span?: number }) {
  return <>
    <hemisphereLight args={['#eadfc9', '#30251e', 1.35]} />
    <directionalLight position={[-5, 12, 6]} intensity={2.8} color="#ffe4bb" castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-span} shadow-camera-right={span}
      shadow-camera-top={span} shadow-camera-bottom={-span} shadow-normalBias={.025} shadow-bias={-.00025} />
    <directionalLight position={[6, 5, -8]} intensity={1.1} color="#c7d1df" />
    <mesh receiveShadow position={[0, -.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[45, 64]} />
      <meshStandardMaterial color="#32271f" map={getWoodTexture()} roughness={.88} />
    </mesh>
  </>;
}


export function SceneLoading() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return <div role="status" aria-live="polite" style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'grid', placeItems: 'center', pointerEvents: 'none', background: '#17161285' }}>
    <div style={{ padding: '22px 30px', textAlign: 'center', color: '#dfcdab', background: '#171813ed', border: '1px solid #b69a614d', maxWidth: 'calc(100% - 30px)' }}>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, marginBottom: 7 }}>Preparing the carved board</p>
      <p style={{ fontSize: 12, opacity: .8 }}>{Math.round(progress)}% · The 2D view is also available.</p>
    </div>
  </div>;
}

export function SceneUnavailable() {
  return <div role="status" style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 24, color: '#dfcdab', textAlign: 'center', background: '#171813' }}>
    <div><p style={{ fontFamily: 'Georgia, serif', fontSize: 20 }}>The 3D view is unavailable on this device.</p><p style={{ fontSize: 14, marginTop: 12 }}>Choose 2D above to continue playing the same game.</p></div>
  </div>;
}
