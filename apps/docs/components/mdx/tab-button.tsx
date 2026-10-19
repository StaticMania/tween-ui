import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const TabButton = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm transition-colors',
        active
          ? 'border-primary text-primary'
          : 'text-muted-foreground hover:text-highlighted border-transparent'
      )}
    >
      {icon}
      {children}
    </button>
  );
};
