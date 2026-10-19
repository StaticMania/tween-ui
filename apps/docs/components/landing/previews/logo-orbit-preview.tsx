import { cn } from '@/lib/utils';

const ORBIT_DOTS = [
  'top-0 left-1/2',
  'top-1/2 left-full',
  'top-full left-1/2',
  'top-1/2 left-0',
] as const;

export const LogoOrbitPreview = () => {
  return (
    <div className="relative size-[110px]">
      <div className="border-tween-teal/35 animate-preview-spin absolute inset-0 rounded-full border border-dashed motion-reduce:animate-none">
        {ORBIT_DOTS.map((position) => (
          <span
            key={position}
            className={cn(
              'bg-tween-teal animate-preview-spin-reverse absolute -m-2 size-4 rounded motion-reduce:animate-none',
              position
            )}
          />
        ))}
      </div>
      <span className="bg-tween-lime absolute top-1/2 left-1/2 -m-3.5 size-7 rounded-full" />
    </div>
  );
};
