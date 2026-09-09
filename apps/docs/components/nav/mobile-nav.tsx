'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { useDocsConfig, type NavItem } from 'docora';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SidebarNav } from './sidebar-nav';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mobile drawer holding the same nav as the desktop sidebar. Docora's own
 * MobileNav is hardcoded inside its SiteHeader and renders docora's SidebarNav,
 * so this replaces it via the header's `logo` slot (see `DocsShell`). Written
 * against GSAP rather than Radix because `radix-ui` is docora's dependency, not
 * ours, and it doesn't resolve from this package.
 *
 * The overlay and panel are portalled to `document.body`: living in the logo
 * slot puts them inside the header, which is `sticky z-40` with a backdrop
 * filter and therefore its own stacking context — a `z-50` child of it still
 * paints below the page content. (Radix's Dialog.Portal does the same.)
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const config = useDocsConfig();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on navigation, matching docora's behaviour.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    if (open) setOpen(false);
  }

  useGSAP(
    () => {
      if (!open) return;
      const panel = panelRef.current;
      const overlay = overlayRef.current;
      if (!panel || !overlay) return;

      if (prefersReducedMotion()) {
        gsap.set([overlay, panel], { autoAlpha: 1, x: 0 });
        return;
      }
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      gsap.fromTo(panel, { xPercent: -100 }, { xPercent: 0, duration: 0.32, ease: 'power3.out' });
    },
    { dependencies: [open] }
  );

  // Lock the page behind the drawer, and move focus into it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open, close]);

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-elevated hover:text-highlighted focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {open &&
        createPortal(
          <>
            <div
              ref={overlayRef}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Documentation"
              className="border-border bg-background fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-lg focus:outline-none"
            >
              <div className="border-border flex h-16 items-center justify-between border-b px-4">
                <span className="truncate text-sm font-semibold tracking-tight">
                  {config.header?.title ?? config.site.name}
                </span>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={close}
                  className="text-muted-foreground hover:bg-elevated hover:text-highlighted inline-flex size-8 items-center justify-center rounded-full transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="no-scrollbar flex-1 overflow-y-auto p-4">
                <SidebarNav items={items} onNavigate={close} />
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
