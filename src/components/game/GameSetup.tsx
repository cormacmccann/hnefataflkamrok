import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BoardSize, Player, AIDifficulty, GameMode } from '@/types/game';
import { ChevronLeft, ChevronRight, Play, BookOpen, Sparkles, Zap, Brain, Skull, Eye } from 'lucide-react';
import vikingBackground from '@/assets/viking-background.jpg';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';
import tutorialKing from '@/assets/tutorial-king.png';
import tutorialDefender from '@/assets/tutorial-defender.png';
import tutorialAttacker from '@/assets/tutorial-attacker.png';
import tutorialCapturing from '@/assets/tutorial-capturing.png';
import tutorialVictory from '@/assets/tutorial-victory.png';
import { VolumeControl } from './VolumeControl';

interface GameSetupProps {
  onStartGame: (boardSize: BoardSize, playerSide: Player, difficulty: AIDifficulty, mode: GameMode) => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
}

const tutorialSteps = [
  {
    title: "The King",
    image: tutorialKing,
    description: "The King is the most important piece. He starts in the center (the Throne) and must escape to any corner to win.",
    rules: [
      "Moves like all pieces: any number of squares horizontally or vertically",
      "Only piece that can enter corner squares",
      "Only piece that can re-enter the Throne after leaving",
      "Must be surrounded on ALL 4 sides to be captured"
    ]
  },
  {
    title: "The Defenders",
    image: tutorialDefender,
    description: "Defenders protect the King and help clear his escape route. They start around the King in the center.",
    rules: [
      "Move any number of squares horizontally or vertically",
      "Cannot enter corner squares or the Throne",
      "Captured by being sandwiched between two enemies",
      "Work together to block attackers and create escape paths"
    ]
  },
  {
    title: "The Attackers",
    image: tutorialAttacker,
    description: "Attackers start on the edges and outnumber defenders 2:1. Their goal is to capture the King.",
    rules: [
      "Move any number of squares horizontally or vertically",
      "Cannot enter corner squares or the Throne",
      "Must surround the King on all 4 sides to win",
      "Attackers always move first"
    ]
  },
  {
    title: "Capturing",
    image: tutorialCapturing,
    description: "Capture enemy pieces by sandwiching them between two of your pieces (or a piece and a hostile square).",
    rules: [
      "Move a piece to complete the sandwich - captures happen on your move",
      "Corner squares and empty Throne count as hostile",
      "You can safely move between two enemies without being captured",
      "The King requires 4-sided capture (or 3 sides + hostile square)"
    ]
  },
  {
    title: "Victory",
    image: tutorialVictory,
    description: "The game ends when either side achieves their objective.",
    rules: [
      "Defenders WIN: King reaches any corner square",
      "Attackers WIN: King is surrounded on all 4 sides",
      "Strategic tip: Control the corners and center diagonals",
      "The King's mobility is key - keep him free to move!"
    ]
  }
];

export function GameSetup({ 
  onStartGame, 
  musicVolume, 
  sfxVolume, 
  onMusicVolumeChange, 
  onSfxVolumeChange 
}: GameSetupProps) {
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);

  const nextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  const currentStep = tutorialSteps[tutorialStep];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${vikingBackground})` }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      
      {/* Volume Control in corner */}
      <div className="fixed top-4 right-4 z-20">
        <VolumeControl
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMusicVolumeChange={onMusicVolumeChange}
          onSfxVolumeChange={onSfxVolumeChange}
        />
      </div>
      
      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {showTutorial ? (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="viking-border bg-card/95 backdrop-blur">
                <CardHeader className="text-center pb-2">
                  <img 
                    src={hnefataflLogo} 
                    alt="Hnefatafl" 
                    className="h-16 mx-auto mb-2"
                  />
                  <CardTitle className="text-2xl font-['Cinzel'] text-primary">
                    Learn the Game
                  </CardTitle>
                  <CardDescription>
                    Step {tutorialStep + 1} of {tutorialSteps.length}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2">
                    {tutorialSteps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTutorialStep(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === tutorialStep 
                            ? 'bg-primary scale-125' 
                            : idx < tutorialStep 
                              ? 'bg-primary/50' 
                              : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  <motion.div
                    key={tutorialStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {/* Left: Image Preview */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-secondary/30">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-full max-w-[180px]"
                      >
                        <img 
                          src={currentStep.image} 
                          alt={currentStep.title}
                          className="w-full h-auto object-contain drop-shadow-2xl max-h-[180px]"
                          loading="lazy"
                          decoding="async"
                        />
                      </motion.div>
                      <h3 className="text-2xl font-['Cinzel'] text-primary mt-4">
                        {currentStep.title}
                      </h3>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-4">
                      <p className="text-lg text-foreground/90">
                        {currentStep.description}
                      </p>
                      <ul className="space-y-2">
                        {currentStep.rules.map((rule, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{rule}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={tutorialStep === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setShowTutorial(false)}
                      className="text-muted-foreground"
                    >
                      Skip Tutorial
                    </Button>

                    <Button onClick={nextStep} className="gap-2">
                      {tutorialStep === tutorialSteps.length - 1 ? (
                        <>
                          Start Playing
                          <Play className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full max-w-lg mx-auto viking-border bg-card/95 backdrop-blur">
                <CardHeader className="text-center">
                  <img 
                    src={hnefataflLogo} 
                    alt="Hnefatafl" 
                    className="h-20 mx-auto mb-2"
                  />
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

                  <div className="space-y-3">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Difficulty
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={difficulty === 'beginner' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('beginner')}
                        className="h-auto py-3 flex-col gap-1"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-['Cinzel'] text-xs">Beginner</span>
                      </Button>
                      <Button
                        variant={difficulty === 'easy' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('easy')}
                        className="h-auto py-3 flex-col gap-1"
                      >
                        <Zap className="w-5 h-5" />
                        <span className="font-['Cinzel'] text-xs">Easy</span>
                      </Button>
                      <Button
                        variant={difficulty === 'medium' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('medium')}
                        className="h-auto py-3 flex-col gap-1"
                      >
                        <Brain className="w-5 h-5" />
                        <span className="font-['Cinzel'] text-xs">Medium</span>
                      </Button>
                      <Button
                        variant={difficulty === 'valhalla' ? 'default' : 'outline'}
                        onClick={() => setDifficulty('valhalla')}
                        className="h-auto py-3 flex-col gap-1 text-destructive"
                      >
                        <Skull className="w-5 h-5" />
                        <span className="font-['Cinzel'] text-xs">Valhalla</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => onStartGame(boardSize, playerSide, difficulty, 'play')} 
                      className="h-12 text-lg font-['Cinzel']"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onStartGame(boardSize, playerSide, difficulty, 'demo')} 
                      className="h-12 text-lg font-['Cinzel']"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Demo
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowTutorial(true)}
                      className="gap-2 text-muted-foreground"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Tutorial Again
                    </Button>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    <p>Attackers move first. {playerSide === 'attacker' ? 'You start!' : 'AI starts.'}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
