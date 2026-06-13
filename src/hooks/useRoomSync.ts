import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GameState, Player } from '@/types/game';

export interface RoomRecord {
  id: string;
  code: string;
  variant_id: string;
  rules: Record<string, unknown>;
  host_id: string;
  guest_id: string | null;
  host_side: Player;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  state: Partial<GameState> & { __empty?: boolean };
  current_player: Player;
  winner: Player | null;
  move_count: number;
}

interface SyncResult {
  room: RoomRecord | null;
  loading: boolean;
  error: string | null;
  /** "attacker" / "defender" if I'm in this room, otherwise null. */
  mySide: Player | null;
  /** Profile names keyed by user id. */
  participants: Record<string, { display_name: string }>;
  /** Push a freshly computed GameState back to the server. */
  pushState: (next: GameState) => Promise<void>;
  /** Mark a winner. */
  finish: (winner: Player) => Promise<void>;
}

export function useRoomSync(code: string | undefined): SyncResult {
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, { display_name: string }>>({});
  const joiningRef = useRef(false);

  // Initial load + auto-join
  useEffect(() => {
    if (!code || !user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: existing, error: selErr } = await supabase
        .from('rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();
      if (cancelled) return;
      if (selErr) { setError(selErr.message); setLoading(false); return; }

      let current = existing as RoomRecord | null;
      // If I'm not host or guest yet, join via RPC (handles RLS lookup).
      if (!current || (current.host_id !== user.id && current.guest_id !== user.id)) {
        if (joiningRef.current) return;
        joiningRef.current = true;
        const { data: joined, error: jErr } = await supabase.rpc('join_room', { _code: code.toUpperCase() });
        joiningRef.current = false;
        if (jErr) { setError(jErr.message); setLoading(false); return; }
        current = joined as unknown as RoomRecord;
      }
      setRoom(current);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [code, user]);

  // Load participant names
  useEffect(() => {
    if (!room) return;
    const ids = [room.host_id, room.guest_id].filter(Boolean) as string[];
    if (ids.length === 0) return;
    supabase.from('profiles').select('id, display_name').in('id', ids).then(({ data }) => {
      if (!data) return;
      setParticipants(Object.fromEntries(data.map(p => [p.id, { display_name: p.display_name }])));
    });
  }, [room?.host_id, room?.guest_id]);

  // Realtime: subscribe to this room's updates
  useEffect(() => {
    if (!room?.id) return;
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        (payload) => setRoom(payload.new as RoomRecord),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room?.id]);

  const mySide: Player | null = !room || !user
    ? null
    : user.id === room.host_id ? room.host_side
    : user.id === room.guest_id ? (room.host_side === 'attacker' ? 'defender' : 'attacker')
    : null;

  const pushState = useCallback(async (next: GameState) => {
    if (!room) return;
    const { error: upErr } = await supabase.from('rooms').update({
      state: next as never,
      current_player: next.currentPlayer,
      move_count: room.move_count + 1,
      last_move_at: new Date().toISOString(),
      status: next.gameResult ? 'finished' : 'active',
      winner: next.gameResult === 'attacker-wins' ? 'attacker' : next.gameResult === 'defender-wins' ? 'defender' : null,
    }).eq('id', room.id);
    if (upErr) setError(upErr.message);
  }, [room]);

  const finish = useCallback(async (winner: Player) => {
    if (!room) return;
    await supabase.from('rooms').update({ status: 'finished', winner }).eq('id', room.id);
  }, [room]);

  return { room, loading, error, mySide, participants, pushState, finish };
}
