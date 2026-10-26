import { InlayLabel } from '@/components/game/BoardCraft';

/** Render board markings with a local serif font, including offline play. */
export function AncientInlayLabel({ children, position, rotation = [-Math.PI / 2, 0, 0], fontSize = .3, color = '#c5b38a' }: {
  children: string | number; position: [number, number, number]; rotation?: [number, number, number];
  fontSize?: number; color?: string; anchorX?: string; anchorY?: string;
}) {
  return <InlayLabel position={position} rotation={rotation} size={fontSize * 1.3} color={color}>{String(children)}</InlayLabel>;
}
