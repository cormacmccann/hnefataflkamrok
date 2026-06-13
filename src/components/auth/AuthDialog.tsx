import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'signup' }: Props) {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, isAnonymous } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === 'signin'
      ? await signInWithPassword(email, password)
      : await signUpWithPassword(email, password, displayName || undefined);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(mode === 'signup' ? (isAnonymous ? 'Account saved — your progress is preserved.' : 'Welcome!') : 'Signed in');
      onOpenChange(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) toast.error(res.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Cinzel']">
            {mode === 'signup' ? (isAnonymous ? 'Save your progress' : 'Create your account') : 'Welcome back'}
          </DialogTitle>
          <DialogDescription>
            {isAnonymous
              ? 'Keep your games and invite friends. Your current guest history is preserved automatically.'
              : 'Sign in to save your games and invite friends.'}
          </DialogDescription>
        </DialogHeader>

        <Button type="button" variant="outline" onClick={google} disabled={busy} className="w-full">
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="dn">Display name (optional)</Label>
              <Input id="dn" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your in-game name" />
            </div>
          )}
          <div>
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            {mode === 'signin' ? 'Sign in' : (isAnonymous ? 'Save progress with email' : 'Create account')}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          {mode === 'signin' ? (
            <>No account? <button className="text-primary underline" onClick={() => setMode('signup')}>Create one</button></>
          ) : (
            <>Already have one? <button className="text-primary underline" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
