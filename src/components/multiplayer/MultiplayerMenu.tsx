import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GAME_VARIANTS } from '@/constants/game';
import { ERA_IMAGES } from '@/components/ancient/EraBackdrop';
import { toast } from 'sonner';
import { Users, Link2, Hash, Loader2, Copy, Check, Share2, Swords, Shield, Crown, Wifi, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const VARIANT_FLAGS: Record<string, string> = {
  fidchell: '🇮🇪',
  brandub: '🇮🇪',
  tablut: '🇸🇪',
  tawlbwrdd: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  hnefatafl: '🇳🇴',
  alea: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called when user picks pass-and-play with a chosen variant id. */
  onPassAndPlay: (variantId: string) => void;
}

function VariantPicker({
  variantId,
  setVariantId,
}: {
  variantId: string;
  setVariantId: (id: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">Choose a game</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[42vh] overflow-y-auto pr-1 -mr-1">
        {GAME_VARIANTS.map((v) => {
          const active = v.id === variantId;
          const era = ERA_IMAGES[v.id];
          const flag = VARIANT_FLAGS[v.id] || '🏳️';
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              className={cn(
                'carved-button rounded-lg overflow-hidden text-left transition-all relative group',
                active && 'ring-2 ring-primary scale-[1.02]'
              )}
            >
              {era && (
                <div className="relative h-16 sm:h-20 overflow-hidden">
                  <img
                    src={era}
                    alt={v.origin}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  {active && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              )}
              <div className="p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-sm" role="img" aria-label={v.origin}>
                    {flag}
                  </span>
                  <span className="font-['Cinzel'] text-xs font-semibold truncate">{v.name}</span>
                </div>
                <p className="text-[9px] text-muted-foreground truncate">
                  {v.boardType === 'circular' ? '7 rings' : `${v.boardSize}×${v.boardSize}`} · {v.era}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HowItWorks({ steps }: { steps: { icon: React.ReactNode; title: string; desc: string }[] }) {
  return (
    <ol className="space-y-1.5 bg-muted/40 rounded-lg p-2.5 border border-border/50">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px] leading-snug">
          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary font-['Cinzel'] font-bold text-[10px] flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="flex-1">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              {s.icon}
              {s.title}
            </span>
            <span className="text-muted-foreground"> — {s.desc}</span>
          </span>
        </li>
      ))}
    </ol>
  );
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

  const selected = GAME_VARIANTS.find((v) => v.id === variantId);

  const createRoom = async () => {
    if (!user) {
      toast.error('Please wait a moment, signing you in as guest…');
      return;
    }
    setBusy(true);
    const { data: codeData, error: codeErr } = await supabase.rpc('gen_room_code');
    if (codeErr || !codeData) {
      setBusy(false);
      toast.error('Could not create room');
      return;
    }
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code: codeData as string,
        variant_id: variantId,
        host_id: user.id,
        host_side: hostSide,
        rules: (selected?.defaultRules ?? {}) as never,
        state: {},
        status: 'waiting',
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? 'Could not create room');
      return;
    }
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

  const shareNative = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Come play Tafl with me',
          text: `Join my ${selected?.name ?? 'Tafl'} game — room code ${createdCode}`,
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setCreatedCode(null);
          setCode('');
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Cinzel'] flex items-center gap-2">
            <Users className="w-5 h-5" /> Play with a friend
          </DialogTitle>
          <DialogDescription>
            Anyone can play as a guest — sign in later to save history and friends.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="online">
          <TabsList className="grid grid-cols-3 w-full h-auto">
            <TabsTrigger value="online" className="flex-col gap-0.5 py-2 text-[11px]">
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </TabsTrigger>
            <TabsTrigger value="join" className="flex-col gap-0.5 py-2 text-[11px]">
              <Hash className="w-4 h-4" />
              <span>Join code</span>
            </TabsTrigger>
            <TabsTrigger value="local" className="flex-col gap-0.5 py-2 text-[11px]">
              <Smartphone className="w-4 h-4" />
              <span>Same device</span>
            </TabsTrigger>
          </TabsList>

          {/* ───────────── CREATE ONLINE ROOM ───────────── */}
          <TabsContent value="online" className="space-y-3 pt-3">
            {!createdCode ? (
              <>
                <HowItWorks
                  steps={[
                    {
                      icon: <Swords className="w-3 h-3" />,
                      title: 'Pick a game',
                      desc: 'Choose any Tafl variant below.',
                    },
                    {
                      icon: <Crown className="w-3 h-3" />,
                      title: 'Pick your side',
                      desc: 'Defend the King or lead the attackers.',
                    },
                    {
                      icon: <Share2 className="w-3 h-3" />,
                      title: 'Send the link',
                      desc: 'Your friend joins and the battle begins.',
                    },
                  ]}
                />

                <VariantPicker variantId={variantId} setVariantId={setVariantId} />

                {selected && (
                  <p className="text-[11px] text-muted-foreground italic px-1">
                    {selected.origin} · {selected.era}
                  </p>
                )}

                <div>
                  <Label className="mb-1 block">You play as</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={hostSide === 'defender' ? 'default' : 'outline'}
                      onClick={() => setHostSide('defender')}
                      className="h-auto py-2 flex-col gap-0.5"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="text-xs">Defender (King)</span>
                    </Button>
                    <Button
                      type="button"
                      variant={hostSide === 'attacker' ? 'default' : 'outline'}
                      onClick={() => setHostSide('attacker')}
                      className="h-auto py-2 flex-col gap-0.5"
                    >
                      <Swords className="w-4 h-4" />
                      <span className="text-xs">Attacker</span>
                    </Button>
                  </div>
                </div>

                <Button onClick={createRoom} disabled={busy} className="w-full min-h-11">
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create room & get share link
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="parchment rounded-lg p-4 text-center">
                  <p className="text-xs text-amber-950 mb-1 font-['Cinzel'] uppercase tracking-wider">
                    Room code
                  </p>
                  <p className="text-3xl sm:text-4xl font-['Cinzel'] font-bold text-amber-900 tracking-[0.3em]">
                    {createdCode}
                  </p>
                  {selected && (
                    <p className="text-[11px] text-amber-800 mt-2">
                      {selected.name} · You play as {hostSide === 'defender' ? 'Defender 👑' : 'Attacker ⚔️'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} className="text-xs" />
                  <Button onClick={copy} variant="outline" size="icon" title="Copy link">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={shareNative} variant="outline" className="min-h-11">
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                  <Button onClick={() => goToRoom(createdCode)} className="min-h-11">
                    Enter room
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Share the code or link with a friend. The game starts when they join.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ───────────── JOIN BY CODE ───────────── */}
          <TabsContent value="join" className="space-y-3 pt-3">
            <HowItWorks
              steps={[
                {
                  icon: <Hash className="w-3 h-3" />,
                  title: 'Got a 6-letter code?',
                  desc: 'Type it in below to join your friend.',
                },
                {
                  icon: <Link2 className="w-3 h-3" />,
                  title: 'Or open the link',
                  desc: 'Tapping a share link drops you straight into the room.',
                },
              ]}
            />
            <div>
              <Label className="mb-1 block">Room code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="HRAVEN"
                className="font-['Cinzel'] tracking-[0.3em] text-center text-lg uppercase h-12"
              />
            </div>
            <Button onClick={joinByCode} disabled={code.length < 4} className="w-full min-h-11">
              Join game
            </Button>
          </TabsContent>

          {/* ───────────── PASS AND PLAY ───────────── */}
          <TabsContent value="local" className="space-y-3 pt-3">
            <HowItWorks
              steps={[
                {
                  icon: <Smartphone className="w-3 h-3" />,
                  title: 'One device, two players',
                  desc: 'Pass the phone or tablet after each move.',
                },
                {
                  icon: <Shield className="w-3 h-3" />,
                  title: 'No internet needed',
                  desc: 'The AI sits this one out — both sides are human.',
                },
              ]}
            />
            <VariantPicker variantId={variantId} setVariantId={setVariantId} />
            <Button
              onClick={() => {
                onOpenChange(false);
                onPassAndPlay(variantId);
              }}
              className="w-full min-h-11"
            >
              Start pass-and-play
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
