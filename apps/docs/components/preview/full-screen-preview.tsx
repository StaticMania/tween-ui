'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Expand, ExternalLink, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Opens a block at full viewport width without leaving the doc page.
 *
 * The block renders inside an iframe pointed at `/preview/<name>` rather than
 * straight into the dialog: many blocks drive animation from ScrollTrigger or
 * CSS `sticky`, both of which read the window's scroll. In a scrollable dialog
 * that scroll never happens. Its own document gives each block the window it
 * expects, so it behaves exactly as it will in a consumer's page.
 */
export function FullScreenPreview({ name, title }: { name: string; title: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Once the visitor clicks into the block, focus lives in the iframe's own
  // document and its key events never reach this one. The preview is served
  // from the same origin, so listen inside the frame too. Re-attached on every
  // load because a reload swaps in a fresh window.
  const onFrameLoad = useCallback(() => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow) return;

    frameWindow.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    });
  }, [close]);

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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        title="Open full screen"
        className="text-muted-foreground hover:text-highlighted hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
      >
        <Expand className="size-3.5" />
        Full screen
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${title}, full screen`}
            className="bg-background fixed inset-0 z-[60] flex flex-col"
          >
            <div className="border-border flex h-12 shrink-0 items-center justify-between border-b px-3">
              <span className="text-highlighted truncate text-sm font-medium">{title}</span>
              <div className="flex items-center gap-1">
                <a
                  href={`/preview/${name}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in a new tab"
                  className="text-muted-foreground hover:text-highlighted hover:bg-muted inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  New tab
                </a>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close full screen"
                  className="text-muted-foreground hover:text-highlighted hover:bg-muted inline-flex size-8 items-center justify-center rounded-md transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <iframe
              ref={frameRef}
              src={`/preview/${name}`}
              title={`${title} preview`}
              onLoad={onFrameLoad}
              className="min-h-0 w-full flex-1 border-0"
            />
          </div>,
          document.body
        )}
    </>
  );
}
