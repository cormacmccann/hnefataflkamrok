import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ProfileChip() {
  const { profile, isAnonymous, signOut, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) return null;
  const initials = (profile?.display_name || 'P').slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="carved-button rounded-full pl-1 pr-3 py-1 flex items-center gap-2 text-xs">
            <span className="w-7 h-7 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-['Cinzel'] font-semibold text-[10px]">
              {initials}
            </span>
            <span className="hidden sm:inline font-['Cinzel'] max-w-[120px] truncate">
              {profile?.display_name || 'Guest'}
            </span>
            {isAnonymous && <span className="text-[9px] bg-amber-700/80 text-amber-50 px-1.5 py-0.5 rounded">guest</span>}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-['Cinzel']">
            {profile?.display_name || 'Guest'}
            {isAnonymous && <div className="text-[10px] text-muted-foreground font-normal">Playing as guest</div>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAnonymous ? (
            <DropdownMenuItem onClick={() => setAuthOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" /> Save progress & invite friends
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem disabled>
                <UserIcon className="w-4 h-4 mr-2" /> Signed in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </>
          )}
          {isAnonymous && (
            <DropdownMenuItem onClick={() => setAuthOpen(true)}>
              <LogIn className="w-4 h-4 mr-2" /> Sign in
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
