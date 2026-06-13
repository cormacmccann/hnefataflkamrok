
-- Daily puzzles: one per (date, variant), readable by everyone
CREATE TABLE public.daily_puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_date date NOT NULL,
  variant_id text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  side_to_move text NOT NULL CHECK (side_to_move IN ('attacker','defender')),
  goal text NOT NULL,
  position jsonb NOT NULL,
  solution jsonb NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (puzzle_date, variant_id)
);

GRANT SELECT ON public.daily_puzzles TO anon, authenticated;
GRANT ALL ON public.daily_puzzles TO service_role;

ALTER TABLE public.daily_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily puzzles are public"
  ON public.daily_puzzles FOR SELECT
  USING (true);

CREATE INDEX idx_daily_puzzles_date ON public.daily_puzzles (puzzle_date DESC);

-- Puzzle attempts: per-user solve records
CREATE TABLE public.puzzle_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES public.daily_puzzles(id) ON DELETE CASCADE,
  solved boolean NOT NULL DEFAULT false,
  moves_taken int NOT NULL DEFAULT 0,
  time_seconds int,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, puzzle_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.puzzle_attempts TO authenticated;
GRANT ALL ON public.puzzle_attempts TO service_role;

ALTER TABLE public.puzzle_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attempts"
  ON public.puzzle_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own attempts"
  ON public.puzzle_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
  ON public.puzzle_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_puzzle_attempts_user ON public.puzzle_attempts (user_id, completed_at DESC);
