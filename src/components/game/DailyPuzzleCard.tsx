import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Scroll, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GAME_VARIANTS } from '@/constants/game';

interface DailyPuzzle {
  id: string;
  puzzle_date: string;
  variant_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  side_to_move: 'attacker' | 'defender';
  goal: string;
  description: string | null;
}

interface Attempt {
  solved: boolean;
  completed_at: string;
}

const DIFFICULTY_LABEL = {
  easy: { label: 'Thrall', color: 'text-emerald-300', bg: 'bg-emerald-900/30' },
  medium: { label: 'Karl', color: 'text-amber-300', bg: 'bg-amber-900/30' },
  hard: { label: 'Jarl', color: 'text-rose-300', bg: 'bg-rose-900/30' },
};

export function DailyPuzzleCard() {
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [streak, setStreak] = useState(0);
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      // Get today's puzzle, or fall back to most recent
      const { data: byDate } = await supabase
        .from('daily_puzzles')
        .select('*')
        .lte('puzzle_date', today)
        .order('puzzle_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setPuzzle((byDate as DailyPuzzle) ?? null);

      if (byDate && user) {
        const { data: att } = await supabase
          .from('puzzle_attempts')
          .select('solved, completed_at')
          .eq('user_id', user.id)
          .eq('puzzle_id', byDate.id)
          .maybeSingle();
        if (!cancelled) setAttempt(att as Attempt | null);

        // Streak: count consecutive solved days ending today
        const { data: history } = await supabase
          .from('puzzle_attempts')
          .select('solved, completed_at, daily_puzzles(puzzle_date)')
          .eq('user_id', user.id)
          .eq('solved', true)
          .order('completed_at', { ascending: false })
          .limit(60);
        if (!cancelled && history) {
          const dates = new Set(
            history
              .map((h) => h.daily_puzzles?.puzzle_date)
              .filter(Boolean),
          );
          let count = 0;
          const cursor = new Date();
          while (dates.has(cursor.toISOString().slice(0, 10))) {
            count++;
            cursor.setDate(cursor.getDate() - 1);
          }
          setStreak(count);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleMarkSolved = async () => {
    if (!user || !puzzle) return;
    setSolving(true);
    const { error } = await supabase
      .from('puzzle_attempts')
      .upsert(
        { user_id: user.id, puzzle_id: puzzle.id, solved: true, moves_taken: 0 },
        { onConflict: 'user_id,puzzle_id' },
      );
    if (!error) {
      setAttempt({ solved: true, completed_at: new Date().toISOString() });
      setStreak((s) => s + (attempt?.solved ? 0 : 1));
    }
    setSolving(false);
  };

  if (loading) {
    return (
      <div className="parchment rounded-lg p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="parchment rounded-lg p-4">
        <p className="text-xs text-amber-700 uppercase tracking-[0.2em] font-semibold mb-1">
          Daily Saga
        </p>
        <p className="text-sm text-amber-900/80 italic font-['Crimson_Text']">
          New puzzles being inscribed by the scribes. Return at dawn.
        </p>
      </div>
    );
  }

  const variant = GAME_VARIANTS.find((v) => v.id === puzzle.variant_id);
  const diff = DIFFICULTY_LABEL[puzzle.difficulty];
  const solved = attempt?.solved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="parchment rounded-lg p-4 sm:p-5 max-w-md w-full sm:rotate-1 relative"
    >
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-800/40" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-800/40" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-800/40" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-800/40" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold flex items-center gap-1.5">
            <Scroll className="w-3 h-3" /> Daily Saga
          </p>
          <h3 className="text-xl font-['Cinzel'] font-bold text-amber-950">
            {variant?.name ?? puzzle.variant_id}
          </h3>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-['Cinzel'] ${diff.bg} ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      <p className="text-sm text-amber-900/90 italic leading-snug mb-3 font-['Crimson_Text']">
        {puzzle.description ?? puzzle.goal}
      </p>

      <div className="flex items-center justify-between text-xs text-amber-800/80 border-t border-amber-800/20 pt-3">
        <div className="flex items-center gap-1.5">
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-rose-600' : 'text-amber-800/40'}`} />
          <span className="font-['Cinzel'] font-semibold">
            {streak} day{streak === 1 ? '' : 's'}
          </span>
        </div>
        {solved ? (
          <span className="flex items-center gap-1 text-emerald-700 font-['Cinzel'] font-semibold">
            <Trophy className="w-4 h-4" /> Solved
          </span>
        ) : (
          <button
            onClick={handleMarkSolved}
            disabled={solving || !user}
            className="px-3 py-1.5 rounded bg-amber-800 hover:bg-amber-900 text-amber-50 font-['Cinzel'] text-xs uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {solving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Mark Solved
          </button>
        )}
      </div>
    </motion.div>
  );
}
