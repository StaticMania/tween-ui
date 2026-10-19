import { cn } from '@/lib/utils';

const AVATAR_TONES = [
  'bg-tween-teal',
  'bg-tween-teal-deep [animation-delay:120ms]',
  'bg-tween-teal-soft [animation-delay:240ms]',
  'bg-tween-lime [animation-delay:360ms]',
] as const;

export const AvatarRevealPreview = () => {
  return (
    <div className="flex items-center">
      {AVATAR_TONES.map((tone) => (
        <span
          key={tone}
          className={cn(
            'border-background animate-preview-pop -ml-[9px] size-[30px] rounded-full border-2 first:ml-0 motion-reduce:animate-none',
            tone
          )}
        />
      ))}
      <span className="bg-highlighted/15 animate-preview-caption ml-3 h-2.5 w-16 rounded-[5px] motion-reduce:animate-none" />
    </div>
  );
};
