import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/i18n/LanguageContext';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-['Cinzel'] text-center">
            {t.runeTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t.subtitle}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics">{t.basics}</TabsTrigger>
            <TabsTrigger value="movement">{t.movement}</TabsTrigger>
            <TabsTrigger value="strategy">{t.strategy}</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="basics" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.theSetup}</h3>
                <p className="text-muted-foreground">
                  {t.setupDescription}
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">{t.attackers}:</strong> {t.attackersDesc}</li>
                  <li><strong className="text-foreground">{t.defenders}:</strong> {t.defendersDesc}</li>
                  <li><strong className="text-foreground">The King:</strong> {t.kingDesc}</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.victoryConditions}</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">{t.defenders}:</strong> {t.defendersWin}</li>
                  <li><strong className="text-foreground">{t.attackers}:</strong> {t.attackersWin}</li>
                </ul>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.specialSquares}</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong className="text-foreground">{t.corners}</strong> {t.cornersDesc}</li>
                  <li><strong className="text-foreground">{t.throne}</strong> {t.throneDesc}</li>
                </ul>
              </section>
            </TabsContent>
            
            <TabsContent value="movement" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.howPiecesMove}</h3>
                <p className="text-muted-foreground">
                  {t.movementDesc}
                </p>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.capturingPieces}</h3>
                <p className="text-muted-foreground">
                  {t.capturingDesc}
                </p>
                <div className="bg-secondary/50 p-3 rounded-lg mt-2">
                  <p className="text-sm">Example: ⚫ ⚪ ⚫ → The white piece is captured</p>
                </div>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.capturingKing}</h3>
                <p className="text-muted-foreground">
                  {t.capturingKingDesc}
                </p>
              </section>
            </TabsContent>
            
            <TabsContent value="strategy" className="space-y-4">
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.attackerTips}</h3>
                <p className="text-muted-foreground">
                  {t.attackerTipsDesc}
                </p>
              </section>
              
              <section>
                <h3 className="font-['Cinzel'] text-lg font-semibold text-primary mb-2">{t.defenderTips}</h3>
                <p className="text-muted-foreground">
                  {t.defenderTipsDesc}
                </p>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
