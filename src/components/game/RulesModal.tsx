import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  GoalDiagram,
  MovementDiagram,
  CaptureDiagram,
  PiecesLegend,
  AnimatedDemo,
  DEMO_TOTAL_STEPS,
} from './tutorial/TutorialDiagrams';
import { Play, Pause, RotateCcw, BookOpen, Sparkles, Swords, Trophy } from 'lucide-react';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useLanguage();
  const [demoStep, setDemoStep] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(true);

  useEffect(() => {
    if (!open || !demoPlaying) return;
    const id = setInterval(() => setDemoStep((s) => (s + 1) % DEMO_TOTAL_STEPS), 2800);
    return () => clearInterval(id);
  }, [open, demoPlaying]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90dvh] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-2xl font-['Cinzel'] text-center flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {t.runeTitle}
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            Layered guide — start fast, dive deep.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="quick" className="w-full px-2 sm:px-5 pb-4">
          <TabsList className="grid w-full grid-cols-4 mb-3">
            <TabsTrigger value="quick" className="text-xs sm:text-sm gap-1">
              <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
              Quick start
            </TabsTrigger>
            <TabsTrigger value="demo" className="text-xs sm:text-sm gap-1">
              <Play className="w-3.5 h-3.5 hidden sm:inline" />
              Watch
            </TabsTrigger>
            <TabsTrigger value="movement" className="text-xs sm:text-sm gap-1">
              <Swords className="w-3.5 h-3.5 hidden sm:inline" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs sm:text-sm gap-1">
              <Trophy className="w-3.5 h-3.5 hidden sm:inline" />
              Tips
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] sm:h-[420px] pr-3">
            {/* QUICK START — illustrated cheat sheet */}
            <TabsContent value="quick" className="space-y-5 mt-0">
              <Card icon={<Trophy className="w-4 h-4" />} title="Your goal">
                <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <p className="text-sm text-foreground/90">
                    <strong className="text-primary">Defenders</strong> must escort the
                    King to a corner (or edge in some variants) to win.
                    <br />
                    <strong className="text-primary">Attackers</strong> win by surrounding
                    the King so it cannot move.
                  </p>
                  <GoalDiagram />
                </div>
              </Card>

              <Card icon={<Sparkles className="w-4 h-4" />} title="Meet the pieces">
                <PiecesLegend />
              </Card>

              <Card icon={<Swords className="w-4 h-4" />} title="How pieces move">
                <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-center">
                  <MovementDiagram />
                  <p className="text-sm text-foreground/90">
                    Every piece slides like a chess <em>rook</em> — any number of
                    squares straight up/down or left/right. No diagonals. No jumping.
                  </p>
                </div>
              </Card>

              <Card icon={<Swords className="w-4 h-4 text-destructive" />} title="How to capture">
                <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-center">
                  <CaptureDiagram />
                  <p className="text-sm text-foreground/90">
                    Sandwich an enemy between two of your pieces along a row or column.
                    You move <em>into</em> the trap — you don't get captured for moving
                    between two enemies. The King usually needs <strong>four</strong> sides
                    blocked.
                  </p>
                </div>
              </Card>

              <p className="text-xs text-center text-muted-foreground italic pt-1">
                Switch to <strong>Watch</strong> for an animated example, or
                <strong> Rules</strong> for the full mechanics.
              </p>
            </TabsContent>

            {/* WATCH — animated demo */}
            <TabsContent value="demo" className="space-y-4 mt-0">
              <AnimatedDemo step={demoStep} />
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setDemoPlaying((p) => !p)}
                  className="tap-target px-3 rounded-md bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1.5 text-sm"
                >
                  {demoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {demoPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => setDemoStep(0)}
                  className="tap-target px-3 rounded-md bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1.5 text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Restart
                </button>
                <button
                  onClick={() => setDemoStep((s) => (s + 1) % DEMO_TOTAL_STEPS)}
                  className="tap-target px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 text-sm"
                >
                  Next step →
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground italic">
                A 4-step illustration of a capture + a king's escape.
              </p>
            </TabsContent>

            {/* RULES — original detailed text */}
            <TabsContent value="movement" className="space-y-4 mt-0">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.theSetup}</h3>
                <p className="text-muted-foreground text-sm">{t.setupDescription}</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                  <li><strong className="text-foreground">{t.attackers}:</strong> {t.attackersDesc}</li>
                  <li><strong className="text-foreground">{t.defenders}:</strong> {t.defendersDesc}</li>
                  <li><strong className="text-foreground">King:</strong> {t.kingDesc}</li>
                </ul>
              </section>
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.howPiecesMove}</h3>
                <p className="text-muted-foreground text-sm">{t.movementDesc}</p>
              </section>
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.capturingPieces}</h3>
                <p className="text-muted-foreground text-sm">{t.capturingDesc}</p>
              </section>
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.capturingKing}</h3>
                <p className="text-muted-foreground text-sm">{t.capturingKingDesc}</p>
              </section>
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.specialSquares}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong className="text-foreground">{t.corners}</strong> {t.cornersDesc}</li>
                  <li><strong className="text-foreground">{t.throne}</strong> {t.throneDesc}</li>
                </ul>
              </section>
            </TabsContent>

            {/* STRATEGY */}
            <TabsContent value="strategy" className="space-y-4 mt-0">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.defenderTips}</h3>
                <p className="text-muted-foreground text-sm">{t.defenderTipsDesc}</p>
              </section>
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.attackerTips}</h3>
                <p className="text-muted-foreground text-sm">{t.attackerTipsDesc}</p>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-3 sm:p-4 shadow-sm">
      <h3 className="font-['Cinzel'] text-base font-semibold text-primary mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}
