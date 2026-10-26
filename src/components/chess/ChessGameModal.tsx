import * as Dialog from '@radix-ui/react-dialog';
import { ChessGame } from './ChessGame';
import { useUiTranslation } from '@/i18n/useUiTranslation';

export function ChessGameModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tr } = useUiTranslation();
  return <Dialog.Root open={open} onOpenChange={next => { if (!next) onClose(); }}>
    {open && <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[79] bg-black" />
      <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-[80] outline-none">
        <Dialog.Title className="sr-only">{tr('Chess')}</Dialog.Title>
        <ChessGame onClose={onClose} />
      </Dialog.Content>
    </Dialog.Portal>}
  </Dialog.Root>;
}
