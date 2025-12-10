import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-['Cinzel'] text-center">
            ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Hnefatafl Rules
          </DialogTitle>
          <DialogDescription className="text-center">
            The Viking Game of Strategy
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="movement">Movement</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="basics" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">The Setup</h3>
                <p className="text-muted-foreground">
                  Hnefatafl ("King's Table") is an ancient Viking strategy game. Two players face off in an asymmetric battle:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">Attackers (Dark pieces):</strong> Start on the edges, outnumber defenders 2:1</li>
                  <li><strong className="text-foreground">Defenders (Light pieces):</strong> Protect the King in the center</li>
                  <li><strong className="text-foreground">The King (Gold piece):</strong> Must escape to any corner</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Victory Conditions</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">Defenders win:</strong> The King reaches any corner square</li>
                  <li><strong className="text-foreground">Attackers win:</strong> The King is captured (surrounded on all 4 sides)</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Special Squares</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">Corners (ᛉ):</strong> Only the King may enter. Escape points for defenders.</li>
                  <li><strong className="text-foreground">Throne (ᚦ):</strong> The central square. Only the King may occupy it after leaving.</li>
                </ul>
              </section>
            </TabsContent>
            
            <TabsContent value="movement" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">How Pieces Move</h3>
                <p className="text-muted-foreground">
                  All pieces move the same way: any number of squares horizontally or vertically (like a rook in chess). 
                  Pieces cannot jump over other pieces or move diagonally.
                </p>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Capturing Pieces</h3>
                <p className="text-muted-foreground">
                  Regular pieces are captured by "sandwiching" them between two enemy pieces (or an enemy piece and a hostile square). 
                  The capture happens when you move a piece to complete the sandwich - not by moving into a sandwich position.
                </p>
                <div className="bg-secondary/50 p-3 rounded-lg mt-2">
                  <p className="text-sm">Example: ⚫ ⚪ ⚫ → The white piece is captured</p>
                </div>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Capturing the King</h3>
                <p className="text-muted-foreground">
                  The King is harder to capture - he must be surrounded on all four sides by attackers 
                  (or three attackers and a hostile square like the throne or edge).
                </p>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Hostile Squares</h3>
                <p className="text-muted-foreground">
                  The corners and empty throne act as hostile squares for capture purposes. 
                  A piece can be captured against these squares.
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="strategy" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Attacker Strategy</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Control the corners - don't let the King get a clear path</li>
                  <li>Create a "wall" around the central area</li>
                  <li>Pick off defenders to weaken the King's protection</li>
                  <li>Force the King toward the edges where he can be cornered</li>
                  <li>Use your numerical advantage to create capture threats</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">Defender Strategy</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Create escape routes to multiple corners</li>
                  <li>Keep the King mobile - don't let him get trapped</li>
                  <li>Use defenders to block attacker pieces</li>
                  <li>Sacrifice defenders to create openings for the King</li>
                  <li>Attack aggressively - captured attackers can't block escapes</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">General Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Think several moves ahead</li>
                  <li>Watch for "fork" positions that threaten two things at once</li>
                  <li>Control the center and key diagonal lines</li>
                  <li>Don't leave pieces unprotected near enemies</li>
                </ul>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
