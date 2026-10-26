import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useMemo } from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
import { MehenState, MehenMove, mehenSpiralLayout } from '@/lib/ancient/mehenEngine';
import { getWoodTexture, InlayLabel } from '@/components/game/BoardCraft';

export function MehenBoard3D({ state, myMoves, selectedPieceId, onSelectPiece, onSelectMove }: {
  state: MehenState; myMoves: MehenMove[]; selectedPieceId: string | null;
  onSelectPiece: (id: string | null) => void; onSelectMove: (move: MehenMove) => void;
}) {
  const { tr } = useUiTranslation();
  const layout = useMemo(() => mehenSpiralLayout(state.N, 0, 0, 4.2, .45, 3.2), [state.N]);
  const curve = useMemo(() => new CatmullRomCurve3(layout.map(p => new Vector3(p.x,.12,p.y))), [layout]);
  const selectedMoves = myMoves.filter(m => m.pieceId === selectedPieceId);
  return <group>
    <mesh position={[0,-.19,0]} receiveShadow castShadow><cylinderGeometry args={[5.1,5.16,.42,96]} /><meshStandardMaterial color="#9e8253" roughness={.89} map={getWoodTexture()} bumpMap={getWoodTexture()} bumpScale={.015} /></mesh>
    <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[4.82,.025,8,96]} /><meshStandardMaterial color="#4e4026" roughness={.8} /></mesh>
    <mesh receiveShadow castShadow><tubeGeometry args={[curve,256,.2,10,false]} /><meshStandardMaterial color="#af8e53" roughness={.88} bumpMap={getWoodTexture()} bumpScale={.01} /></mesh>
    {layout.map((p,i) => {
      const target=selectedMoves.find(m=>m.toPos===i&&m.kind!=='returnHome');
      return <group key={i} position={[p.x,.335,p.y]} onClick={e=>{e.stopPropagation();if(target)onSelectMove(target);}}>
        <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.11,target ? .2 : .14,20]} /><meshStandardMaterial color={target?'#d6ddb3':'#604b2b'} roughness={.9} /></mesh>
      </group>;
    })}
    {state.pieces.filter(p=>p.status==='in'||p.status==='out').map((piece)=>{
      const p=layout[piece.pos];
      const same=state.pieces.filter(x=>x.pos===piece.pos&&(x.status==='in'||x.status==='out'));
      const idx=same.findIndex(x=>x.id===piece.id),angle=idx*Math.PI*2/same.length;
      const offset=same.length>1?.14:0;
      const selected=piece.id===selectedPieceId;
      return <group key={piece.id} position={[p.x+Math.cos(angle)*offset,.45,p.y+Math.sin(angle)*offset]} onClick={e=>{e.stopPropagation();if(myMoves.some(m=>m.pieceId===piece.id))onSelectPiece(selected?null:piece.id);}}>
        <mesh castShadow><sphereGeometry args={[piece.kind==='lion'?.17:.12,20,14]} /><meshStandardMaterial color={state.players[piece.player].color} roughness={.5} /></mesh>
        {piece.kind==='lion'&&<mesh position={[0,.16,0]} castShadow><coneGeometry args={[.11,.16,6]} /><meshStandardMaterial color="#c7a65d" roughness={.65} metalness={.3} /></mesh>}
        {selected&&<mesh position={[0,-.1,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.17,.22,24]} /><meshStandardMaterial color="#dfc885" /></mesh>}
      </group>;
    })}
    <InlayLabel position={[0,.08,4.56]} rotation={[-Math.PI/2,0,0]} size={.24} color="#514027">{tr('MEHEN · THE COILED ONE')}</InlayLabel>
  </group>;
}
