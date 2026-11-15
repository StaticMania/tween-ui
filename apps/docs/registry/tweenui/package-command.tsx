'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

export const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export type PackageCommandKind = 'install' | 'execute';

const STORAGE_KEY = 'tweenui:package-manager';
const COPIED_FOR = 1600;

const listeners = new Set<() => void>();
let chosen: PackageManager | null = null;
let chosenByUser = false;

const toManager = (value: unknown) => PACKAGE_MANAGERS.find((manager) => manager === value);

const readManager = (): PackageManager => {
  if (chosen) return chosen;
  try {
    chosen = toManager(window.localStorage.getItem(STORAGE_KEY)) ?? 'npm';
  } catch {
    chosen = 'npm';
  }
  return chosen;
};

const chooseManager = (manager: PackageManager) => {
  if (manager === chosen) return;
  chosen = manager;
  chosenByUser = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, manager);
  } catch {}
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const next = toManager(event.newValue);
    if (!next || next === chosen) return;
    chosen = next;
    chosenByUser = true;
    listeners.forEach((each) => each());
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const runner = (manager: PackageManager, kind: PackageCommandKind, dev: boolean) => {
  if (kind === 'execute') {
    if (manager === 'npm') return 'npx';
    if (manager === 'bun') return 'bunx';
    return `${manager} dlx`;
  }
  const verb = manager === 'npm' ? 'npm install' : `${manager} add`;
  return dev ? `${verb} -D` : verb;
};

const splitHead = (head: string) => {
  const space = head.indexOf(' ');
  return space === -1 ? [head, ''] : [head.slice(0, space), head.slice(space)];
};

const FlipCells = ({ from, to }: { from: string; to: string }) => (
  <span className="relative inline-flex items-center [clip-path:inset(0_-100vw)]">
    {Array.from(to, (character, index) => (
      <span
        key={index}
        data-in
        data-changed={character !== from[index] || undefined}
        className="block w-[1ch]"
      >
        {character}
      </span>
    ))}
    {Array.from(from, (character, index) =>
      character === to[index] || character === ' ' ? null : (
        <span
          key={`out-${index}`}
          data-out
          style={{ left: `${index}ch` }}
          className="absolute inset-y-0 block w-[1ch]"
        >
          {character}
        </span>
      )
    )}
  </span>
);

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
    <rect x="8" y="3" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M16 5h1.5A1.5 1.5 0 0 1 19 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-12A1.5 1.5 0 0 1 6.5 5H8"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export interface PackageCommandProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onCopy'> {
  packages: string | string[];
  kind?: PackageCommandKind;
  dev?: boolean;
  managers?: readonly PackageManager[];
  onCopy?: (command: string) => void;
}

const PackageCommand = ({
  packages,
  kind = 'install',
  dev = false,
  managers = PACKAGE_MANAGERS,
  onCopy,
  className,
  ...props
}: PackageCommandProps) => {
  const id = useId();
  const panelId = `${id}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const clipboardRef = useRef<HTMLSpanElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);
  const checkPathRef = useRef<SVGPathElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  const flipTimeline = useRef<gsap.core.Timeline | null>(null);

  const stored = useSyncExternalStore(subscribe, readManager, () => 'npm');
  const manager = managers.find((each) => each === stored) ?? managers[0] ?? 'npm';
  const activeIndex = Math.max(0, managers.indexOf(manager));
  const list = Array.isArray(packages) ? packages.join(' ') : packages.trim();
  const head = runner(manager, kind, dev);
  const command = `${head} ${list}`;

  const [flip, setFlip] = useState({ from: head, to: head });
  const [copied, setCopied] = useState(false);

  if (flip.to !== head) setFlip({ from: flip.to, to: head });

  const [fromTool, fromTail] = splitHead(flip.from);
  const [toTool, toTail] = splitHead(flip.to);

  const { contextSafe } = useGSAP({ scope: rootRef });

  const highlight = (index: number) => {
    tabRefs.current.forEach((tab, each) => {
      if (tab) tab.dataset.highlighted = String(each === index);
    });
  };

  const movePill = (index: number, animate: boolean) => {
    const tab = tabRefs.current[index];
    if (!tab) return;
    highlight(index);
    const bounds = { x: tab.offsetLeft, width: tab.offsetWidth };
    if (!animate || prefersReducedMotion()) {
      gsap.killTweensOf(pillRef.current);
      gsap.set(pillRef.current, bounds);
      return;
    }
    gsap.to(pillRef.current, { ...bounds, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
  };

  const followPointer = contextSafe((target: EventTarget) => {
    if (!(target instanceof Element)) return;
    const tab = target.closest('[role="tab"]');
    const index = tabRefs.current.findIndex((each) => each === tab);
    if (index !== -1) movePill(index, true);
  });

  const returnToActive = contextSafe(() => movePill(activeIndex, true));

  useGSAP(
    () => {
      movePill(activeIndex, chosenByUser);
    },
    { scope: rootRef, dependencies: [activeIndex, managers.length] }
  );

  useEffect(() => {
    const tablist = tabRefs.current[0]?.parentElement;
    if (!tablist || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => movePill(activeIndex, false));
    observer.observe(tablist);
    return () => observer.disconnect();
  }, [activeIndex, managers]);

  useGSAP(
    () => {
      if (flip.from === flip.to) {
        gsap.set(
          [tailRef.current, listRef.current, ...gsap.utils.toArray('[data-in]', rootRef.current)],
          {
            clearProps: 'transform,opacity',
          }
        );
        return;
      }
      flipTimeline.current?.kill();
      const root = rootRef.current;
      const listElement = listRef.current;
      const incoming = gsap.utils.toArray<HTMLElement>('[data-in]', root);
      gsap.set(incoming, { yPercent: 0, opacity: 1 });
      const settle = () => setFlip((current) => ({ from: current.to, to: current.to }));
      if (!chosenByUser || prefersReducedMotion()) {
        gsap.set([tailRef.current, listElement], { x: 0 });
        settle();
        return;
      }
      const charWidth = incoming[0]?.getBoundingClientRect().width ?? 0;
      const timeline = gsap.timeline({ onComplete: settle });
      flipTimeline.current = timeline;
      const slide = (element: HTMLElement | null, shift: number) => {
        const currentX = Number(gsap.getProperty(element, 'x')) || 0;
        timeline.fromTo(
          element,
          { x: shift * charWidth + currentX },
          { x: 0, duration: 0.55, ease: 'power3.inOut' },
          0
        );
      };
      slide(tailRef.current, fromTool.length - toTool.length);
      slide(listElement, flip.from.length - flip.to.length);
      timeline.fromTo(
        gsap.utils.toArray<HTMLElement>('[data-out]', root),
        { yPercent: 0, opacity: 1 },
        { yPercent: -70, opacity: 0, duration: 0.2, ease: 'power2.in' },
        0
      );
      incoming
        .filter((element) => element.hasAttribute('data-changed'))
        .forEach((element, order) => {
          timeline.fromTo(
            element,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.42, ease: 'power3.out' },
            order * 0.03 + 0.1
          );
        });
    },
    { scope: rootRef, dependencies: [flip.from, flip.to] }
  );

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const select = (index: number, focus = false) => {
    const next = managers[(index + managers.length) % managers.length];
    if (!next) return;
    chooseManager(next);
    if (focus) tabRefs.current[managers.indexOf(next)]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: managers.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target, true);
  };

  const playCopied = contextSafe(() => {
    if (prefersReducedMotion()) {
      gsap.set(clipboardRef.current, { opacity: 0 });
      gsap.set(checkRef.current, { opacity: 1 });
      gsap.set(checkPathRef.current, { strokeDashoffset: 0 });
      return;
    }
    gsap
      .timeline({ defaults: { overwrite: 'auto' } })
      .to(clipboardRef.current, { scale: 0.6, opacity: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .set(checkRef.current, { opacity: 1 }, 0.12)
      .fromTo(
        checkPathRef.current,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.4, ease: 'power3.out' },
        0.12
      )
      .fromTo(
        sweepRef.current,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, duration: 0.5, ease: 'power3.out' },
        0
      )
      .to(sweepRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.7);
  });

  const playReset = contextSafe(() => {
    const reduced = prefersReducedMotion();
    gsap.to(checkRef.current, { opacity: 0, duration: reduced ? 0 : 0.2, ease: 'power2.out' });
    gsap.fromTo(
      clipboardRef.current,
      { scale: reduced ? 1 : 0.6 },
      {
        scale: 1,
        opacity: 1,
        duration: reduced ? 0 : 0.35,
        ease: 'power3.out',
        delay: reduced ? 0 : 0.1,
      }
    );
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      return;
    }
    onCopy?.(command);
    setCopied(true);
    playCopied();
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => {
      setCopied(false);
      playReset();
    }, COPIED_FOR);
  };

  return (
    <div
      ref={rootRef}
      data-package-command
      className={cn(
        'w-full max-w-lg overflow-hidden rounded-xl border border-current/10 bg-current/[0.03] [--package-accent:#045f64] dark:[--package-accent:#c6f56f]',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 border-b border-current/10 px-1.5 py-1.5">
        <div
          role="tablist"
          aria-label="Package manager"
          className="relative flex"
          onPointerOver={(event) => followPointer(event.target)}
          onPointerLeave={returnToActive}
          onFocus={(event) => followPointer(event.target)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) returnToActive();
          }}
        >
          <span
            ref={pillRef}
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-md bg-current/[0.08]"
          />
          {managers.map((each, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={each}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`${id}-${each}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={handleKeyDown}
                data-highlighted={selected}
                className="relative cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs opacity-55 transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-current data-[highlighted=true]:opacity-100 motion-reduce:transition-none"
              >
                {each}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy command'}
          className="relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-md opacity-70 transition-[opacity,background-color] duration-200 hover:bg-current/[0.08] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
        >
          <span ref={clipboardRef} className="flex">
            <ClipboardIcon />
          </span>
          <svg
            ref={checkRef}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute size-4 text-(--package-accent) opacity-0"
          >
            <path
              ref={checkPathRef}
              d="M5 12.5l4.5 4.5L19 7.5"
              pathLength={1}
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>
        </button>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${id}-${manager}`}
        className="overflow-x-auto px-4 py-3.5"
      >
        <p className="relative inline-flex items-center font-mono text-sm leading-6 whitespace-pre">
          <span
            ref={sweepRef}
            aria-hidden="true"
            className="absolute -inset-x-1 -inset-y-0.5 origin-left scale-x-0 rounded bg-(--package-accent)/15"
          />
          <span aria-hidden="true" className="relative text-(--package-accent) select-none">
            ${' '}
          </span>
          <span aria-hidden="true" className="relative inline-flex items-center">
            <FlipCells from={fromTool} to={toTool} />
            <span ref={tailRef} className="inline-flex items-center">
              <FlipCells from={fromTail} to={toTail} />
            </span>
            <span ref={listRef} className="block opacity-70">
              {' '}
              {list}
            </span>
          </span>
          <span className="sr-only">{command}</span>
        </p>
      </div>

      <span role="status" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  );
};

export default PackageCommand;
