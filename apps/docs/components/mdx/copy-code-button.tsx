import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CopyCodeButtonProps = Readonly<{
  isCopied: boolean;
  onCopy: () => void;
  className?: string;
}>;

export const CopyCodeButton = ({ isCopied, onCopy, className }: CopyCodeButtonProps) => (
  <button
    type="button"
    onClick={onCopy}
    title="Copy code"
    className={cn(
      'inline-flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white',
      className
    )}
  >
    {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
  </button>
);
