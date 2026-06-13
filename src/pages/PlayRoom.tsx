import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomSync } from '@/hooks/useRoomSync';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProfileChip } from '@/components/auth/ProfileChip';
import { Copy, Loader2, ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { GAME_VARIANTS } from '@/constants/game';
import vikingTableBg from '@/assets/viking-table-bg.jpg';
import { ERA_IMAGES } from '@/components/ancient/EraBackdrop';

/**
 * Online multiplayer room. v1 is a lobby + status view that confirms the
 * sync layer (auth, RLS, realtime) works end-to-end. The live 3D board
 * with move-by-move sync ships in the next iteration on top of this same
 * `rooms` + `useRoomSync` foundation.
 */
export default function PlayRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const { room, loading, error, mySide, participants } = useRoomSync(code);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Invite link copied');
  };

  const variant = room ? GAME_VARIANTS.find(v => v.id === room.variant_id) : null;
  const bg = room ? (ERA_IMAGES[room.variant_id] || vikingTableBg) : vikingTableBg;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} />
      <div className="absolute inset-0 bg-black/65" />

      <header className="relative z-10 flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Home
        </Button>
        <ProfileChip />
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {(authLoading || loading) ? (
          <div className="flex items-center justify-center py-20 text-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading room…
          </div>
        ) : !room ? (
          <div className="parchment rounded-lg p-6 text-center">
            <h1 className="font-['Cinzel'] text-2xl text-amber-900 mb-2">Room not found</h1>
            <p className="text-amber-950/80 text-sm mb-4">No game exists with code <span className="font-mono">{code}</span>.</p>
            <Button onClick={() => navigate('/')}>Back to home</Button>
          </div>
        ) : (
          <div className="parchment rounded-lg p-5 sm:p-8 space-y-5">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-amber-900/70 font-['Cinzel']">Room</p>
              <p className="text-4xl font-['Cinzel'] font-bold text-amber-900 tracking-[0.3em]">{room.code}</p>
              <p className="text-sm text-amber-950/80 mt-2 font-['Cinzel']">{variant?.name ?? room.variant_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SeatCard
                title="Host"
                name={participants[room.host_id]?.display_name ?? '…'}
                side={room.host_side}
                isMe={mySide === room.host_side}
              />
              <SeatCard
                title="Challenger"
                name={room.guest_id ? (participants[room.guest_id]?.display_name ?? '…') : 'Waiting…'}
                side={room.host_side === 'attacker' ? 'defender' : 'attacker'}
                isMe={!!mySide && mySide !== room.host_side}
                waiting={!room.guest_id}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={copy} className="flex-1">
                <Copy className="w-4 h-4 mr-2" /> Copy invite link
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                <Users className="w-4 h-4 mr-2" /> Start playing locally
              </Button>
            </div>

            <div className="text-[11px] text-center text-amber-950/70 italic">
              Status: <strong>{room.status}</strong> · You play as <strong>{mySide ?? 'spectator'}</strong>
              <br/>Live board sync ships in the next update — your room, code, and invite link are already saved.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SeatCard({ title, name, side, isMe, waiting }: { title: string; name: string; side: string; isMe: boolean; waiting?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${isMe ? 'border-primary bg-primary/10' : 'border-amber-900/30 bg-amber-50/40'}`}>
      <p className="text-[10px] uppercase tracking-wider text-amber-900/70 font-['Cinzel']">{title}</p>
      <p className={`font-['Cinzel'] font-semibold truncate ${waiting ? 'text-amber-900/50 italic' : 'text-amber-950'}`}>{name}</p>
      <p className="text-[10px] text-amber-900/60 capitalize mt-0.5">{side}{isMe ? ' · you' : ''}</p>
    </div>
  );
}
