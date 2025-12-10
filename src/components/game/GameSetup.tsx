import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BoardSize, Player } from '@/types/game';

interface GameSetupProps {
  onStartGame: (boardSize: BoardSize, playerSide: Player) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg viking-border bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-['Cinzel'] text-primary">
            ᚺᚾᛖᚠᚨᛏᚨᚠᛚ
          </CardTitle>
          <CardDescription className="text-xl font-['Cinzel'] mt-2">
            Hnefatafl
          </CardDescription>
          <p className="text-muted-foreground mt-2">
            The Viking Game of Strategy
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Board Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={boardSize === 9 ? 'default' : 'outline'}
                onClick={() => setBoardSize(9)}
                className="h-auto py-4 flex-col"
              >
                <span className="text-lg font-['Cinzel']">9×9</span>
                <span className="text-xs text-muted-foreground">Tablut (Faster)</span>
              </Button>
              <Button
                variant={boardSize === 11 ? 'default' : 'outline'}
                onClick={() => setBoardSize(11)}
                className="h-auto py-4 flex-col"
              >
                <span className="text-lg font-['Cinzel']">11×11</span>
                <span className="text-xs text-muted-foreground">Classic (Longer)</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Play As
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={playerSide === 'defender' ? 'default' : 'outline'}
                onClick={() => setPlayerSide('defender')}
                className="h-auto py-4 flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--piece-defender))] border-2 border-[hsl(var(--piece-defender-accent))] flex items-center justify-center">
                  <span className="text-xs text-[hsl(var(--background))]">♔</span>
                </div>
                <span className="font-['Cinzel']">Defenders</span>
                <span className="text-xs text-muted-foreground">Protect the King</span>
              </Button>
              <Button
                variant={playerSide === 'attacker' ? 'default' : 'outline'}
                onClick={() => setPlayerSide('attacker')}
                className="h-auto py-4 flex-col gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--piece-attacker))] border-2 border-[hsl(var(--piece-attacker-accent))]" />
                <span className="font-['Cinzel']">Attackers</span>
                <span className="text-xs text-muted-foreground">Capture the King</span>
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => onStartGame(boardSize, playerSide)} 
            className="w-full h-12 text-lg font-['Cinzel']"
          >
            Begin Battle
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Attackers move first. {playerSide === 'attacker' ? 'You start!' : 'AI starts.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
