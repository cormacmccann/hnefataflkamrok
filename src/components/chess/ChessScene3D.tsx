import { Component, ReactNode, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { FittedTableCamera, TableLighting } from '@/components/game/BoardCraft';
import type { ChessBoardProps } from './ChessBoard2D';
import { ChessBoard3D } from './ChessBoard3D';
import './chess-boards.css';

function ChessRenderFallback({ onUse2D }: { onUse2D?:()=>void }) {
  const { tr } = useUiTranslation();
  return <div className="chess-render-fallback" role="status"><p>{tr('The 3D view is unavailable on this device.')}</p>{onUse2D?<button onClick={onUse2D}>{tr('Continue in 2D')}</button>:<p>{tr('Choose 2D above to continue playing the same game.')}</p>}</div>;
}
function ContextRecovery({ onLost }: { onLost:()=>void }) {
  const { gl } = useThree();
  useEffect(()=>{const canvas=gl.domElement;const lost=(event:Event)=>{event.preventDefault();onLost();};canvas.addEventListener('webglcontextlost',lost);return()=>canvas.removeEventListener('webglcontextlost',lost);},[gl,onLost]);
  return null;
}
class ChessRenderBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export function ChessScene3D({ onUse2D, ...props }: ChessBoardProps & {onUse2D?:()=>void}) {
  const [lost,setLost]=useState(false);
  const [supported] = useState(() => {
    try {
      const probe = document.createElement('canvas');
      const context = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch { return false; }
  });
  const fallback=<ChessRenderFallback onUse2D={onUse2D} />;
  if(lost || !supported)return <div className="chess-scene-wrap">{fallback}</div>;
  return <div className="chess-scene-wrap"><ChessRenderBoundary fallback={fallback}><Canvas shadows dpr={[1,1.7]} gl={{antialias:true,alpha:true}} fallback={fallback}>
    <FittedTableCamera span={10.1} depth={10.1} direction={[0,12,8]} />
    <OrbitControls enablePan={false} enableRotate enableZoom minDistance={8} maxDistance={120} minPolarAngle={Math.PI/7} maxPolarAngle={Math.PI/2.5} target={[0,0,.55]} />
    <TableLighting span={11} /><ChessBoard3D {...props} /><ContextRecovery onLost={()=>setLost(true)} />
  </Canvas></ChessRenderBoundary></div>;
}
