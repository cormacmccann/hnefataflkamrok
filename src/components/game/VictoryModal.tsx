import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameResult, Player } from '@/types/game';
import { Trophy, Skull } from 'lucide-react';

interface VictoryModalProps {
  result: GameResult;
  playerSide: Player;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function VictoryModal({ result, playerSide, onPlayAgain, onClose }: VictoryModalProps) {
  if (!result) return null;

  const playerWon = result === `${playerSide}-wins`;
  const winner = result === 'attacker-wins' ? 'Attackers' : 'Defenders';

  return (
    <Dialog open={!!result} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-3xl font-['Cinzel'] flex items-center justify-center gap-3">
            {playerWon ? (
              <>
                <Trophy className="w-8 h-8 text-primary" />
                Victory!
              </>
            ) : (
              <>
                <Skull className="w-8 h-8 text-destructive" />
                Defeat
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-lg pt-2">
            {playerWon ? (
              <span>You have triumphed! The {winner} are victorious.</span>
            ) : (
              <span>You have fallen. The {winner} have claimed victory.</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-6xl mb-4">
            {result === 'defender-wins' ? '👑' : '⚔️'}
          </div>
          <p className="text-muted-foreground">
            {result === 'defender-wins' 
              ? 'The King has escaped to the corner!' 
              : 'The King has been captured!'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onPlayAgain} className="gap-2">
            Play Again
          </Button>
          <Button variant="outline" onClick={onClose}>
            Review Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
