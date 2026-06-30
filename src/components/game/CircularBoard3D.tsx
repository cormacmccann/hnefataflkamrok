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
  /** When true (placement phase) every empty intersection is clickable. */
  placementMode?: boolean;
}

const RINGS = FIDCHELL_CONFIG.rings;        // 8 (center + 7)
const SPOKES = FIDCHELL_CONFIG.spokes;      // 16
const OUTER_RADIUS = 5.4;                   // visual radius of outer ring
const RING_SCALE = OUTER_RADIUS / (RINGS - 1);
const BOARD_RADIUS = OUTER_RADIUS + 0.6;

function circularToWorld(pos: FidchellPosition): Vector3 {
  if (pos.ring === 0) return new Vector3(0, 0, 0);
  const angle = (pos.spoke / SPOKES) * Math.PI * 2 - Math.PI / 2;
  const r = pos.ring * RING_SCALE;
  return new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
}

export function CircularBoard3D({
  gameState,
  onNodeClick,
  onPieceClick,
  theme,
  connectionPath = [],
  placementMode = false,
}: CircularBoard3DProps) {
  const groupRef = useRef<Group>(null);

  const nodes = useMemo(() => {
    const result: FidchellPosition[] = [{ ring: 0, spoke: 0 }];
    for (let ring = 1; ring < RINGS; ring++) {
      for (let spoke = 0; spoke < SPOKES; spoke++) {
        result.push({ ring, spoke });
      }
    }
    return result;
  }, []);

  const inConnectionPath = (pos: FidchellPosition) =>
    connectionPath.some(p => p.ring === pos.ring && p.spoke === pos.spoke);

  const getPieceAtPosition = (pos: FidchellPosition) =>
    gameState.pieces.find(p =>
      p.circularPosition?.ring === pos.ring && p.circularPosition?.spoke === pos.spoke
    );

  const isValidMoveTarget = (pos: FidchellPosition) =>
    gameState.validMoves.some(m => m.row === pos.ring && m.col === pos.spoke);

  const baseColor = theme?.boardBase || '#1A1428';
  const accentColor = theme?.accentRing || '#9F7AEA';
  const runeColor = theme?.runeColor || '#DDA0DD';
  const throneColor = theme?.throne || '#6B4EAB';

  return (
    <group ref={groupRef}>
      {/* Board base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[BOARD_RADIUS, BOARD_RADIUS + 0.15, 0.3, 64]} />
        <meshStandardMaterial color={baseColor} roughness={0.85} />
      </mesh>

      {/* Decorative outer rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <torusGeometry args={[BOARD_RADIUS - 0.1, 0.12, 16, 64]} />
        <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Concentric rings */}
      {Array.from({ length: RINGS }).map((_, ringIdx) => (
        <mesh key={`ring-${ringIdx}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <torusGeometry args={[Math.max(ringIdx * RING_SCALE, 0.0001), 0.025, 8, 64]} />
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
      {Array.from({ length: SPOKES }).map((_, spokeIdx) => {
        const angle = (spokeIdx / SPOKES) * Math.PI * 2 - Math.PI / 2;
        const length = (RINGS - 1) * RING_SCALE;
        return (
          <mesh
            key={`spoke-${spokeIdx}`}
            position={[Math.cos(angle) * length / 2, 0.06, Math.sin(angle) * length / 2]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[length, 0.025, 0.035]} />
            <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Navel Stone (impassable center) */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.8}
          roughness={0.2}
          emissive={throneColor}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.55, 32]} />
        <meshStandardMaterial
          color={throneColor}
          metalness={0.5}
          emissive={throneColor}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Ogham around outer rim */}
      {OGHAM.slice(0, 16).map((char, idx) => {
        const angle = (idx / 16) * Math.PI * 2 - Math.PI / 2;
        const radius = BOARD_RADIUS - 0.3;
        return (
          <Text
            key={`ogham-${idx}`}
            position={[Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]}
            rotation={[-Math.PI / 2, 0, -angle + Math.PI]}
            fontSize={0.22}
            color={runeColor}
            anchorX="center"
            anchorY="middle"
          >
            {char}
          </Text>
        );
      })}

      {/* Nodes */}
      {nodes.map((nodePos, idx) => {
        const world = circularToWorld(nodePos);
        const piece = getPieceAtPosition(nodePos);
        const isMoveTarget = isValidMoveTarget(nodePos);
        const isPath = inConnectionPath(nodePos);
        const isNavel = nodePos.ring === 0;
        const empty = !piece && !isNavel;
        const placeable = empty && placementMode;

        return (
          <group key={`node-${idx}`} position={[world.x, 0, world.z]}>
            {empty && (
              <mesh
                position={[0, 0.02, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(nodePos);
                }}
              >
                <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
                <meshStandardMaterial
                  color={
                    isMoveTarget ? '#22C55E' :
                    isPath ? '#50C878' :
                    placeable ? accentColor : '#2D5A3D'
                  }
                  emissive={isMoveTarget ? '#22C55E' : isPath ? '#50C878' : placeable ? accentColor : undefined}
                  emissiveIntensity={isMoveTarget || isPath ? 0.55 : placeable ? 0.25 : 0}
                  transparent={!isMoveTarget && !isPath && !placeable}
                  opacity={isMoveTarget || isPath ? 1 : placeable ? 0.85 : 0.5}
                />
              </mesh>
            )}

            {isMoveTarget && !piece && (
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial
                  color="#22C55E"
                  emissive="#22C55E"
                  emissiveIntensity={0.9}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )}

            {piece && (
              <Piece3D
                piece={piece}
                isSelected={gameState.selectedPiece?.id === piece.id}
                onClick={() => onPieceClick(piece.id)}
                position={[0, 0.2, 0]}
                boardType="circular"
              />
            )}

            {isPath && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.18, 0.3, 16]} />
                <meshStandardMaterial
                  color="#50C878"
                  emissive="#50C878"
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}
          </group>
        );
      })}

      <Text
        position={[0, 0.1, -(BOARD_RADIUS - 0.05)]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.35}
        color={runeColor}
        anchorX="center"
        anchorY="middle"
      >
        FIDCHELL
      </Text>
      <Text
        position={[0, 0.1, BOARD_RADIUS - 0.05]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.22}
        color={runeColor}
        anchorX="center"
        anchorY="middle"
      >
        Gwth Bwch · Connect Centre to Rim
      </Text>
    </group>
  );
}
