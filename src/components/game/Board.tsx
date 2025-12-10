import { GameState, Position } from '@/types/game';
import { Square } from './Square';
import { Piece } from './Piece';
import { useGameLogic } from '@/hooks/useGameLogic';
import { RUNES } from '@/constants/game';

interface BoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
}

export function Board({ gameState, onSquareClick, onPieceClick }: BoardProps) {
  const { pieces, selectedPiece, validMoves, boardSize } = gameState;
  const logic = useGameLogic(boardSize);

  const getSquareType = (pos: Position) => {
    if (logic.isCorner(pos)) return 'corner';
    if (logic.isThrone(pos)) return 'throne';
    return 'normal';
  };

  const isValidMove = (pos: Position) => {
    return validMoves.some(m => m.row === pos.row && m.col === pos.col);
  };

  const getPieceAt = (pos: Position) => {
    return pieces.find(p => p.position.row === pos.row && p.position.col === pos.col);
  };

  const rows = Array.from({ length: boardSize }, (_, i) => i);
  const cols = Array.from({ length: boardSize }, (_, i) => i);

  return (
    <div className="flex flex-col items-center">
      {/* Column labels */}
      <div className="flex mb-1">
        <div className="w-6" />
        {cols.map(col => (
          <div 
            key={col} 
            className={`flex items-center justify-center text-xs sm:text-sm text-muted-foreground rune-decoration ${
              boardSize === 9 ? 'w-12 sm:w-14 md:w-16' : 'w-10 sm:w-12 md:w-14'
            }`}
          >
            {String.fromCharCode(97 + col)}
          </div>
        ))}
        <div className="w-6" />
      </div>

      <div className="flex">
        {/* Row labels left */}
        <div className="flex flex-col justify-around mr-1">
          {rows.map(row => (
            <div 
              key={row} 
              className={`flex items-center justify-center w-6 text-xs sm:text-sm text-muted-foreground rune-decoration ${
                boardSize === 9 ? 'h-12 sm:h-14 md:h-16' : 'h-10 sm:h-12 md:h-14'
              }`}
            >
              {boardSize - row}
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="viking-border wood-texture p-1 rounded-lg">
          <div 
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
          >
            {rows.map(row =>
              cols.map(col => {
                const pos = { row, col };
                const piece = getPieceAt(pos);
                const isSelected = selectedPiece?.position.row === row && selectedPiece?.position.col === col;

                return (
                  <Square
                    key={`${row}-${col}`}
                    position={pos}
                    type={getSquareType(pos)}
                    isValidMove={isValidMove(pos)}
                    isSelected={isSelected}
                    onClick={() => onSquareClick(pos)}
                    boardSize={boardSize}
                  >
                    {piece && (
                      <Piece
                        type={piece.type}
                        isSelected={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPieceClick(piece.id);
                        }}
                        boardSize={boardSize}
                      />
                    )}
                  </Square>
                );
              })
            )}
          </div>
        </div>

        {/* Row labels right */}
        <div className="flex flex-col justify-around ml-1">
          {rows.map(row => (
            <div 
              key={row} 
              className={`flex items-center justify-center w-6 text-xs sm:text-sm text-muted-foreground rune-decoration ${
                boardSize === 9 ? 'h-12 sm:h-14 md:h-16' : 'h-10 sm:h-12 md:h-14'
              }`}
            >
              {RUNES[row] || ''}
            </div>
          ))}
        </div>
      </div>

      {/* Column runes bottom */}
      <div className="flex mt-1">
        <div className="w-6" />
        {cols.map(col => (
          <div 
            key={col} 
            className={`flex items-center justify-center text-sm text-muted-foreground/50 rune-decoration ${
              boardSize === 9 ? 'w-12 sm:w-14 md:w-16' : 'w-10 sm:w-12 md:w-14'
            }`}
          >
            {RUNES[col] || ''}
          </div>
        ))}
        <div className="w-6" />
      </div>
    </div>
  );
}
