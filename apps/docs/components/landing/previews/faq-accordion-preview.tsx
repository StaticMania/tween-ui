import { cn } from '@/lib/utils';

const FAQ_ROWS = [
  { width: 'w-[70px]', isOpen: false },
  { width: 'w-[84px]', isOpen: true },
  { width: 'w-[60px]', isOpen: false },
] as const;

export const FaqAccordionPreview = () => {
  return (
    <div className="flex w-[170px] flex-col gap-2">
      {FAQ_ROWS.map(({ width, isOpen }) => {
        return (
          <div key={width} className="border-border bg-background rounded-lg border px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className={cn('bg-highlighted/50 h-1.5 rounded-[3px]', width)} />
              <span className="relative size-3">
                <span className="bg-tween-accent absolute top-[5px] right-0 left-0 h-0.5 rounded-[1px]" />
                <span
                  className={cn(
                    'bg-tween-accent absolute top-0 bottom-0 left-[5px] w-0.5 rounded-[1px]',
                    isOpen && 'animate-preview-morph motion-reduce:animate-none'
                  )}
                />
              </span>
            </div>
            {isOpen && (
              <div className="animate-preview-open grid motion-reduce:animate-none">
                <div className="overflow-hidden">
                  <span className="bg-highlighted/18 mt-2 block h-[5px] w-[90%] rounded-[3px]" />
                  <span className="bg-highlighted/18 mt-2 block h-[5px] w-[70%] rounded-[3px]" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
