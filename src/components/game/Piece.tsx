import { cn } from '@/lib/utils';
import { PieceType } from '@/types/game';

interface PieceProps {
  type: PieceType;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  boardSize: number;
}

export function Piece({ type, isSelected, onClick, boardSize }: PieceProps) {
  const sizeClass = boardSize === 9 
    ? 'w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12' 
    : 'w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10';

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-full cursor-pointer transition-all duration-200 piece-shadow',
        'flex items-center justify-center',
        'hover:scale-110 active:scale-95',
        sizeClass,
        type === 'attacker' && 'bg-gradient-to-br from-[hsl(var(--piece-attacker))] to-[hsl(var(--piece-attacker-accent))] border-2 border-[hsl(var(--piece-attacker-accent))]',
        type === 'defender' && 'bg-gradient-to-br from-[hsl(var(--piece-defender))] to-[hsl(var(--piece-defender-accent))] border-2 border-[hsl(var(--piece-defender-accent))]',
        type === 'king' && 'bg-gradient-to-br from-[hsl(var(--piece-king))] to-[hsl(var(--piece-king-accent))] border-2 border-[hsl(var(--piece-king-accent))]',
        isSelected && 'glow-gold scale-110'
      )}
    >
      {type === 'king' && (
        <span className="text-lg sm:text-xl text-[hsl(var(--background))] font-bold select-none">♔</span>
      )}
      {type === 'attacker' && (
        <span className="text-xs sm:text-sm text-[hsl(var(--foreground)/0.7)] font-bold select-none">ᚨ</span>
      )}
      {type === 'defender' && (
        <span className="text-xs sm:text-sm text-[hsl(var(--background)/0.7)] font-bold select-none">ᛞ</span>
      )}
    </div>
  );
}
