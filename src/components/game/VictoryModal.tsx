import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GameResult, Player } from '@/types/game';
import { Trophy } from 'lucide-react';

interface VictoryModalProps {
  result: GameResult;
  playerSide: Player;
  onPlayAgain: () => void;
  onClose: () => void;
  circular?: boolean;
  sharedTable?: boolean;
}
export function VictoryModal({ result, playerSide, onPlayAgain, onClose, circular = false, sharedTable = false }: VictoryModalProps) {
  if (!result) return null;
  const playerWon = result === `${playerSide}-wins`;
  const winner = circular ? result === 'attacker-wins' ? 'Ebony' : 'Ivory' : result === 'attacker-wins' ? 'The attackers' : 'The defenders';
  return <Dialog open={!!result} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="sm:max-w-md text-center"><DialogHeader><DialogTitle className="flex items-center justify-center gap-3 text-2xl font-normal"><Trophy className="h-7 w-7 text-primary" />{sharedTable ? 'A game well played' : playerWon ? 'Victory at the table' : 'The contest is decided'}</DialogTitle><DialogDescription className="pt-4 text-lg">{winner} win this game.</DialogDescription></DialogHeader><p className="py-4 text-sm text-muted-foreground">{circular ? 'The winning colour completed a connection from the centre to the outer ring.' : 'The winning condition of this table has been reached. You can review the final position or return to choose another game.'}</p><div className="flex justify-center gap-3"><Button onClick={onPlayAgain}>Choose another game</Button><Button variant="outline" onClick={onClose}>Review the board</Button></div></DialogContent></Dialog>;
}
