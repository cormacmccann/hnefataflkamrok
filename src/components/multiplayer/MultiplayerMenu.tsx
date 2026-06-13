import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GAME_VARIANTS } from '@/constants/game';
import { toast } from 'sonner';
import { Users, Link2, Hash, Loader2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called when user picks pass-and-play with a chosen variant id. */
  onPassAndPlay: (variantId: string) => void;
}

export function MultiplayerMenu({ open, onOpenChange, onPassAndPlay }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [variantId, setVariantId] = useState<string>('hnefatafl');
  const [hostSide, setHostSide] = useState<'attacker' | 'defender'>('defender');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoom = async () => {
    if (!user) {
      toast.error('Please wait a moment, signing you in as guest…');
      return;
    }
    setBusy(true);
    const { data: codeData, error: codeErr } = await supabase.rpc('gen_room_code');
    if (codeErr || !codeData) { setBusy(false); toast.error('Could not create room'); return; }
    const variant = GAME_VARIANTS.find(v => v.id === variantId);
    const { data, error } = await supabase.from('rooms').insert({
      code: codeData as string,
      variant_id: variantId,
      host_id: user.id,
      host_side: hostSide,
      rules: (variant?.defaultRules ?? {}) as never,
      state: {},
      status: 'waiting',
    }).select().single();
    setBusy(false);
    if (error || !data) { toast.error(error?.message ?? 'Could not create room'); return; }
    setCreatedCode(data.code);
  };

  const goToRoom = (c: string) => {
    onOpenChange(false);
    navigate(`/play/${c.toUpperCase()}`);
  };

  const joinByCode = async () => {
    if (!code.trim()) return;
    goToRoom(code.trim().toUpperCase());
  };

  const shareUrl = createdCode ? `${window.location.origin}/play/${createdCode}` : '';
  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setCreatedCode(null); setCode(''); } }}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Cinzel'] flex items-center gap-2"><Users className="w-5 h-5" /> Multiplayer</DialogTitle>
          <DialogDescription>Play with someone next to you or anywhere in the world.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="online">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="online"><Link2 className="w-3.5 h-3.5 mr-1" /> Create</TabsTrigger>
            <TabsTrigger value="join"><Hash className="w-3.5 h-3.5 mr-1" /> Join</TabsTrigger>
            <TabsTrigger value="local"><Users className="w-3.5 h-3.5 mr-1" /> Same screen</TabsTrigger>
          </TabsList>

          <TabsContent value="online" className="space-y-3 pt-3">
            {!createdCode ? (
              <>
                <div>
                  <Label>Variant</Label>
                  <select value={variantId} onChange={e => setVariantId(e.target.value)} className="w-full mt-1 carved-button rounded-md px-3 py-2 bg-background text-foreground">
                    {GAME_VARIANTS.map(v => <option key={v.id} value={v.id}>{v.name} — {v.boardSize}×{v.boardSize}</option>)}
                  </select>
                </div>
                <div>
                  <Label>You play as</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button type="button" variant={hostSide === 'defender' ? 'default' : 'outline'} onClick={() => setHostSide('defender')}>Defender (King)</Button>
                    <Button type="button" variant={hostSide === 'attacker' ? 'default' : 'outline'} onClick={() => setHostSide('attacker')}>Attacker</Button>
                  </div>
                </div>
                <Button onClick={createRoom} disabled={busy} className="w-full">
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create room
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="parchment rounded-lg p-4 text-center">
                  <p className="text-xs text-amber-950 mb-1 font-['Cinzel']">Room code</p>
                  <p className="text-3xl font-['Cinzel'] font-bold text-amber-900 tracking-[0.3em]">{createdCode}</p>
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} className="text-xs" />
                  <Button onClick={copy} variant="outline" size="icon">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Button onClick={() => goToRoom(createdCode)} className="w-full">Enter room</Button>
                <p className="text-[11px] text-muted-foreground text-center">Share the code or link with a friend. The game starts when they join.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="join" className="space-y-3 pt-3">
            <div>
              <Label>Room code</Label>
              <Input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="HRAVEN"
                className="font-['Cinzel'] tracking-[0.3em] text-center text-lg uppercase"
              />
            </div>
            <Button onClick={joinByCode} disabled={code.length < 4} className="w-full">Join game</Button>
            <p className="text-[11px] text-muted-foreground text-center">Or open the share link your friend sent you — it opens the room directly.</p>
          </TabsContent>

          <TabsContent value="local" className="space-y-3 pt-3">
            <div>
              <Label>Variant</Label>
              <select value={variantId} onChange={e => setVariantId(e.target.value)} className="w-full mt-1 carved-button rounded-md px-3 py-2 bg-background text-foreground">
                {GAME_VARIANTS.map(v => <option key={v.id} value={v.id}>{v.name} — {v.boardSize}×{v.boardSize}</option>)}
              </select>
            </div>
            <Button onClick={() => { onOpenChange(false); onPassAndPlay(variantId); }} className="w-full">Start pass-and-play</Button>
            <p className="text-[11px] text-muted-foreground text-center">Two players, one device. Pass the device after each move. No internet needed.</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
