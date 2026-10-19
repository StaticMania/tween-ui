import { cn } from '@/lib/utils';

export const ImageFanPreview = () => {
  return (
    <div className="relative h-[90px] w-[150px]">
      {[
        'bg-tween-teal-deep',
        'bg-tween-teal [animation-delay:-1.8s]',
        'bg-tween-teal-soft [animation-delay:-3.6s]',
      ].map((tone) => (
        <span
          key={tone}
          className={cn(
            'animate-preview-fan absolute top-1/2 left-1/2 -mt-[35px] -ml-[26px] h-[70px] w-[52px] rounded-md motion-reduce:animate-none',
            tone
          )}
        />
      ))}
    </div>
  );
};
