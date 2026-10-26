import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { LogIn, LogOut, User as UserIcon, Sparkles, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language, languageFlags } from '@/i18n/translations';
import { cn } from '@/lib/utils';

const LANGUAGES: Language[] = ['en', 'swe', 'ga', 'gd', 'cy', 'ang'];

export function ProfileChip() {
  const { profile, isAnonymous, signOut, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { tr } = useUiTranslation();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) return <span aria-hidden="true" className="block h-[52px] w-[56px] shrink-0" />;
  const initials = (profile?.display_name || 'P').slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="carved-button rounded-lg flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[56px] tap-target"
            aria-label="Profile menu"
          >
            <span className="w-7 h-7 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-['Cinzel'] font-semibold text-[10px]">
              {initials}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-['Cinzel'] leading-none">
              {isAnonymous ? 'Guest' : 'Profile'}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-['Cinzel']">
            <span data-no-translate>{profile?.display_name || tr('Guest')}</span>
            {isAnonymous && (
              <div className="text-[10px] text-muted-foreground font-normal">Playing as guest</div>
            )}
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

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-['Cinzel'] text-[10px] uppercase tracking-wider text-muted-foreground">
            Language
          </DropdownMenuLabel>
          <div className="px-1 pb-1 grid grid-cols-1 gap-0.5">
            {LANGUAGES.map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-md text-left text-sm transition-colors hover:bg-secondary/60',
                    active && 'bg-secondary'
                  )}
                >
                  <span className="text-lg leading-none">{languageFlags[lang].flag}</span>
                  <span data-no-translate className="flex-1 font-medium">{languageFlags[lang].name}</span>
                  {active && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
