import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BoardSize, Player, AIDifficulty, GameMode, GameVariant, VariantRules } from '@/types/game';
import { GAME_VARIANTS } from '@/constants/game';
import { Play, Sparkles, Zap, Brain, Skull, Eye, MapPin, Clock, Map, Shield, Crown, Sword, Circle, Link, ChevronRight, Users } from 'lucide-react';
import vikingBackground from '@/assets/viking-background.jpg';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';
import { VolumeControl } from './VolumeControl';
import { TaflHistoryMap } from './TaflHistoryMap';
import { Switch } from '@/components/ui/switch';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/i18n/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameSetupProps {
  onStartGame: (boardSize: BoardSize, playerSide: Player, difficulty: AIDifficulty, mode: GameMode, variantId: string) => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
}

// Variant-specific rules information
const getVariantRulesInfo = (variant: GameVariant, t: any) => {
  const baseRules = [
    {
      icon: Crown,
      label: variant.defaultRules.kingArmed ? t.kingArmed : t.kingUnarmed,
      description: variant.defaultRules.kingArmed ? t.kingArmedDesc : t.kingUnarmedDesc,
      enabled: variant.defaultRules.kingArmed,
    },
    {
      icon: Shield,
      label: variant.defaultRules.edgeEscape ? t.edgeEscape : t.cornerEscape,
      description: variant.defaultRules.edgeEscape ? t.edgeEscapeDesc : t.cornerEscapeDesc,
      enabled: variant.defaultRules.edgeEscape,
    },
    {
      icon: Sword,
      label: variant.defaultRules.shieldwallCapture ? t.shieldwallCapture : t.custodialCapture,
      description: variant.defaultRules.shieldwallCapture ? t.shieldwallCaptureDesc : t.custodialCaptureDesc,
      enabled: variant.defaultRules.shieldwallCapture,
    },
  ];

  // Add Fidchell-specific rules
  if (variant.id === 'fidchell') {
    return [
      {
        icon: Circle,
        label: t.circularBoard || 'Circular Sacred Web',
        description: t.circularBoardDesc || 'Pieces move along rings and spokes on a cosmic web',
        enabled: true,
      },
      {
        icon: Link,
        label: t.connectionVictory || 'Connection Victory',
        description: t.connectionVictoryDesc || 'White wins by connecting the Navel Stone to the outer edge',
        enabled: true,
      },
      {
        icon: Users,
        label: t.equalForces || 'Equal Forces',
        description: t.equalForcesDesc || 'Both sides have 12 pieces - a balanced mystical battle',
        enabled: true,
      },
    ];
  }

  return baseRules;
};

// Get victory conditions based on variant
const getVictoryConditions = (variant: GameVariant, t: any) => {
  if (variant.id === 'fidchell') {
    return {
      white: t.fidchellWhiteWins || 'Create unbroken path from Navel to edge',
      black: t.fidchellBlackWins || 'Reduce White below 7 pieces',
    };
  }
  
  return {
    white: variant.defaultRules.edgeEscape ? t.kingEscapesEdge : t.kingEscapesCorner,
    black: t.surroundKing,
  };
};

export function GameSetup({ 
  onStartGame, 
  musicVolume, 
  sfxVolume, 
  onMusicVolumeChange, 
  onSfxVolumeChange 
}: GameSetupProps) {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>(GAME_VARIANTS[2]);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [showMap, setShowMap] = useState(false);
  const [rules, setRules] = useState<VariantRules>(GAME_VARIANTS[2].defaultRules);

  const handleVariantChange = (variant: GameVariant) => {
    setSelectedVariant(variant);
    setRules(variant.defaultRules);
  };

  const variantRulesInfo = getVariantRulesInfo(selectedVariant, t);
  const victoryConditions = getVictoryConditions(selectedVariant, t);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${vikingBackground})` }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Controls in corner */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
        <LanguageSelector />
        <VolumeControl
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMusicVolumeChange={onMusicVolumeChange}
          onSfxVolumeChange={onSfxVolumeChange}
        />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <img 
            src={hnefataflLogo} 
            alt={t.appName}
            className="h-16 mx-auto mb-2"
          />
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </motion.div>

        {/* Main Layout: Three Columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 viking-border bg-card/95 backdrop-blur rounded-xl p-4"
        >
          {/* LEFT: Game Selection */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-['Cinzel']">
                {t.selectVariant}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(true)}
                className="gap-1 text-xs text-muted-foreground hover:text-primary p-1 h-auto"
              >
                <Map className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-2">
                {GAME_VARIANTS.map((variant) => (
                  <motion.button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedVariant.id === variant.id
                        ? 'bg-primary/20 border-primary/50 shadow-lg shadow-primary/10'
                        : 'bg-secondary/20 border-border/30 hover:bg-secondary/40 hover:border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {variant.boardType === 'circular' ? (
                          <Circle className="w-4 h-4 text-primary" />
                        ) : (
                          <div 
                            className="w-4 h-4 border-2 rounded-sm"
                            style={{ borderColor: variant.theme.corner }}
                          />
                        )}
                        <span className="font-['Cinzel'] text-sm font-medium">{variant.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{variant.boardSize}×{variant.boardSize}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 pl-6">{variant.description}</p>
                    {selectedVariant.id === variant.id && (
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* MIDDLE: Variant Details & Rules */}
          <div className="lg:col-span-5 space-y-4 border-x border-border/30 px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVariant.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Variant Header */}
                <div className="text-center pb-3 border-b border-border/30">
                  <h2 className="text-2xl font-['Cinzel'] text-primary">{selectedVariant.name}</h2>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-primary">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedVariant.origin}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedVariant.era}
                    </span>
                  </div>
                </div>

                {/* History */}
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <p className="text-sm text-foreground/90 leading-relaxed">{selectedVariant.history}</p>
                </div>

                {/* Variant-Specific Rules */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-['Cinzel']">
                    {selectedVariant.id === 'fidchell' ? t.fidchellRules || 'Fidchell Rules' : t.variantRules}
                  </h3>
                  <div className="space-y-2">
                    {variantRulesInfo.map((rule, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-start gap-3 p-2 rounded-lg ${
                          rule.enabled ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/20 border border-border/20'
                        }`}
                      >
                        <rule.icon className={`w-4 h-4 mt-0.5 ${rule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <span className="text-sm font-medium">{rule.label}</span>
                          <p className="text-xs text-muted-foreground">{rule.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Victory Conditions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-['Cinzel']">
                    {t.victoryConditions}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-[hsl(var(--piece-defender))]/20 border border-[hsl(var(--piece-defender))]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-[hsl(var(--piece-defender))]" />
                        <span className="text-xs font-medium">{selectedVariant.id === 'fidchell' ? 'White' : t.defenders}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{victoryConditions.white}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--piece-attacker))]/20 border border-[hsl(var(--piece-attacker))]/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-[hsl(var(--piece-attacker))]" />
                        <span className="text-xs font-medium">{selectedVariant.id === 'fidchell' ? 'Black' : t.attackers}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{victoryConditions.black}</p>
                    </div>
                  </div>
                </div>

                {/* Rule Toggles (only for non-Fidchell) */}
                {selectedVariant.id !== 'fidchell' && (
                  <div className="space-y-2 pt-2 border-t border-border/30">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.customizeRules || 'Customize Rules'}
                    </h3>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center justify-between p-2 rounded bg-secondary/10">
                        <span className="text-xs">{t.kingArmed}</span>
                        <Switch
                          checked={rules.kingArmed}
                          onCheckedChange={(checked) => setRules({ ...rules, kingArmed: checked })}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-secondary/10">
                        <span className="text-xs">{t.edgeEscape}</span>
                        <Switch
                          checked={rules.edgeEscape}
                          onCheckedChange={(checked) => setRules({ ...rules, edgeEscape: checked })}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-secondary/10">
                        <span className="text-xs">{t.shieldwallCapture}</span>
                        <Switch
                          checked={rules.shieldwallCapture}
                          onCheckedChange={(checked) => setRules({ ...rules, shieldwallCapture: checked })}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Game Options */}
          <div className="lg:col-span-4 space-y-4">
            {/* Side Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-['Cinzel']">
                {t.playAs}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={playerSide === 'defender' ? 'default' : 'outline'}
                  onClick={() => setPlayerSide('defender')}
                  className="h-auto py-3 flex-col gap-1"
                >
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--piece-defender))] border-2 border-[hsl(var(--piece-defender-accent))] flex items-center justify-center">
                    <span className="text-[10px] text-[hsl(var(--background))]">♔</span>
                  </div>
                  <span className="font-['Cinzel'] text-xs">
                    {selectedVariant.id === 'fidchell' ? 'White' : t.defenders}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedVariant.id === 'fidchell' ? t.makeConnection || 'Make Connection' : t.protectKing}
                  </span>
                </Button>
                <Button
                  variant={playerSide === 'attacker' ? 'default' : 'outline'}
                  onClick={() => setPlayerSide('attacker')}
                  className="h-auto py-3 flex-col gap-1"
                >
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--piece-attacker))] border-2 border-[hsl(var(--piece-attacker-accent))]" />
                  <span className="font-['Cinzel'] text-xs">
                    {selectedVariant.id === 'fidchell' ? 'Black' : t.attackers}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedVariant.id === 'fidchell' ? t.blockConnection || 'Block Connection' : t.captureKing}
                  </span>
                </Button>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-['Cinzel']">
                {t.difficulty}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={difficulty === 'beginner' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('beginner')}
                  className="h-auto py-2 flex-col gap-1"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-['Cinzel'] text-[10px]">{t.beginner}</span>
                </Button>
                <Button
                  variant={difficulty === 'easy' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('easy')}
                  className="h-auto py-2 flex-col gap-1"
                  size="sm"
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-['Cinzel'] text-[10px]">{t.easy}</span>
                </Button>
                <Button
                  variant={difficulty === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('medium')}
                  className="h-auto py-2 flex-col gap-1"
                  size="sm"
                >
                  <Brain className="w-4 h-4" />
                  <span className="font-['Cinzel'] text-[10px]">{t.medium}</span>
                </Button>
                <Button
                  variant={difficulty === 'valhalla' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('valhalla')}
                  className="h-auto py-2 flex-col gap-1 text-destructive"
                  size="sm"
                >
                  <Skull className="w-4 h-4" />
                  <span className="font-['Cinzel'] text-[10px]">{t.valhalla}</span>
                </Button>
              </div>
            </div>

            {/* Board Preview Indicator */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {selectedVariant.boardType === 'circular' ? (
                  <>
                    <Circle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-['Cinzel']">{t.circularBoard || 'Circular Board'}</span>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-5 h-5 border-2 rounded"
                      style={{ 
                        borderColor: selectedVariant.theme.corner,
                        backgroundColor: selectedVariant.theme.squareDark
                      }}
                    />
                    <span className="text-sm font-['Cinzel']">{selectedVariant.boardSize}×{selectedVariant.boardSize} {t.board || 'Board'}</span>
                  </>
                )}
              </div>
              <div 
                className="w-full h-2 rounded-full"
                style={{ 
                  background: `linear-gradient(to right, ${selectedVariant.theme.squareLight}, ${selectedVariant.theme.corner}, ${selectedVariant.theme.throne})`
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button 
                onClick={() => onStartGame(selectedVariant.boardSize, playerSide, difficulty, 'play', selectedVariant.id)} 
                className="w-full h-12 text-lg font-['Cinzel'] gap-2"
              >
                <Play className="w-5 h-5" />
                {t.play} {selectedVariant.name}
              </Button>
              <Button 
                variant="outline"
                onClick={() => onStartGame(selectedVariant.boardSize, playerSide, difficulty, 'demo', selectedVariant.id)} 
                className="w-full h-10 font-['Cinzel'] gap-2"
              >
                <Eye className="w-4 h-4" />
                {t.watchDemo}
              </Button>
            </div>

            {/* Turn Order Info */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              <p>
                {selectedVariant.id === 'fidchell' 
                  ? (playerSide === 'attacker' ? 'Black moves first • You start' : 'Black moves first • AI starts')
                  : `${t.attackersFirst} ${playerSide === 'attacker' ? t.youStart : t.aiStarts}`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History Map Modal */}
      <AnimatePresence>
        {showMap && (
          <TaflHistoryMap
            variants={GAME_VARIANTS}
            selectedVariant={selectedVariant}
            onSelectVariant={handleVariantChange}
            onClose={() => setShowMap(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
