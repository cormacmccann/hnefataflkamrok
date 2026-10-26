import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Color, PieceSymbol, Square } from 'chess.js';
import type { ChessBoardProps } from './ChessBoard2D';
import { getWoodTexture, InlayLabel } from '@/components/game/BoardCraft';

const profiles: Record<PieceSymbol, number[][]> = {
  p: [[0,0],[.29,0],[.31,.05],[.30,.10],[.23,.14],[.19,.19],[.13,.35],[.15,.4],[.17,.44],[.1,.49],[0,.49]],
  r: [[0,0],[.31,0],[.33,.05],[.32,.11],[.26,.15],[.23,.22],[.20,.32],[.20,.59],[.26,.64],[.27,.69],[0,.69]],
  n: [[0,0],[.31,0],[.33,.06],[.31,.12],[.24,.17],[.22,.24],[.23,.29],[0,.29]],
  b: [[0,0],[.32,0],[.34,.06],[.32,.12],[.26,.17],[.20,.24],[.13,.51],[.17,.57],[.22,.60],[.22,.66],[0,.66]],
  q: [[0,0],[.33,0],[.35,.06],[.33,.13],[.27,.18],[.22,.25],[.15,.63],[.18,.73],[.25,.77],[.25,.83],[0,.83]],
  k: [[0,0],[.34,0],[.36,.06],[.34,.13],[.28,.19],[.23,.27],[.16,.72],[.19,.82],[.27,.86],[.27,.92],[.18,.98],[0,.98]],
};
const turnedGeometries = new Map<PieceSymbol, THREE.LatheGeometry>();
function turnedGeometry(type: PieceSymbol) {
  if (!turnedGeometries.has(type)) turnedGeometries.set(type, new THREE.LatheGeometry(profiles[type].map(([r,y]) => new THREE.Vector2(r,y)), 40));
  return turnedGeometries.get(type)!;
}
let knightGeometry: THREE.ExtrudeGeometry | undefined;
function horseGeometry() {
  if (!knightGeometry) {
    const shape = new THREE.Shape();
    shape.moveTo(-.24,0); shape.lineTo(.23,0); shape.lineTo(.18,.20); shape.lineTo(.11,.35);
    shape.lineTo(.20,.42); shape.lineTo(.34,.43); shape.lineTo(.42,.57); shape.lineTo(.34,.7);
    shape.lineTo(.08,.86); shape.lineTo(.02,1.02); shape.lineTo(-.08,.90); shape.lineTo(-.18,.91);
    shape.quadraticCurveTo(-.38,.73,-.29,.45); shape.lineTo(-.24,.23); shape.closePath();
    knightGeometry = new THREE.ExtrudeGeometry(shape, { depth:.24, bevelEnabled:true, bevelThickness:.025, bevelSize:.025, bevelSegments:2, steps:1 });
    knightGeometry.translate(0,0,-.12);
  }
  return knightGeometry;
}
let mitreGeometry: THREE.ExtrudeGeometry | undefined;
function bishopGeometry() {
  if (!mitreGeometry) {
    const shape = new THREE.Shape();
    shape.moveTo(0,0); shape.quadraticCurveTo(-.25,.07,-.19,.29); shape.quadraticCurveTo(-.16,.42,0,.62);
    shape.quadraticCurveTo(.06,.54,.12,.47); shape.lineTo(-.04,.24); shape.lineTo(.01,.20); shape.lineTo(.17,.40);
    shape.quadraticCurveTo(.29,.14,.15,.06); shape.quadraticCurveTo(.08,0,0,0); shape.closePath();
    mitreGeometry = new THREE.ExtrudeGeometry(shape, { depth:.18, bevelEnabled:true, bevelThickness:.045, bevelSize:.025, bevelSegments:3, steps:1 });
    mitreGeometry.translate(0,0,-.09);
  }
  return mitreGeometry;
}

function CarvedChessPiece({ type, color, orientation, selected }: { type:PieceSymbol; color:Color; orientation:Color; selected:boolean }) {
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ color:color === 'w' ? '#e4d1a8' : '#432c1c',
    map:getWoodTexture(), bumpMap:getWoodTexture(), bumpScale:.006, roughness:.57, metalness:0, clearcoat:.14, clearcoatRoughness:.6 }), [color]);
  useEffect(() => () => material.dispose(), [material]);
  const facing = (color === 'w' ? 0 : Math.PI) + (orientation === 'b' ? Math.PI : 0);
  return <group position={[0,selected ? .045 : 0,0]}>
    <mesh castShadow receiveShadow geometry={turnedGeometry(type)} material={material} dispose={null} />
    <mesh position={[0,-.015,0]}><cylinderGeometry args={[.27,.27,.025,32]} /><meshStandardMaterial color="#263c2e" roughness={1} /></mesh>
    {type === 'p' && <mesh castShadow receiveShadow position={[0,.60,0]} material={material}><sphereGeometry args={[.165,28,20]} /></mesh>}
    {type === 'n' && <group position={[0,.28,0]} rotation={[0,facing,0]} scale={.68}>
      <mesh castShadow receiveShadow geometry={horseGeometry()} material={material} dispose={null} />
      {[-1,1].map(side => <mesh key={side} position={[.16,.73,side*.145]}><sphereGeometry args={[.027,12,8]} /><meshStandardMaterial color={color==='w'?'#4c3421':'#b49a62'} roughness={.5} /></mesh>)}
    </group>}
    {type === 'b' && <group position={[0,.63,0]} rotation={[0,-Math.PI/6,0]} scale={.78}>
      <mesh castShadow receiveShadow geometry={bishopGeometry()} material={material} dispose={null} />
    </group>}
    {type === 'r' && <>
      <mesh castShadow receiveShadow position={[0,.76,0]} material={material}><cylinderGeometry args={[.28,.26,.17,40]} /></mesh>
      <mesh position={[0,.847,0]}><cylinderGeometry args={[.18,.18,.006,32]} /><meshStandardMaterial color={color==='w'?'#9c855e':'#241a13'} roughness={.9} /></mesh>
      {Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <mesh key={i} castShadow receiveShadow position={[Math.cos(a)*.23,.9,Math.sin(a)*.23]} rotation={[0,-a,0]} material={material}><boxGeometry args={[.13,.16,.15]} /></mesh>;})}
    </>}
    {type === 'q' && <>
      <mesh castShadow receiveShadow position={[0,.9,0]} material={material}><cylinderGeometry args={[.265,.19,.16,40]} /></mesh>
      {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <group key={i} position={[Math.cos(a)*.22,1.01,Math.sin(a)*.22]}>
        <mesh castShadow material={material}><coneGeometry args={[.052,.19,12]} /></mesh><mesh castShadow position={[0,.1,0]} material={material}><sphereGeometry args={[.045,14,10]} /></mesh>
      </group>;})}
      <mesh castShadow position={[0,1.025,0]} material={material}><sphereGeometry args={[.075,20,14]} /></mesh>
    </>}
    {type === 'k' && <>
      <mesh castShadow receiveShadow position={[0,1.015,0]} material={material}><sphereGeometry args={[.1,24,16]} /></mesh>
      <mesh castShadow position={[0,1.235,0]} material={material}><boxGeometry args={[.085,.38,.085]} /></mesh>
      <mesh castShadow position={[0,1.285,0]} material={material}><boxGeometry args={[.29,.085,.085]} /></mesh>
    </>}
  </group>;
}

export function ChessBoard3D({ board, selectedSquare, legalMoves, lastMove, check, turn, orientation, onSquareClick, disabled = false }: ChessBoardProps) {
  const files = orientation === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = orientation === 'w' ? '87654321' : '12345678';
  const grain = getWoodTexture();
  useEffect(() => () => { document.body.style.cursor=''; }, []);
  return <group>
    <RoundedBox args={[9.18,.5,9.18]} position={[0,-.23,0]} radius={.12} smoothness={3} castShadow receiveShadow><meshStandardMaterial color="#4d3321" map={grain} bumpMap={grain} bumpScale={.014} roughness={.64} /></RoundedBox>
    <RoundedBox args={[8.95,.13,8.95]} position={[0,.017,0]} radius={.04} smoothness={2} receiveShadow><meshStandardMaterial color="#67472a" map={grain} roughness={.65} /></RoundedBox>
    {[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}-${z}`} position={[x*4.36,.091,z*4.36]}><sphereGeometry args={[.035,12,8]} /><meshStandardMaterial color="#bda477" roughness={.48} metalness={.65} /></mesh>))}
    {Array.from({length:8},(_,row)=>Array.from({length:8},(_,col)=>{
      const square=`${files[col]}${ranks[row]}` as Square;
      const piece=board.find(p=>p.square===square),x=col-3.5,z=row-3.5;
      const dark=(square.charCodeAt(0)-97+Number(square[1])-1)%2===0;
      const selected=selectedSquare===square,legal=legalMoves.includes(square),previous=lastMove?.from===square||lastMove?.to===square;
      const checked=check&&piece?.type==='k'&&piece.color===turn;
      return <group key={square} position={[x,0,z]} onClick={e=>{e.stopPropagation();if(!disabled)onSquareClick(square);}}
        onPointerOver={e=>{if(!disabled){e.stopPropagation();document.body.style.cursor='pointer';}}} onPointerOut={()=>{document.body.style.cursor='';}}>
        <mesh position={[0,.093,0]} receiveShadow><boxGeometry args={[.993,.035,.993]} /><meshStandardMaterial color={dark?'#67462d':'#d9c194'} map={grain} bumpMap={grain} bumpScale={.006} roughness={.73} emissive={checked?'#a2392c':selected?'#c09b4d':previous?'#84743d':'#000000'} emissiveIntensity={checked?.45:selected?.30:previous?.22:0} /></mesh>
        {(selected||checked||(legal&&piece))&&<mesh position={[0,.119,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}><ringGeometry args={[.39,.43,40]} /><meshStandardMaterial color={checked?'#e5a085':selected?'#ebd29a':'#99ab7b'} roughness={.75} /></mesh>}
        {legal&&!piece&&<mesh position={[0,.12,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}><ringGeometry args={[.08,.13,28]} /><meshStandardMaterial color="#a6b18c" emissive="#607149" emissiveIntensity={.12} /></mesh>}
        {piece&&<group position={[0,.14,0]}><CarvedChessPiece type={piece.type} color={piece.color} orientation={orientation} selected={selected} /></group>}
      </group>;
    }))}
    {Array.from({length:8},(_,i)=><group key={`coordinates-${i}`}>
      <InlayLabel position={[i-3.5,.09,4.22]} size={.25} color="#cbb68e">{files[i]}</InlayLabel>
      <InlayLabel position={[-4.22,.09,i-3.5]} size={.25} color="#cbb68e">{ranks[i]}</InlayLabel>
      <InlayLabel position={[i-3.5,.09,-4.22]} size={.22} color="#cbb68e">{files[i]}</InlayLabel>
    </group>)}
  </group>;
}
