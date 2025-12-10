import { cn } from '@/lib/utils';
import { Position, SquareType } from '@/types/game';
import { RUNES } from '@/constants/game';

interface SquareProps {
  position: Position;
  type: SquareType;
  isValidMove: boolean;
  isSelected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  boardSize: number;
}

export function Square({ 
  position, 
  type, 
  isValidMove, 
  isSelected, 
  onClick, 
  children,
  boardSize 
}: SquareProps) {
  const isEven = (position.row + position.col) % 2 === 0;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center cursor-pointer transition-all duration-200',
        'border border-[hsl(var(--board-border))]',
        boardSize === 9 ? 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16' : 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
        isEven ? 'bg-[hsl(var(--square-light))]' : 'bg-[hsl(var(--square-dark))]',
        type === 'corner' && 'bg-[hsl(var(--square-corner))]',
        type === 'throne' && 'bg-[hsl(var(--square-center))]',
        isValidMove && 'ring-2 ring-inset ring-[hsl(var(--square-valid))] bg-[hsl(var(--square-valid)/0.3)]',
        isSelected && 'ring-2 ring-inset ring-[hsl(var(--square-highlight))]'
      )}
    >
      {/* Corner rune decorations */}
      {type === 'corner' && (
        <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl text-[hsl(var(--primary)/0.6)] rune-decoration select-none">
          ᛉ
        </span>
      )}
      
      {/* Throne decoration */}
      {type === 'throne' && !children && (
        <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl text-[hsl(var(--primary)/0.4)] rune-decoration select-none">
          ᚦ
        </span>
      )}
      
      {/* Valid move indicator */}
      {isValidMove && !children && (
        <div className="absolute w-3 h-3 rounded-full bg-[hsl(var(--square-valid))] opacity-60 animate-pulse" />
      )}
      
      {children}
    </div>
  );
}
