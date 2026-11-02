'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { cn } from '@/lib/utils';

gsap.registerPlugin(CustomEase);

const TEAL = '#045f64';
const LIME = '#c6f56f';
const INK = '#071d1b';
const CHIP_HEIGHT = 36;
const CHIP_INSET = 12;
const FLIGHT = 0.62;
const LIFT = 12;
const BAR_HEIGHT = 56;
const PANEL_GAP = 12;
const SEED = { width: 120, height: 40, bottom: 8, borderRadius: 20 };
const SEED_STYLE = { ...SEED };

type Kind = 'typed' | 'recent' | 'suggestion';

interface Option {
  key: string;
  term: string;
  kind: Kind;
}

interface Flight {
  term: string;
  to: 'bar' | 'list';
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: string;
}

export interface MorphingSearchProps {
  suggestions?: readonly string[];
  chips?: string[];
  defaultChips?: string[];
  onChipsChange?: (chips: string[]) => void;
  defaultRecents?: string[];
  onRecentsChange?: (recents: string[]) => void;
  maxRecents?: number;
  maxSuggestions?: number;
  maxChips?: number;
  placeholder?: string;
  label?: string;
  name?: string;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sameTerm = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const createEases = () => {
  CustomEase.create('search-glide', '0.32, 0.72, 0, 1');
};

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
    <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth={1.6} />
    <path d="m13.25 13.25 3.5 3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0">
    <circle cx="10" cy="10" r="6.75" stroke="currentColor" strokeWidth={1.5} />
    <path
      d="M10 6.5V10l2.25 1.5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0">
    <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-3.5">
    <path d="m6 6 8 8M14 6l-8 8" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const Match = ({ term, query }: { term: string; query: string }) => {
  const at = query ? term.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return term;
  return (
    <>
      {term.slice(0, at)}
      <strong className="font-semibold text-[#045f64]">{term.slice(at, at + query.length)}</strong>
      {term.slice(at + query.length)}
    </>
  );
};

const MorphingSearch = ({
  suggestions = [],
  chips: chipsProp,
  defaultChips = [],
  onChipsChange,
  defaultRecents = [],
  onRecentsChange,
  maxRecents = 5,
  maxSuggestions = 5,
  maxChips,
  placeholder = 'Search',
  label = 'Search',
  name,
  className,
}: MorphingSearchProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const revealed = useRef<boolean | null>(null);
  const markerShown = useRef(false);
  const latestChips = useRef<string[]>(defaultChips);
  const id = useId();
  const gooId = `search-goo-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [ownChips, setOwnChips] = useState(defaultChips);
  const [recents, setRecents] = useState(defaultRecents);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [marked, setMarked] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [landing, setLanding] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [note, setNote] = useState({ text: '', count: 0 });

  const chips = chipsProp ?? ownChips;
  const typed = query.trim();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const optionId = (index: number) => `${id}-option-${index}`;

  useLayoutEffect(() => {
    latestChips.current = chips;
  });

  const options = useMemo<Option[]>(() => {
    const held = chips.filter((chip) => chip !== leaving);
    if (!typed) {
      return recents
        .filter((term) => !held.some((chip) => sameTerm(chip, term)))
        .map((term) => ({ key: `recent-${term}`, term, kind: 'recent' }));
    }
    const needle = typed.toLowerCase();
    const taken = new Set([needle, ...held.map((chip) => chip.toLowerCase())]);
    const found: Option[] = [];
    const consider = (term: string, kind: Kind) => {
      const key = term.toLowerCase();
      if (taken.has(key) || !key.includes(needle)) return;
      taken.add(key);
      found.push({ key: `${kind}-${term}`, term, kind });
    };
    recents.forEach((term) => consider(term, 'recent'));
    suggestions.forEach((term) => consider(term, 'suggestion'));
    return [
      { key: `typed-${typed}`, term: typed, kind: 'typed' },
      ...found.slice(0, maxSuggestions),
    ];
  }, [typed, recents, suggestions, chips, leaving, maxSuggestions]);

  const current = Math.min(active, Math.max(options.length - 1, 0));
  const showPanel = open && options.length > 0;
  const activeId = showPanel ? optionId(current) : undefined;

  const announce = (text: string) => setNote((last) => ({ text, count: last.count + 1 }));

  const commitChips = (next: string[]) => {
    if (chipsProp === undefined) setOwnChips(next);
    onChipsChange?.(next);
  };

  const commitRecents = (next: string[]) => {
    setRecents(next);
    onRecentsChange?.(next);
  };

  const chipElement = (term: string) =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-chip]') ?? []).find(
      (element) => element.dataset.chip === term
    );

  const rowLabel = (term: string) =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-value]') ?? [])
      .find((element) => element.dataset.value === term)
      ?.querySelector<HTMLElement>('[data-term]');

  const add = (term: string, source: HTMLElement | null) => {
    const value = term.trim();
    if (!value) return;
    const exists = chips.some((chip) => sameTerm(chip, value));
    if (!exists && maxChips !== undefined && chips.length >= maxChips) {
      announce(`You can add up to ${maxChips} filters`);
      return;
    }
    if (!exists) {
      if (source && !prefersReducedMotion()) {
        const box = source.getBoundingClientRect();
        setFlight({
          term: value,
          to: 'bar',
          left: box.left - CHIP_INSET,
          top: box.top + (box.height - CHIP_HEIGHT) / 2,
          width: 0,
          height: CHIP_HEIGHT,
          fontSize: getComputedStyle(source).fontSize,
        });
        setLanding(value);
      }
      commitChips([...chips, value]);
      announce(`Added filter ${value}`);
    }
    commitRecents(
      [value, ...recents.filter((recent) => !sameTerm(recent, value))].slice(0, maxRecents)
    );
    setQuery('');
    setActive(0);
  };

  const remove = (term: string) => {
    const finish = () => {
      commitChips(latestChips.current.filter((chip) => chip !== term));
      setLeaving((current) => (current === term ? null : current));
      announce(`Removed filter ${term}`);
    };
    commitRecents(
      [term, ...recents.filter((recent) => !sameTerm(recent, term))].slice(0, maxRecents)
    );
    const element = chipElement(term);
    if (!element || prefersReducedMotion()) finish();
    else {
      const box = element.getBoundingClientRect();
      setLeaving(term);
      setLanding(term);
      setFlight({
        term,
        to: 'list',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        fontSize: getComputedStyle(element).fontSize,
      });
      gsap.to(element, {
        width: 0,
        paddingLeft: 0,
        paddingRight: 0,
        marginRight: -6,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: finish,
      });
    }
    setMarked(null);
    inputRef.current?.focus();
  };

  const forgetRecent = (term: string) => {
    commitRecents(recents.filter((recent) => recent !== term));
    announce(`Removed ${term} from recent searches`);
  };

  const moveTo = (index: number) => {
    setActive(index);
    document.getElementById(optionId(index))?.scrollIntoView?.({ block: 'nearest' });
  };

  const sourceFor = (index: number) => {
    const option = options[index];
    if (!option || option.kind === 'typed') return inputRef.current;
    return (
      document.getElementById(optionId(index))?.querySelector<HTMLElement>('[data-term]') ?? null
    );
  };

  const stepMark = (direction: -1 | 1) => {
    const at = marked === null ? chips.length : chips.indexOf(marked);
    const next = at + direction;
    setMarked(next >= chips.length ? null : (chips[Math.max(next, 0)] ?? null));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    const field = event.currentTarget;
    const atStart = field.selectionStart === 0 && field.selectionEnd === 0;

    if (marked !== null) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        remove(marked);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        stepMark(event.key === 'ArrowLeft' ? -1 : 1);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setMarked(null);
        return;
      }
      setMarked(null);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) setQuery('');
      else setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      else if (options.length) {
        const step = event.key === 'ArrowDown' ? 1 : options.length - 1;
        moveTo((current + step) % options.length);
      }
    } else if (event.key === 'Enter') {
      const option = options[current];
      if (!showPanel || !option) return;
      event.preventDefault();
      add(option.term, sourceFor(current));
    } else if (event.key === 'Delete' && showPanel && options[current]?.kind === 'recent') {
      event.preventDefault();
      const option = options[current];
      if (option) forgetRecent(option.term);
    } else if (
      (event.key === 'Backspace' || event.key === 'ArrowLeft') &&
      atStart &&
      chips.length
    ) {
      event.preventDefault();
      const last = chips[chips.length - 1] ?? null;
      setMarked(last);
      if (last) announce(`${last} selected. Press Backspace again to remove it.`);
    }
  };

  const onBarPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('button, input')) return;
    event.preventDefault();
    inputRef.current?.focus();
    setOpen(true);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || rootRef.current?.contains(next)) return;
    setOpen(false);
    setMarked(null);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(false);
      setMarked(null);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  useLayoutEffect(() => {
    if (!flight) return;
    const root = rootRef.current;
    const ghost = ghostRef.current;
    const toBar = flight.to === 'bar';
    const target = toBar ? chipElement(flight.term) : rowLabel(flight.term);
    if (!root || !ghost || !target) {
      setFlight(null);
      setLanding(null);
      return;
    }
    createEases();
    const row = chipRowRef.current;
    if (toBar && row) row.scrollLeft = row.scrollWidth;

    const rootBox = root.getBoundingClientRect();
    const goal = target.getBoundingClientRect();
    const fromX = flight.left - rootBox.left;
    const fromY = flight.top - rootBox.top;
    const toX = goal.left - rootBox.left - (toBar ? 0 : CHIP_INSET);
    const toY = goal.top - rootBox.top + (toBar ? 0 : (goal.height - CHIP_HEIGHT) / 2);

    gsap.set(ghost, { x: fromX, y: fromY, fontSize: flight.fontSize, opacity: 1 });
    const natural = ghost.offsetWidth;
    gsap.set(ghost, {
      width: toBar ? natural : flight.width,
      color: toBar ? INK : LIME,
      backgroundColor: toBar ? 'rgba(198, 245, 111, 0)' : TEAL,
    });

    const timeline = gsap.timeline({
      onComplete: () => {
        setLanding(null);
        setFlight(null);
      },
    });
    timeline
      .to(
        ghost,
        {
          x: toX,
          width: toBar ? goal.width : natural,
          fontSize: 14,
          duration: FLIGHT,
          ease: 'search-glide',
        },
        0
      )
      .to(ghost, { y: Math.min(fromY, toY) - LIFT, duration: FLIGHT * 0.4, ease: 'power2.out' }, 0)
      .to(ghost, { y: toY, duration: FLIGHT * 0.6, ease: 'power2.inOut' }, FLIGHT * 0.4)
      .to(
        ghost,
        { backgroundColor: LIME, color: INK, duration: FLIGHT * 0.35, ease: 'power1.out' },
        0
      )
      .to(
        ghost,
        toBar
          ? { backgroundColor: TEAL, color: LIME, duration: FLIGHT * 0.5, ease: 'power1.inOut' }
          : {
              backgroundColor: 'rgba(198, 245, 111, 0)',
              duration: FLIGHT * 0.5,
              ease: 'power1.inOut',
            },
        FLIGHT * 0.45
      );
    return () => {
      timeline.kill();
    };
  }, [flight]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const blob = blobRef.current;
    if (!panel || !blob) return;
    createEases();
    const first = revealed.current === null;
    const changed = revealed.current !== showPanel;
    revealed.current = showPanel;

    const settled = () => ({
      width: panel.offsetWidth,
      height: panel.offsetHeight,
      bottom: BAR_HEIGHT + PANEL_GAP,
      borderRadius: 28,
    });

    if (!changed && gsap.isTweening(blob)) return;
    if (!changed || first || prefersReducedMotion()) {
      gsap.killTweensOf([blob, panel]);
      gsap.set(blob, showPanel ? settled() : { ...SEED });
      gsap.set(panel, { opacity: showPanel ? 1 : 0, y: 0 });
      return;
    }

    if (showPanel) {
      gsap.to(blob, {
        ...settled(),
        duration: 0.64,
        ease: 'search-glide',
        overwrite: true,
        onComplete: () => {
          gsap.to(blob, { ...settled(), duration: 0.2, ease: 'power2.out' });
        },
      });
      gsap.fromTo(
        panel,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, delay: 0.24, ease: 'power2.out', overwrite: true }
      );
    } else {
      gsap.to(panel, { opacity: 0, duration: 0.12, ease: 'power1.out', overwrite: true });
      gsap.to(blob, { ...SEED, duration: 0.44, ease: 'power3.inOut', overwrite: true });
    }
  }, [showPanel]);

  useEffect(() => {
    const panel = panelRef.current;
    const blob = blobRef.current;
    if (!showPanel || !panel || !blob) return;
    const observer = new ResizeObserver(() => {
      if (gsap.isTweening(blob)) return;
      gsap.to(blob, {
        width: panel.offsetWidth,
        height: panel.offsetHeight,
        bottom: BAR_HEIGHT + PANEL_GAP,
        borderRadius: 28,
        duration: prefersReducedMotion() ? 0 : 0.3,
        ease: 'search-glide',
        overwrite: true,
      });
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [showPanel]);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const row = activeId ? document.getElementById(activeId) : null;
    if (!row) {
      gsap.killTweensOf(marker);
      gsap.set(marker, { opacity: 0 });
      markerShown.current = false;
      return;
    }
    gsap.set(marker, { height: row.offsetHeight, opacity: 1 });
    if (markerShown.current && !prefersReducedMotion()) {
      gsap.to(marker, { y: row.offsetTop, duration: 0.3, ease: 'power3.out', overwrite: true });
    } else {
      gsap.killTweensOf(marker);
      gsap.set(marker, { y: row.offsetTop });
    }
    markerShown.current = true;
  }, [activeId, options]);

  return (
    <div ref={rootRef} onBlur={onBlur} className={cn('relative w-full max-w-xl', className)}>
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <filter
            id={gooId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden="true"
        data-goo
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[460px]"
        style={{
          filter: `url(#${gooId}) drop-shadow(0 6px 12px rgba(4, 95, 100, 0.08))`,
        }}
      >
        <span className="absolute inset-x-0 bottom-0 h-14 rounded-full bg-white" />
        <span ref={blobRef} style={SEED_STYLE} className="absolute inset-x-0 mx-auto bg-white" />
      </div>
      <div
        ref={panelRef}
        inert={!showPanel}
        aria-hidden={!showPanel}
        className="absolute inset-x-0 bottom-full z-10 mb-3 p-2 opacity-0"
      >
        <div className="flex h-9 items-center justify-between px-3">
          <span className="text-[11px] font-medium tracking-[0.08em] text-[#045f64]/60 uppercase">
            {typed ? 'Suggestions' : 'Recent'}
          </span>
          {!typed && options.length > 0 && (
            <button
              type="button"
              onClick={() => {
                commitRecents([]);
                announce('Cleared recent searches');
                inputRef.current?.focus();
              }}
              className="cursor-pointer rounded-md border-0 bg-transparent px-1.5 py-0.5 text-xs text-[#045f64]/60 transition-colors outline-none hover:text-[#045f64] focus-visible:ring-2 focus-visible:ring-[#045f64] motion-reduce:transition-none"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative max-h-72 [scrollbar-width:thin] overflow-y-auto overscroll-contain">
          <span
            ref={markerRef}
            aria-hidden="true"
            // Panel radius (28) minus its padding (8), so the corners stay concentric.
            className="pointer-events-none absolute inset-x-0 top-0 rounded-[20px] bg-[#045f64]/[0.08] opacity-0"
          />
          <div id={listId} role="listbox" aria-label={typed ? 'Suggestions' : 'Recent searches'}>
            {options.map((option, index) => (
              <div
                key={option.key}
                id={optionId(index)}
                data-value={option.term}
                role="option"
                aria-selected={index === current}
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => index !== current && setActive(index)}
                onClick={() => add(option.term, sourceFor(index))}
                className="relative flex h-11 cursor-pointer items-center gap-3 rounded-[20px] px-3 text-sm text-[#071d1b]"
              >
                <span className="flex text-[#045f64]/60">
                  {option.kind === 'recent' ? (
                    <ClockIcon />
                  ) : option.kind === 'typed' ? (
                    <PlusIcon />
                  ) : (
                    <SearchIcon className="size-4 shrink-0" />
                  )}
                </span>
                <span
                  data-term
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    flight?.to === 'list' && landing === option.term && 'opacity-0'
                  )}
                >
                  {option.kind === 'typed' ? (
                    option.term
                  ) : (
                    <Match term={option.term} query={typed} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        onPointerDown={onBarPointerDown}
        className="relative z-20 flex h-14 cursor-text items-center gap-2 rounded-full border border-[#045f64]/15 bg-white/80 ps-4 pe-4 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-[#045f64]/35 focus-within:shadow-[0_0_0_4px_rgba(4,95,100,0.1)] motion-reduce:transition-none"
      >
        <span className="flex shrink-0 text-[#045f64]">
          <SearchIcon className="size-5" />
        </span>
        <div
          ref={chipRowRef}
          className="flex min-w-0 shrink [scrollbar-width:none] items-center gap-1.5 overflow-x-auto"
        >
          {chips.map((chip) => (
            <span
              key={chip}
              data-chip={chip}
              className={cn(
                'flex h-9 shrink-0 items-center gap-1 overflow-hidden rounded-full ps-3 pe-1 text-sm whitespace-nowrap text-[#c6f56f] transition-[background-color,box-shadow] duration-150 motion-reduce:transition-none',
                marked === chip ? 'bg-[#0f3f42] ring-2 ring-[#c6f56f] ring-inset' : 'bg-[#045f64]',
                flight?.to === 'bar' && landing === chip && 'opacity-0'
              )}
            >
              {chip}
              <button
                type="button"
                aria-label={`Remove filter ${chip}`}
                onClick={() => remove(chip)}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#c6f56f]/70 transition-colors outline-none hover:bg-[#c6f56f]/15 hover:text-[#c6f56f] focus-visible:ring-2 focus-visible:ring-[#c6f56f] motion-reduce:transition-none"
              >
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={label}
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-describedby={hintId}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-9 min-w-24 flex-1 border-0 bg-transparent p-0 text-base text-[#071d1b] outline-none placeholder:text-[#045f64]/50"
        />
      </div>

      {flight && (
        <span
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-30 flex h-9 w-max items-center rounded-full ps-3 pe-3 whitespace-nowrap opacity-0"
        >
          {flight.term}
        </span>
      )}

      {name && chips.map((chip) => <input key={chip} type="hidden" name={name} value={chip} />)}
      <span id={hintId} className="sr-only">
        Press Enter to add a filter. Backspace at the start of the field selects the last filter;
        press it again to remove it. Delete removes the highlighted recent search.
      </span>
      <span aria-live="polite" className="sr-only">
        <span key={note.count}>{note.text}</span>
      </span>
    </div>
  );
};

export default MorphingSearch;
