import { useRef, useMemo } from 'react';
import { Group, Vector3 } from 'three';
import { GameState, FidchellPosition, BoardTheme } from '@/types/game';
import { FIDCHELL_CONFIG, OGHAM } from '@/constants/game';
import { Piece3D } from './Piece3D';
import { Text } from '@react-three/drei';

interface CircularBoard3DProps {
  gameState: GameState;
  onNodeClick: (position: FidchellPosition) => void;
  onPieceClick: (pieceId: string) => void;
  theme?: BoardTheme;
  connectionPath?: FidchellPosition[];
}

// Convert circular position to 3D coordinates
function circularToWorld(pos: FidchellPosition, scale: number = 1): Vector3 {
  if (pos.ring === 0) {
    return new Vector3(0, 0, 0);
  }
  const angle = (pos.spoke / 16) * Math.PI * 2 - Math.PI / 2;
  const radius = pos.ring * scale;
  return new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

// Check if position is on outer ring (edge)
function isEdgePosition(pos: FidchellPosition): boolean {
  return pos.ring === FIDCHELL_CONFIG.rings - 1;
}

export function CircularBoard3D({ 
  gameState, 
  onNodeClick, 
  onPieceClick,
  theme,
  connectionPath = []
}: CircularBoard3DProps) {
  const groupRef = useRef<Group>(null);
  const ringScale = 1.2;

  // Generate all node positions
  const nodes = useMemo(() => {
    const result: FidchellPosition[] = [{ ring: 0, spoke: 0 }]; // Center (Navel)
    for (let ring = 1; ring < FIDCHELL_CONFIG.rings; ring++) {
      for (let spoke = 0; spoke < FIDCHELL_CONFIG.spokes; spoke++) {
        result.push({ ring, spoke });
      }
    }
    return result;
  }, []);

  // Check if a node is in the connection path
  const isInConnectionPath = (pos: FidchellPosition) => {
    return connectionPath.some(p => p.ring === pos.ring && p.spoke === pos.spoke);
  };

  // Find piece at position
  const getPieceAtPosition = (pos: FidchellPosition) => {
    return gameState.pieces.find(p => 
      p.circularPosition?.ring === pos.ring && 
      p.circularPosition?.spoke === pos.spoke
    );
  };

  // Check if position is a valid move
  const isValidMove = (pos: FidchellPosition) => {
    // Convert to linear position for compatibility
    return gameState.validMoves.some(m => {
      // For circular board, row encodes ring, col encodes spoke
      return m.row === pos.ring && m.col === pos.spoke;
    });
  };

  const baseColor = theme?.boardBase || '#1A1428';
  const accentColor = theme?.accentRing || '#9F7AEA';
  const runeColor = theme?.runeColor || '#DDA0DD';
  const throneColor = theme?.throne || '#6B4EAB';

  return (
    <group ref={groupRef}>
      {/* Board base - circular platform */}
      {/* NOTE: CylinderGeometry is already Y-up (height on Y), so it should NOT be rotated. */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.2, 0.3, 64]} />
        <meshStandardMaterial color={baseColor} roughness={0.8} />
      </mesh>

      {/* Decorative outer rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <torusGeometry args={[5.8, 0.15, 16, 64]} />
        <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Concentric rings */}
      {Array.from({ length: FIDCHELL_CONFIG.rings }).map((_, ringIdx) => (
        <mesh 
          key={`ring-${ringIdx}`} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.06, 0]}
        >
          <torusGeometry args={[ringIdx * ringScale, 0.03, 8, 64]} />
          <meshStandardMaterial 
            color={ringIdx === 0 ? throneColor : accentColor} 
            metalness={0.4} 
            roughness={0.5}
            emissive={ringIdx === 0 ? throneColor : undefined}
            emissiveIntensity={ringIdx === 0 ? 0.3 : 0}
          />
        </mesh>
      ))}

      {/* Radial spokes */}
      {Array.from({ length: FIDCHELL_CONFIG.spokes }).map((_, spokeIdx) => {
        const angle = (spokeIdx / 16) * Math.PI * 2 - Math.PI / 2;
        const length = (FIDCHELL_CONFIG.rings - 1) * ringScale;
        return (
          <mesh 
            key={`spoke-${spokeIdx}`}
            position={[
              Math.cos(angle) * length / 2,
              0.06,
              Math.sin(angle) * length / 2
            ]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[length, 0.03, 0.04]} />
            <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Center Navel Stone - sacred center */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#9F7AEA"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial 
          color={throneColor} 
          metalness={0.5} 
          emissive={throneColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Ogham script around outer edge */}
      {OGHAM.slice(0, 16).map((char, idx) => {
        const angle = (idx / 16) * Math.PI * 2 - Math.PI / 2;
        const radius = 5.3;
        return (
          <Text
            key={`ogham-${idx}`}
            position={[
              Math.cos(angle) * radius,
              0.1,
              Math.sin(angle) * radius
            ]}
            rotation={[-Math.PI / 2, 0, -angle + Math.PI]}
            fontSize={0.3}
            color={runeColor}
            anchorX="center"
            anchorY="middle"
          >
            {char}
          </Text>
        );
      })}

      {/* Node intersection points (clickable) */}
      {nodes.map((nodePos, idx) => {
        const worldPos = circularToWorld(nodePos, ringScale);
        const piece = getPieceAtPosition(nodePos);
        const isValid = isValidMove(nodePos);
        const isPath = isInConnectionPath(nodePos);
        const isEdge = isEdgePosition(nodePos);
        const isNavel = nodePos.ring === 0;

        return (
          <group key={`node-${idx}`} position={[worldPos.x, 0, worldPos.z]}>
            {/* Node marker (if no piece) */}
            {!piece && !isNavel && (
              <mesh 
                position={[0, 0.02, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(nodePos);
                }}
              >
                <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
                <meshStandardMaterial 
                  color={isValid ? '#22C55E' : isPath ? '#9F7AEA' : isEdge ? '#C0C0C0' : '#4A3D6A'}
                  emissive={isValid ? '#22C55E' : isPath ? '#9F7AEA' : undefined}
                  emissiveIntensity={isValid || isPath ? 0.5 : 0}
                  transparent={!isValid && !isPath}
                  opacity={isValid || isPath ? 1 : 0.6}
                />
              </mesh>
            )}

            {/* Valid move indicator */}
            {isValid && !piece && (
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial 
                  color="#22C55E"
                  emissive="#22C55E"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )}

            {/* Piece at this position */}
            {piece && (
              <Piece3D
                piece={piece}
                isSelected={gameState.selectedPiece?.id === piece.id}
                onClick={() => onPieceClick(piece.id)}
                position={[0, 0.2, 0]}
                boardType="circular"
              />
            )}

            {/* Connection path glow */}
            {isPath && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.15, 0.25, 16]} />
                <meshStandardMaterial 
                  color="#9F7AEA"
                  emissive="#9F7AEA"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* "FIDCHELL" title text */}
      <Text
        position={[0, 0.1, -5.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.4}
        color={runeColor}
        anchorX="center"
        anchorY="middle"
      >
        FIDCHELL
      </Text>
      <Text
        position={[0, 0.1, 5.8]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.25}
        color={runeColor}
        anchorX="center"
        anchorY="middle"
      >
        The Sacred Web
      </Text>
    </group>
  );
}