import { useRef } from 'react';
import { GameState, Position, BoardTheme } from '@/types/game';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Piece3D } from './Piece3D';
import { RUNES } from '@/constants/game';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface Board3DProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
  theme?: BoardTheme;
}

// Default theme (Scandinavian)
const DEFAULT_THEME: BoardTheme = {
  boardBase: '#4A3728',
  boardFrame: '#5D4037',
  squareLight: '#C4A574',
  squareDark: '#8B7355',
  corner: '#8B6914',
  throne: '#6B4423',
  circularFrame: '#3D2817',
  accentRing: '#CD7F32',
  runeColor: '#FFD700',
};

export function Board3D({ gameState, onSquareClick, onPieceClick, theme = DEFAULT_THEME }: Board3DProps) {
  const { pieces, selectedPiece, validMoves, boardSize } = gameState;
  const logic = useGameLogic(boardSize);
  const boardRef = useRef<THREE.Group>(null);

  const squareSize = 1;
  const boardWidth = boardSize * squareSize;
  const offset = boardWidth / 2 - squareSize / 2;

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col);
  };

  const getPieceAt = (row: number, col: number) => {
    return pieces.find(p => p.position.row === row && p.position.col === col);
  };

  const isSelected = (row: number, col: number) => {
    return selectedPiece?.position.row === row && selectedPiece?.position.col === col;
  };

  const getSquareColor = (row: number, col: number) => {
    const pos = { row, col };
    if (logic.isCorner(pos)) return theme.corner;
    if (logic.isThrone(pos)) return theme.throne;
    return (row + col) % 2 === 0 ? theme.squareLight : theme.squareDark;
  };

  const circularFrameRadius = (boardWidth / 2) + 0.8;
  const runeCount = boardSize === 7 ? 8 : boardSize === 9 ? 12 : 16;

  return (
    <group ref={boardRef}>
      {/* Circular decorative frame */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[circularFrameRadius - 0.3, circularFrameRadius + 0.3, 64]} />
        <meshStandardMaterial color={theme.circularFrame} roughness={0.7} />
      </mesh>
      
      {/* Outer accent ring */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[circularFrameRadius + 0.25, circularFrameRadius + 0.35, 64]} />
        <meshStandardMaterial color={theme.accentRing} emissive={theme.accentRing} emissiveIntensity={0.2} roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Inner accent ring */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[circularFrameRadius - 0.35, circularFrameRadius - 0.25, 64]} />
        <meshStandardMaterial color={theme.accentRing} emissive={theme.accentRing} emissiveIntensity={0.2} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Runic decorations around circular frame */}
      {Array.from({ length: runeCount }).map((_, i) => {
        const angle = (i / runeCount) * Math.PI * 2;
        const x = Math.cos(angle) * circularFrameRadius;
        const z = Math.sin(angle) * circularFrameRadius;
        const rune = RUNES[i % RUNES.length];
        return (
          <Text
            key={`rune-${i}`}
            position={[x, -0.12, z]}
            rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
            fontSize={0.25}
            color={theme.runeColor}
            anchorX="center"
            anchorY="middle"
          >
            {rune}
          </Text>
        );
      })}

      {/* Board base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.5, 0.3, boardWidth + 0.5]} />
        <meshStandardMaterial color={theme.boardBase} roughness={0.8} />
      </mesh>

      {/* Board frame */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[boardWidth + 0.3, 0.1, boardWidth + 0.3]} />
        <meshStandardMaterial color={theme.boardFrame} roughness={0.7} />
      </mesh>

      {/* Squares */}
      {Array.from({ length: boardSize }).map((_, row) =>
        Array.from({ length: boardSize }).map((_, col) => {
          const x = col * squareSize - offset;
          const z = row * squareSize - offset;
          const pos = { row, col };
          const valid = isValidMove(row, col);
          const selected = isSelected(row, col);

          return (
            <group key={`${row}-${col}`}>
              <mesh
                position={[x, 0.06, z]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSquareClick({ row, col });
                }}
                receiveShadow
              >
                <boxGeometry args={[squareSize - 0.02, 0.02, squareSize - 0.02]} />
                <meshStandardMaterial 
                  color={getSquareColor(row, col)} 
                  roughness={0.6}
                  emissive={valid ? '#22ff22' : selected ? '#ffdd44' : '#000000'}
                  emissiveIntensity={valid ? 0.3 : selected ? 0.4 : 0}
                />
              </mesh>

              {/* Valid move indicator */}
              {valid && !getPieceAt(row, col) && (
                <mesh position={[x, 0.12, z]}>
                  <sphereGeometry args={[0.1, 16, 16]} />
                  <meshStandardMaterial 
                    color="#44ff44" 
                    emissive="#22ff22"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              )}

              {/* Corner rune markers */}
              {logic.isCorner(pos) && (
                <mesh position={[x, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.25, 0.35, 4]} />
                  <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
                </mesh>
              )}

              {/* Throne marker */}
              {logic.isThrone(pos) && !getPieceAt(row, col) && (
                <mesh position={[x, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.2, 0.4, 8]} />
                  <meshStandardMaterial color="#8B4513" emissive="#8B4513" emissiveIntensity={0.2} />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* Pieces */}
      {pieces.map(piece => {
        const x = piece.position.col * squareSize - offset;
        const z = piece.position.row * squareSize - offset;
        const selected = selectedPiece?.id === piece.id;

        return (
          <Piece3D
            key={piece.id}
            piece={piece}
            position={[x, 0.2, z]}
            isSelected={selected}
            onClick={() => onPieceClick(piece.id)}
          />
        );
      })}
    </group>
  );
}
