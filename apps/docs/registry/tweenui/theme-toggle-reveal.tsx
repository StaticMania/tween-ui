'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

export type Theme = 'light' | 'dark';

const DURATION = 900;
const PIXEL = 12;
const FRINGE = 1.5;
const CLIP_RULE = 'html[data-theme-reveal]::view-transition-new(root)';
const MORPH = 0.55;
const LABELS: Record<Theme, string> = { light: 'Light mode', dark: 'Dark mode' };

// The default view transition cross-fades the old and new snapshots, so while
// the circle grows the old page is already fading out underneath it and the
// pixels look washed out. Both snapshots are held fully opaque, with no blending,
// and only the clip-path on the new one moves. The rule is scoped to an
// attribute that exists for the length of this transition only, so other view
// transitions on the page keep their own animations.
//
// While the snapshots are on screen the pointer is over the transition layer,
// not the button, so the button's own not-allowed cursor never shows. The
// cursor is set on the layer and the root as well, so it reads as disabled for
// exactly as long as a click can't switch the theme.
const REVEAL_CSS = `
html[data-theme-reveal]::view-transition-old(root),
html[data-theme-reveal]::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-theme-reveal],
html[data-theme-reveal]::view-transition {
  cursor: not-allowed;
}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export type Reveal =
  'circle' | 'diamond' | 'equalizer' | 'sweep' | 'zipper' | 'sparks' | 'sonar' | 'spiral';

const SPARK_SHARE = 0.14;
const SONAR_RINGS = [0.07, 0.15];
const SPIRAL_TURNS = 2.5;
const BAR = 3;
const BAR_STAGGER = 0.35;
const TOOTH = 0.08;

// Every reveal is the same grid of pixels; only the moment each cell lights
// differs. That moment, the cell's reach, runs 0 to 1 and is worked out once
// per click. Frames then light every cell whose reach the progress has passed,
// one rectangle per run of lit cells in a row so a full-screen frame stays
// small, and grow the cells just ahead of it from a dot to a full tile, a
// cell and a half deep, which softens the pop of each new step of pixels.
//
// circle     the distance from the icon, so the edge is a staircase circle.
// diamond    the same, counted in rows plus columns, for a stepped 45° edge.
// equalizer  bars three pixels wide rise from the bottom like a level meter,
//            the bars nearest the toggle first, so the wave spreads sideways.
// sweep      the distance along the line from the toggle to the farthest
//            corner, so a stepped diagonal crosses the screen.
// zipper     rows close in from the top and bottom towards the toggle's row,
//            with alternate columns a step ahead, so the two edges interlock
//            like the teeth of a zip.
// sparks     the circle, except one cell in seven reaches far ahead early, so
//            loose pixels fly out and the circle fills in behind them.
// sonar      the circle, with two thin rings of pixels racing ahead of it
//            that come and go like pings.
// spiral     mostly distance, plus the angle around the icon wound into an
//            arm, so the new theme sweeps round as it grows.
const pixelReveal = (reveal: Reveal, x: number, y: number, pixel: number) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cols = Math.ceil(width / pixel);
  const rows = Math.ceil(height / pixel);
  // Every reveal has to end exactly on the last cell on screen. For the circle
  // that is the corner farthest from the icon: a fixed 150% looked fine from
  // the middle of the screen, but from a toggle near an edge the far corner is
  // a whole diagonal away, so the circle stopped short and that corner jumped
  // to the new theme in the final frame.
  const reachX = Math.max(x, width - x) + pixel;
  const reachY = Math.max(y, height - y) + pixel;
  const far = Math.hypot(reachX, reachY);
  const farSteps = reachX + reachY;
  const cornerX = x < width / 2 ? width : 0;
  const cornerY = y < height / 2 ? height : 0;
  const toCorner = Math.hypot(cornerX - x, cornerY - y) || 1;
  const ux = (cornerX - x) / toCorner;
  const uy = (cornerY - y) / toCorner;
  const along = [0, width].flatMap((cx) => [0, height].map((cy) => (cx - x) * ux + (cy - y) * uy));
  const alongMin = Math.min(...along) - pixel;
  const alongSpan = Math.max(...along) + pixel - alongMin;

  const fringeBy: Record<Reveal, number> = {
    circle: (FRINGE * pixel) / far,
    sparks: (FRINGE * pixel) / far,
    sonar: (FRINGE * pixel) / far,
    spiral: (FRINGE * pixel) / far,
    diamond: (FRINGE * pixel) / farSteps,
    equalizer: ((1 - BAR_STAGGER) * FRINGE) / rows,
    sweep: (FRINGE * pixel) / alongSpan,
    zipper: ((1 - TOOTH) * FRINGE * pixel) / reachY,
  };
  const fringe = fringeBy[reveal];
  // A tile is a pixel wider than its cell so neighbours overlap and no
  // hairline of the old theme shows between them.
  const full = pixel + 1;

  const ring = pixel / far;
  const distance = new Float32Array(rows * cols);
  const reach = new Float32Array(rows * cols);
  for (let index = 0; index < reach.length; index++) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const dx = (col + 0.5) * pixel - x;
    const dy = (row + 0.5) * pixel - y;
    distance[index] = Math.hypot(dx, dy) / far;
    if (reveal === 'diamond') {
      reach[index] = (Math.abs(dx) + Math.abs(dy)) / farSteps;
    } else if (reveal === 'equalizer') {
      const bar = Math.floor(col / BAR);
      const barX = (bar + 0.5) * BAR * pixel;
      const rise = (rows - row - 0.5) / rows;
      reach[index] = BAR_STAGGER * (Math.abs(barX - x) / reachX) + (1 - BAR_STAGGER) * rise;
    } else if (reveal === 'sweep') {
      reach[index] = (dx * ux + dy * uy - alongMin) / alongSpan;
    } else if (reveal === 'zipper') {
      const ahead = (col % 2 === 0) === dy < 0;
      reach[index] = (1 - Math.abs(dy) / reachY) * (1 - TOOTH) + (ahead ? 0 : TOOTH);
    } else if (reveal === 'spiral') {
      const d = distance[index];
      const turn = Math.atan2(dy, dx) / (2 * Math.PI) + SPIRAL_TURNS * d;
      reach[index] = 0.7 * d + 0.3 * (turn - Math.floor(turn));
    } else {
      const d = distance[index];
      const spark = reveal === 'sparks' && Math.random() < SPARK_SHARE;
      reach[index] = spark ? d * (0.25 + 0.5 * Math.random()) : d;
    }
  }

  const square = (cx: number, cy: number, grown: number) => {
    const size = +(grown * full).toFixed(2);
    return `M${+(cx - size / 2).toFixed(2)} ${+(cy - size / 2).toFixed(2)}h${size}v${size}h${-size}Z`;
  };

  return (time: number) => {
    if (time >= 1) return 'inset(0)';
    const progress = easeInOut(time) * (1 + fringe);
    let d = 'M0 0Z';
    for (let row = 0; row < rows; row++) {
      const cy = (row + 0.5) * pixel;
      let start = -1;
      for (let col = 0; col <= cols; col++) {
        const index = row * cols + col;
        const lit = col < cols && reach[index] <= progress;
        if (lit) {
          if (start < 0) start = col;
          continue;
        }
        if (start >= 0) {
          const run = (col - start) * pixel;
          d += `M${start * pixel} ${row * pixel}h${run}v${pixel}h${-run}Z`;
          start = -1;
        }
        if (col === cols) break;
        let grown = 1 - (reach[index] - progress) / fringe;
        if (reveal === 'sonar') {
          SONAR_RINGS.forEach((lead, ping) => {
            if (Math.abs(distance[index] - progress - lead) < ring) {
              grown = Math.max(grown, 0.8 - 0.3 * ping);
            }
          });
        }
        if (grown > 0) d += square((col + 0.5) * pixel, cy, Math.min(grown, 1));
      }
    }
    return `path('${d}')`;
  };
};

const applyToRoot = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

const Word = ({ text, row, shown }: { text: string; row: Theme; shown: boolean }) => (
  <span data-row={row} className="col-start-1 row-start-1 whitespace-pre">
    {Array.from(text).map((char, index) => (
      <span
        key={index}
        data-char
        className="inline-block"
        style={shown ? undefined : { opacity: 0 }}
      >
        {char}
      </span>
    ))}
  </span>
);

export interface ThemeToggleRevealProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'onClick'
> {
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  applyTheme?: (theme: Theme) => void;
  labels?: Record<Theme, string>;
  duration?: number;
  pixelSize?: number;
  reveal?: Reveal;
}

const ThemeToggleReveal = ({
  theme: themeProp,
  defaultTheme,
  onThemeChange,
  applyTheme = applyToRoot,
  labels = LABELS,
  duration = DURATION,
  pixelSize = PIXEL,
  reveal = 'circle',
  className,
  type = 'button',
  ref,
  ...props
}: ThemeToggleRevealProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const morph = useRef(false);
  const [ownTheme, setOwnTheme] = useState<Theme>(defaultTheme ?? 'light');
  const controlled = themeProp !== undefined;
  const theme = controlled ? themeProp : ownTheme;
  const [firstTheme] = useState(theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const live = useRef(theme);

  useLayoutEffect(() => {
    live.current = theme;
  }, [theme]);

  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (controlled || defaultTheme) return;
    if (document.documentElement.classList.contains('dark')) setOwnTheme('dark');
  }, [controlled, defaultTheme]);

  useGSAP(
    () => {
      const dark = theme === 'dark';
      const sun = { rotate: dark ? -90 : 0, scale: dark ? 0.6 : 1, autoAlpha: dark ? 0 : 1 };
      const rays = { scale: dark ? 0 : 1, svgOrigin: '12 12' };
      const moon = { rotate: dark ? 0 : 90, scale: dark ? 1 : 0.6, autoAlpha: dark ? 1 : 0 };
      // The two labels sit on a drum: dark is one row below light. Going dark
      // it turns up, going light it turns back down, one letter after another.
      const lightRow = { yPercent: dark ? -110 : 0, opacity: dark ? 0 : 1 };
      const darkRow = { yPercent: dark ? 0 : 110, opacity: dark ? 1 : 0 };

      const animate = morph.current && !prefersReducedMotion();
      morph.current = false;
      if (!animate) {
        gsap.set('[data-sun]', sun);
        gsap.set('[data-sun] path', rays);
        gsap.set('[data-moon]', moon);
        gsap.set('[data-row=light] [data-char]', lightRow);
        gsap.set('[data-row=dark] [data-char]', darkRow);
        return;
      }

      const letters = {
        duration: MORPH * 0.7,
        stagger: { each: 0.025, from: dark ? 'start' : 'end' },
      } as const;
      const tl = gsap.timeline({ defaults: { duration: MORPH, ease: 'power3.inOut' } });
      tl.to(
        '[data-sun] path',
        { ...rays, duration: MORPH * 0.6, stagger: 0.02 },
        dark ? 0 : MORPH * 0.4
      )
        .to('[data-sun]', sun, dark ? MORPH * 0.2 : 0)
        .to('[data-moon]', moon, dark ? MORPH * 0.2 : 0)
        .to('[data-row=light] [data-char]', { ...lightRow, ...letters }, 0)
        .to('[data-row=dark] [data-char]', { ...darkRow, ...letters }, 0.05);
    },
    { scope: btnRef, dependencies: [theme] }
  );

  // The target is read when the update runs, not when the click happened. Two
  // quick clicks can both land before the first update has run, and each has
  // to flip from wherever the theme is by then, or both would pick the same
  // theme and the second click would do nothing.
  const commit = () => {
    const target: Theme = live.current === 'dark' ? 'light' : 'dark';
    live.current = target;
    morph.current = true;
    flushSync(() => {
      if (!controlled) setOwnTheme(target);
      onThemeChange?.(target);
    });
    applyTheme(target);
  };

  const toggle = () => {
    const origin = iconRef.current ?? btnRef.current;
    if (!origin || running.current) return;

    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      commit();
      return;
    }

    // The new theme pours out of the sun or moon itself, not the middle of
    // the pill, so the first pixels light right around the icon.
    const box = origin.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;

    // The pixel frames used to be precomputed keyframes, one every 1/60s.
    // Keyframes that don't share a shape can't be blended, so the browser
    // flipped between them halfway through each interval, and whenever that
    // drifted off the display's own frames one shape was held twice: the
    // circle jerked. Now a frame is drawn on every requestAnimationFrame from
    // the real elapsed time, written into one rule for the new snapshot. An
    // empty animation on the same pseudo-element holds the transition open for
    // the full duration, since the transition ends when its animations do.
    const frameAt = pixelReveal(reveal, x, y, pixelSize);
    const clip = document.createElement('style');
    const draw = (progress: number) => {
      clip.textContent = `${CLIP_RULE} { clip-path: ${frameAt(progress)}; }`;
    };
    draw(0);
    document.head.append(clip);

    // While a reveal runs the toggle is switched off, and says so. Starting a
    // second view transition mid-reveal skips the first one: its circle
    // vanishes and the theme jumps, which looked like a glitch rather than a
    // switch. Native disabled would drop keyboard focus off the button, so it
    // is aria-disabled instead: it stays focused, ignores clicks and looks
    // disabled until the circle has covered the screen.
    running.current = true;
    setBusy(true);
    const root = document.documentElement;
    root.dataset.themeReveal = '';
    const transition = document.startViewTransition(commit);
    let frame = 0;

    transition.ready
      .then(() => {
        root.animate(
          { opacity: [1, 1] },
          { duration, pseudoElement: '::view-transition-new(root)' }
        );
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(Math.max((now - start) / duration, 0), 1);
          draw(progress);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      })
      .catch(() => {});

    const done = () => {
      cancelAnimationFrame(frame);
      clip.remove();
      delete root.dataset.themeReveal;
      running.current = false;
      setBusy(false);
    };
    transition.finished.then(done, done);
  };

  return (
    <button
      ref={setRef}
      type={type}
      aria-label={`${labels[theme]}, switch to ${next} theme`}
      aria-disabled={busy || undefined}
      data-theme-state={theme}
      onClick={toggle}
      className={cn(
        'relative inline-flex h-12 cursor-pointer items-center gap-3 rounded-full border border-current/15 bg-current/[0.04] py-0 pr-5 pl-1.5 text-sm font-medium text-current transition-[background-color,border-color,scale,opacity] duration-200 ease-out outline-none select-none not-aria-disabled:hover:border-current/30 not-aria-disabled:hover:bg-current/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current not-disabled:not-aria-disabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
        className
      )}
      {...props}
    >
      <style href="tween-theme-toggle-reveal" precedence="default">
        {REVEAL_CSS}
      </style>
      <span
        ref={iconRef}
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full bg-current/10"
      >
        <span data-sun className="col-start-1 row-start-1 grid">
          <Sun className="size-[18px]" />
        </span>
        <span data-moon className="invisible col-start-1 row-start-1 grid">
          <Moon className="size-[18px]" />
        </span>
      </span>
      <span aria-hidden="true" className="grid overflow-hidden leading-6">
        <Word text={labels.light} row="light" shown={firstTheme === 'light'} />
        <Word text={labels.dark} row="dark" shown={firstTheme === 'dark'} />
      </span>
    </button>
  );
};

export default ThemeToggleReveal;
