import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardSize, Player, AIDifficulty, GameMode, GameVariant, VariantRules } from '@/types/game';
import { GAME_VARIANTS, BOARD_CONFIGS } from '@/constants/game';
import { Play, Eye, Map, Swords, Shield, Info, X } from 'lucide-react';

const VARIANT_FLAGS: Record<string, string> = {
  fidchell: '🇮🇪',
  brandub: '🇮🇪',
  tablut: '🇸🇪',
  tawlbwrdd: '🏴‍☠️',
  hnefatafl: '🇳🇴',
  alea: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
};
try { VARIANT_FLAGS['tawlbwrdd'] = '🏴󠁧󠁢󠁷󠁬󠁳󠁿'; } catch {};
import vikingBackground from '@/assets/viking-background.jpg';
import builtwithImg from '@/assets/builtwith.png';
import kamrokLogo from '@/assets/kamrok-logo.png';
import { VolumeControl } from './VolumeControl';
import { TaflHistoryMap } from './TaflHistoryMap';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/i18n/LanguageContext';

interface GameSetupProps {
  onStartGame: (boardSize: BoardSize, playerSide: Player, difficulty: AIDifficulty, mode: GameMode, variantId: string) => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
}

export function GameSetup({
  onStartGame,
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
}: GameSetupProps) {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>(GAME_VARIANTS[2]);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [showMap, setShowMap] = useState(false);
  const [rules, setRules] = useState<VariantRules>(GAME_VARIANTS[2].defaultRules);
  const [infoVariant, setInfoVariant] = useState<GameVariant | null>(null);

  const difficultyMap = [
    { key: 'easy' as AIDifficulty, label: t.easy, vikingName: t.thrall },
    { key: 'medium' as AIDifficulty, label: t.medium, vikingName: t.karl },
    { key: 'valhalla' as AIDifficulty, label: t.hard, vikingName: t.jarl },
  ];

  const handleVariantChange = (variant: GameVariant) => {
    setSelectedVariant(variant);
    setRules(variant.defaultRules);
  };

  const boardConfig = BOARD_CONFIGS[selectedVariant.boardSize];
  const attackerCount = boardConfig?.initialAttackers?.length ?? 0;
  const defenderCount = (boardConfig?.initialDefenders?.length ?? 0) + 1;
  const isFidchell = selectedVariant.id === 'fidchell';

  const getVariantHistory = (variantId: string, fallback: string) => {
    return t.variantHistories[variantId as keyof typeof t.variantHistories] || fallback;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: `url(${vikingBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Vignette overlay */}
      <div className="absolute inset-0 vignette z-[1]" />
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Top-right controls */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-30 flex items-center gap-1 sm:gap-3">
        <button
          onClick={() => setShowMap(true)}
          className="tap-target rounded-lg carved-button text-foreground hover:text-primary transition-colors flex items-center justify-center"
          title={t.historyMapTitle}
          aria-label={t.historyMapTitle}
        >
          <Map className="w-4 h-4" />
        </button>
        <LanguageSelector />
        <VolumeControl
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMusicVolumeChange={onMusicVolumeChange}
          onSfxVolumeChange={onSfxVolumeChange}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl px-4 py-4 sm:py-8 flex flex-col items-center gap-6 sm:gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Swords className="w-10 h-10 mx-auto mb-2 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-['Cinzel'] font-bold text-primary drop-shadow-[0_0_24px_hsl(38_60%_50%/0.5)]">
            {t.appName.toUpperCase()}
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary/70 mt-1 font-['Cinzel']">
            {t.ancientStrategy}
          </p>
        </motion.div>

        {/* Variant Carousel (top, under title) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full"
        >
          <div className="flex items-center gap-4 mb-4 justify-center">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-primary/40" />
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70 font-['Cinzel'] font-semibold whitespace-nowrap">
              {t.selectYourSaga}
            </p>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="flex gap-2 sm:gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory justify-start sm:justify-center flex-nowrap sm:flex-wrap px-2 sm:px-0 -mx-2 sm:mx-0 pb-2">
            {GAME_VARIANTS.map((variant) => {
              const isActive = selectedVariant.id === variant.id;
              const flag = VARIANT_FLAGS[variant.id] || '🏳️';
              return (
                <div key={variant.id} className="relative shrink-0 snap-center">
                  <motion.button
                    onClick={() => handleVariantChange(variant)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`carved-button px-3 sm:px-5 py-3 rounded-lg text-center min-w-[96px] sm:min-w-[110px] transition-all ${
                      isActive
                        ? 'active ring-2 ring-primary/40 scale-105'
                        : 'text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-base" role="img" aria-label={variant.origin}>{flag}</span>
                      <span className="font-['Cinzel'] text-sm font-semibold">{variant.name}</span>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isActive ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {variant.boardType === 'circular' ? t.circular : `${variant.boardSize}×${variant.boardSize}`}
                    </p>
                  </motion.button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoVariant(infoVariant?.id === variant.id ? null : variant);
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-colors z-10 shadow-md"
                    title={`${t.infoAbout} ${variant.name}`}
                    aria-label={`${t.infoAbout} ${variant.name}`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {infoVariant && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 mx-auto max-w-lg carved-button rounded-lg p-4 relative"
              >
                <button
                  onClick={() => setInfoVariant(null)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{VARIANT_FLAGS[infoVariant.id] || '🏳️'}</span>
                  <h4 className="font-['Cinzel'] text-primary font-semibold">{infoVariant.name}</h4>
                  <span className="text-xs text-muted-foreground">— {infoVariant.origin}, {infoVariant.era}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {getVariantHistory(infoVariant.id, infoVariant.history)}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{t.boardLabel}: {infoVariant.boardType === 'circular' ? t.circularWeb : `${infoVariant.boardSize}×${infoVariant.boardSize}`}</span>
                  <span>{t.victoryLabel}: {infoVariant.defaultRules.victoryType === 'connection' ? t.connection : t.kingEscape}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center area: Parchment + Settings */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">

          {/* Parchment Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="parchment rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full sm:-rotate-1 relative"
          >
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-800/40" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-800/40" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-800/40" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-800/40" />

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVariant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold mb-1">
                  {t.currentVariant}
                </p>
                <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-amber-950 mb-3">
                  {selectedVariant.name}
                </h2>
                <p className="text-sm text-amber-900/80 italic leading-relaxed mb-6 font-['Crimson_Text']">
                  "{getVariantHistory(selectedVariant.id, selectedVariant.history).slice(0, 180)}…"
                </p>

                <div className="flex justify-between border-t border-amber-800/20 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-amber-700 uppercase tracking-wider font-semibold">{t.boardLabel}</p>
                    <p className="text-lg font-['Cinzel'] font-bold text-amber-950">
                      {isFidchell ? `7 ${t.rings}` : `${selectedVariant.boardSize}×${selectedVariant.boardSize}`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
                      {isFidchell ? t.black : t.attackers}
                    </p>
                    <p className="text-lg font-['Cinzel'] font-bold text-amber-950">
                      {isFidchell ? 12 : attackerCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
                      {isFidchell ? t.white : t.defenders}
                    </p>
                    <p className="text-lg font-['Cinzel'] font-bold text-amber-950">
                      {isFidchell ? '12' : `${defenderCount}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="w-full max-w-xs space-y-5"
          >
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-['Cinzel'] font-semibold border-l-2 border-primary pl-3">
                {t.playAs}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setPlayerSide('defender')}
                  className={`carved-button w-full px-4 py-3 rounded-lg flex items-center gap-3 text-left ${
                    playerSide === 'defender' ? 'active' : 'text-foreground'
                  }`}
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-['Cinzel'] text-sm font-semibold">
                      {isFidchell ? t.white : t.defenders}
                    </p>
                    <p className={`text-[10px] ${playerSide === 'defender' ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {isFidchell ? t.connectNavelToEdge : t.protectKing}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setPlayerSide('attacker')}
                  className={`carved-button w-full px-4 py-3 rounded-lg flex items-center gap-3 text-left ${
                    playerSide === 'attacker' ? 'active' : 'text-foreground'
                  }`}
                >
                  <Swords className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-['Cinzel'] text-sm font-semibold">
                      {isFidchell ? t.black : t.attackers}
                    </p>
                    <p className={`text-[10px] ${playerSide === 'attacker' ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {isFidchell ? t.blockTheConnection : t.captureKing}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-['Cinzel'] font-semibold border-l-2 border-primary pl-3">
                {t.difficulty}
              </h3>
              <div className="space-y-2">
                {difficultyMap.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`carved-button w-full px-4 py-2.5 rounded-lg text-left ${
                      difficulty === d.key ? 'active' : 'text-foreground'
                    }`}
                  >
                    <span className="font-['Cinzel'] text-sm font-semibold">{d.vikingName}</span>
                    <span className={`text-[10px] ml-2 ${difficulty === d.key ? 'opacity-70' : 'text-muted-foreground'}`}>
                      ({d.label})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartGame(selectedVariant.boardSize, playerSide, difficulty, 'play', selectedVariant.id)}
              className="w-full py-4 sm:py-3.5 rounded-lg font-['Cinzel'] font-bold text-lg uppercase tracking-wider
                bg-gradient-to-b from-primary to-[hsl(35_55%_38%)] text-primary-foreground
                shadow-[0_0_20px_hsl(38_60%_50%/0.4)] hover:shadow-[0_0_30px_hsl(38_60%_50%/0.6)]
                transition-shadow flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Play className="w-5 h-5" />
              {t.beginBattle}
            </button>

            <button
              onClick={() => onStartGame(selectedVariant.boardSize, playerSide, difficulty, 'demo', selectedVariant.id)}
              className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              {t.watchDemo}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Kamrok logo */}
      <a
        href="https://kamrok.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-3 z-30 safe-bottom"
      >
        <img src={kamrokLogo} alt="Kamrok" className="h-5 sm:h-6 w-auto drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity" />
      </a>

      {/* Built with Lovable badge */}
      <a
        href="https://lovable.dev/invite/8MUK1UP"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-3 z-30 safe-bottom"
      >
        <img src={builtwithImg} alt="Built with Lovable" className="h-5 sm:h-6 w-auto drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity" />
      </a>

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
