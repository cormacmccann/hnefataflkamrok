
-- =========================
-- Enums
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.room_status AS ENUM ('waiting', 'active', 'finished', 'abandoned');
CREATE TYPE public.player_side AS ENUM ('attacker', 'defender');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted');

-- =========================
-- Profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by signed-in users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =========================
-- User roles
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================
-- Rooms
-- =========================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  variant_id TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_side public.player_side NOT NULL DEFAULT 'defender',
  status public.room_status NOT NULL DEFAULT 'waiting',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_player public.player_side NOT NULL DEFAULT 'attacker',
  winner public.player_side,
  move_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_move_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rooms_host_idx ON public.rooms(host_id);
CREATE INDEX rooms_guest_idx ON public.rooms(guest_id);
CREATE INDEX rooms_status_idx ON public.rooms(status);
GRANT SELECT, INSERT, UPDATE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Host and guest can see their rooms"
  ON public.rooms FOR SELECT TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id);
CREATE POLICY "Anyone signed in can create a room as themselves"
  ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host and guest can update their room"
  ON public.rooms FOR UPDATE TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- =========================
-- Room moves (append-only log)
-- =========================
CREATE TABLE public.room_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  idx INT NOT NULL,
  by_player UUID NOT NULL REFERENCES public.profiles(id),
  by_side public.player_side NOT NULL,
  move JSONB NOT NULL,
  state_after JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, idx)
);
CREATE INDEX room_moves_room_idx ON public.room_moves(room_id, idx);
GRANT SELECT, INSERT ON public.room_moves TO authenticated;
GRANT ALL ON public.room_moves TO service_role;
ALTER TABLE public.room_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read moves of their rooms"
  ON public.room_moves FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_id AND (r.host_id = auth.uid() OR r.guest_id = auth.uid())
  ));
CREATE POLICY "Current player can append a move"
  ON public.room_moves FOR INSERT TO authenticated
  WITH CHECK (
    by_player = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_id
        AND (r.host_id = auth.uid() OR r.guest_id = auth.uid())
        AND r.status = 'active'
        AND (
          (r.host_side = by_side AND r.host_id = auth.uid()) OR
          (r.host_side <> by_side AND r.guest_id = auth.uid())
        )
        AND r.current_player = by_side
    )
  );

-- =========================
-- Friendships
-- =========================
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their friendships"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friend requests"
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Either party can update a friendship"
  ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Either party can remove a friendship"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- =========================
-- Game invites
-- =========================
CREATE TABLE public.game_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.invite_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, to_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_invites TO authenticated;
GRANT ALL ON public.game_invites TO service_role;
ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see invites involving them"
  ON public.game_invites FOR SELECT TO authenticated
  USING (auth.uid() = from_id OR auth.uid() = to_id);
CREATE POLICY "Users can send invites as themselves"
  ON public.game_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_id);
CREATE POLICY "Recipient can update invite status"
  ON public.game_invites FOR UPDATE TO authenticated
  USING (auth.uid() = to_id OR auth.uid() = from_id);

-- =========================
-- Triggers
-- =========================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER rooms_touch BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER friendships_touch BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on user signup (anonymous or full).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name TEXT;
  v_is_anon BOOLEAN;
BEGIN
  v_is_anon := COALESCE(NEW.is_anonymous, false);
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(COALESCE(NEW.email, ''), '@', 1),
    NULL
  );
  IF v_name IS NULL OR v_name = '' THEN
    v_name := CASE WHEN v_is_anon
      THEN 'Wanderer ' || lpad((floor(random()*9000)+1000)::int::text, 4, '0')
      ELSE 'Player ' || lpad((floor(random()*9000)+1000)::int::text, 4, '0')
    END;
  END IF;
  INSERT INTO public.profiles (id, display_name, is_anonymous)
  VALUES (NEW.id, v_name, v_is_anon)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- Room helpers (security definer so anyone with code can look it up)
-- =========================
CREATE OR REPLACE FUNCTION public.gen_room_code()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(alphabet, (floor(random()*length(alphabet))+1)::int, 1);
  END LOOP;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.join_room(_code TEXT)
RETURNS public.rooms LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rooms;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO r FROM public.rooms WHERE upper(code) = upper(_code) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'room_not_found'; END IF;
  IF r.host_id = auth.uid() OR r.guest_id = auth.uid() THEN
    RETURN r;
  END IF;
  IF r.guest_id IS NOT NULL THEN RAISE EXCEPTION 'room_full'; END IF;
  IF r.status <> 'waiting' THEN RAISE EXCEPTION 'room_unavailable'; END IF;
  UPDATE public.rooms
     SET guest_id = auth.uid(), status = 'active', updated_at = now()
   WHERE id = r.id
   RETURNING * INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.peek_room(_code TEXT)
RETURNS TABLE (
  id UUID, code TEXT, variant_id TEXT, status public.room_status,
  host_id UUID, guest_id UUID, host_side public.player_side,
  host_name TEXT, guest_name TEXT, created_at TIMESTAMPTZ
) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.code, r.variant_id, r.status, r.host_id, r.guest_id, r.host_side,
         hp.display_name, gp.display_name, r.created_at
    FROM public.rooms r
    JOIN public.profiles hp ON hp.id = r.host_id
    LEFT JOIN public.profiles gp ON gp.id = r.guest_id
   WHERE upper(r.code) = upper(_code)
   LIMIT 1
$$;

-- =========================
-- Realtime
-- =========================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_moves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_moves REPLICA IDENTITY FULL;
