import type { TweenNavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from './animated-icon';
import { NavRow, ROW, type OnRowEnter } from './nav-row';

export const NavTree = ({
  items,
  level,
  pathname,
  onEnter,
  onNavigate,
}: Readonly<{
  items: TweenNavItem[];
  level: number;
  pathname: string;
  onEnter: OnRowEnter;
  onNavigate?: () => void;
}>) => {
  const nested = level > 0;

  return (
    <ul className={cn('isolate', nested ? 'border-border ms-5 border-s' : '-mx-2.5 -mt-1.5')}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children && item.children.length > 0);

        return (
          <li
            key={item.label + (item.href ?? '')}
            className={cn(nested && '-ms-px ps-1.5', hasChildren && 'mb-1.5 flex flex-col')}
          >
            {item.href ? (
              <NavRow
                item={item as TweenNavItem & { href: string }}
                isActive={item.href === pathname}
                onEnter={onEnter}
                onNavigate={onNavigate}
              />
            ) : (
              <span className={cn(ROW, 'text-highlighted font-semibold')}>
                {item.icon && (
                  <AnimatedIcon name={item.icon} hovered={false} className="text-highlighted" />
                )}
                <span className="truncate">{item.label}</span>
              </span>
            )}

            {hasChildren && (
              <NavTree
                items={item.children!}
                level={level + 1}
                pathname={pathname}
                onEnter={onEnter}
                onNavigate={onNavigate}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
