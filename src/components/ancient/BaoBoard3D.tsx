import { AncientInlayLabel as Text } from './AncientInlayLabel';
import { getWoodTexture } from '@/components/game/BoardCraft';
import { BaoState, pitToRing, NYUMBA_RING } from '@/lib/ancient/baoEngine';

export function BaoBoard3D({ state, legalPits, selectedPit, onPit }: { state: BaoState; legalPits: number[]; selectedPit: number | null; onPit: (pit: number) => void }) {
  return <group>
    <mesh position={[0,-.22,0]} receiveShadow castShadow><boxGeometry args={[10.3,.55,5.7]} /><meshStandardMaterial color="#71502e" map={getWoodTexture()} bumpMap={getWoodTexture()} bumpScale={.012} roughness={.72} /></mesh>
    <mesh position={[0,.02,0]} receiveShadow><boxGeometry args={[10.1,.08,5.5]} /><meshStandardMaterial color="#a27a43" map={getWoodTexture()} bumpMap={getWoodTexture()} bumpScale={.012} roughness={.78} /></mesh>
    {state.pits.flatMap((row,r) => row.map((seeds,c) => {
      const owner = r < 2 ? 1 : 0;
      const ring = pitToRing(owner, r, c)!;
      const legal = owner === state.turn && legalPits.includes(ring);
      const selected = owner === state.turn && selectedPit === ring;
      const x=(c-3.5)*1.08,z=(r-1.5)*1.15;
      const house = (r === 1 || r === 2) && ring === NYUMBA_RING;
      return <group key={`${r}-${c}`} position={[x,0,z]} onClick={e=>{e.stopPropagation();if(legal)onPit(ring);}}>
        <mesh position={[0,.07,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[.44,40]} /><meshStandardMaterial color="#36230f" roughness={1} /></mesh>
        <mesh position={[0,.09,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.43,.055,8,40]} /><meshStandardMaterial color={selected?'#e8cf88':legal?'#adb88a':'#815c2f'} roughness={.8} /></mesh>
        {Array.from({length:Math.min(seeds,12)},(_,i)=><mesh key={i} position={[Math.cos(i*2.4)*(.08+.017*i),.11+(i%3)*.025,Math.sin(i*2.4)*(.08+.017*i)]} castShadow><sphereGeometry args={[.065,10,8]} /><meshStandardMaterial color={i%3===0?'#cba77a':'#503a21'} roughness={.66} /></mesh>)}
        <Text position={[0,.12,.55]} rotation={[-Math.PI/2,0,0]} fontSize={.17} color="#e0d0a7">{`${house?'N · ':''}${seeds}`}</Text>
      </group>;
    }))}
    <Text position={[-4.8,.12,0]} rotation={[-Math.PI/2,0,Math.PI/2]} fontSize={.2} color="#e0d0a7">{`P1: ${state.storage[0]}`}</Text>
    <Text position={[4.8,.12,0]} rotation={[-Math.PI/2,0,-Math.PI/2]} fontSize={.2} color="#e0d0a7">{`P2: ${state.storage[1]}`}</Text>
  </group>;
}
