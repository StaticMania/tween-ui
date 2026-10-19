import { cn } from '@/lib/utils';

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);
const COUNTER_DIGITS = [
  { digit: 1, roll: '[--roll-end:-40px]' },
  { digit: 2, roll: '[--roll-end:-80px]' },
  null,
  { digit: 4, roll: '[--roll-end:-160px]' },
  { digit: 8, roll: '[--roll-end:-320px]' },
  { digit: 0, roll: '[--roll-end:0px]' },
] as const;

export const NumberCounterPreview = () => {
  return (
    <div className="text-highlighted flex items-center text-[34px] font-medium tracking-[-0.02em] tabular-nums">
      {COUNTER_DIGITS.map((column, index) =>
        column === null ? (
          <span key={`separator-${index}`}>,</span>
        ) : (
          <span key={`digit-${index}`} className="h-10 overflow-hidden">
            <span
              className={cn('animate-preview-roll block motion-reduce:animate-none', column.roll)}
            >
              {DIGITS.map((value) => (
                <span key={value} className="block h-10 leading-10">
                  {value}
                </span>
              ))}
            </span>
          </span>
        )
      )}
    </div>
  );
};
