import { RoundedBox } from '@react-three/drei';
import { GameState, Position, BoardTheme } from '@/types/game';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Piece3D } from './Piece3D';
import { getWoodTexture, InlayLabel } from './BoardCraft';

interface Board3DProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
  theme?: BoardTheme;
}
const DEFAULT_THEME: BoardTheme = {
  boardBase: '#4A3728', boardFrame: '#5D4037', squareLight: '#C4A574', squareDark: '#8B7355',
  corner: '#8B6914', throne: '#6B4423', circularFrame: '#3D2817', accentRing: '#CD7F32', runeColor: '#FFD700',
};

export function Board3D({ gameState, onSquareClick, onPieceClick, theme = DEFAULT_THEME }: Board3DProps) {
  const { pieces, selectedPiece, validMoves, boardSize } = gameState;
  const logic = useGameLogic(boardSize, gameState.rules, gameState.variantId);
  const offset = boardSize / 2 - .5;
  const grain = getWoodTexture();
  const brass = '#b69a61';
  return <group>
    <RoundedBox args={[boardSize + 1.15, .56, boardSize + 1.15]} radius={.13} smoothness={3} position={[0, -.27, 0]} receiveShadow castShadow>
      <meshStandardMaterial color={theme.boardBase} map={grain} bumpMap={grain} bumpScale={.018} roughness={.64} />
    </RoundedBox>
    <RoundedBox args={[boardSize + .91, .14, boardSize + .91]} radius={.06} smoothness={2} position={[0, .005, 0]} receiveShadow>
      <meshStandardMaterial color={theme.boardFrame} map={grain} roughness={.65} />
    </RoundedBox>
    {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}-${z}`} position={[x * (boardSize / 2 + .34), .083, z * (boardSize / 2 + .34)]} rotation={[-Math.PI / 2, 0, 0]}>
      <sphereGeometry args={[.045, 12, 8]} /><meshStandardMaterial color={brass} roughness={.42} metalness={.72} />
    </mesh>))}
    {Array.from({ length: boardSize }, (_, row) => Array.from({ length: boardSize }, (_, col) => {
      const pos = { row, col };
      const x = col - offset, z = row - offset;
      const valid = validMoves.some(m => m.row === row && m.col === col);
      const selected = selectedPiece?.position.row === row && selectedPiece?.position.col === col;
      const corner = !gameState.rules?.edgeEscape && logic.isCorner(pos), throne = logic.isThrone(pos);
      const color = corner ? theme.corner : throne ? theme.throne : (row + col) % 2 === 0 ? theme.squareLight : theme.squareDark;
      return <group key={`${row}-${col}`}>
        <mesh position={[x, .09, z]} receiveShadow onClick={e => { e.stopPropagation(); onSquareClick(pos); }}>
          <boxGeometry args={[.987, .035, .987]} />
          <meshStandardMaterial color={color} map={grain} bumpMap={grain} bumpScale={.009} roughness={.7}
            emissive={selected ? '#9b7335' : '#000000'} emissiveIntensity={selected ? .2 : 0} />
        </mesh>
        {(corner || throne) && <mesh position={[x, .113, z]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} raycast={() => null}>
          <ringGeometry args={[throne ? .27 : .23, throne ? .30 : .26, corner ? 4 : 8]} />
          <meshStandardMaterial color={brass} metalness={.65} roughness={.5} />
        </mesh>}
        {valid && <mesh position={[x, .123, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[.09, .14, 24]} />
          <meshStandardMaterial color="#e1d39b" emissive="#a69355" emissiveIntensity={.28} />
        </mesh>}
      </group>;
    }))}
    {Array.from({ length: boardSize }, (_, i) => <group key={`coordinate-${i}`}>
      <InlayLabel position={[i - offset, .082, -boardSize / 2 - .25]} size={.22} color="#ccb58b">{String.fromCharCode(97 + i)}</InlayLabel>
      <InlayLabel position={[-boardSize / 2 - .25, .082, i - offset]} size={.22} color="#ccb58b">{String(boardSize - i)}</InlayLabel>
    </group>)}
    {pieces.map(piece => <Piece3D key={piece.id} piece={piece}
      position={[piece.position.col - offset, .17, piece.position.row - offset]}
      isSelected={selectedPiece?.id === piece.id} onClick={() => onPieceClick(piece.id)} />)}
  </group>;
}
