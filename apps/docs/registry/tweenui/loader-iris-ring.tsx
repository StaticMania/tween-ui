'use client';

import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The percentages the gauge stops on: uneven, like a real load. */
const STEPS = [0, 7, 18, 26, 41, 53, 62, 78, 86, 94, 100];
const STEP = 0.24;

export interface LoaderModule {
  label: string;
  count: number;
}

type Status = 'waiting' | 'syncing' | 'live';

export interface LoaderIrisRingProps extends ComponentPropsWithoutRef<'section'> {
  /** Counters in the four corners; each one syncs, counts up and goes live in turn. */
  modules?: LoaderModule[];
  /** Images flashed through the lens while the gauge fills. */
  frames?: string[];
  /** Words for a module's three states. */
  status?: Record<Status, string>;
  /** Caption under the percentage, while loading and once done. */
  caption?: { loading: string; done: string };
  /** Cover the whole viewport and lock page scroll, instead of filling this section. */
  fullscreen?: boolean;
  /** Fires as the iris opens and the page settles in. */
  onComplete?: () => void;
  /**
   * What the iris opens onto. Defaults to a sample page. Mark an element with
   * `data-loader-target` (the exported `IrisRingMark` fits exactly) and the ring flies into it.
   */
  children?: ReactNode;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=480&h=480&fit=crop&auto=format&q=75`;

const INK = '#e8f3f2';
const LIME = '#c6f56f';

const DEFAULT_MODULES: LoaderModule[] = [
  { label: 'Components', count: 20 },
  { label: 'Blocks', count: 27 },
  { label: 'Test suites', count: 55 },
  { label: 'Motion-safe', count: 47 },
];

const DEFAULT_FRAMES = [
  'photo-1461749280684-dccba630e2f6',
  'photo-1518770660439-4636190af475',
  'photo-1460925895917-afdab827c52f',
  'photo-1550751827-4bd374c3f58b',
  'photo-1498050108023-c5249f4df085',
  'photo-1526374965328-7f61d4dc18c5',
  'photo-1551288049-bebda4e38f71',
  'photo-1555066931-4365d14bab8c',
].map(unsplash);

const DEFAULT_STATUS: Record<Status, string> = {
  waiting: 'Queued',
  syncing: 'Tweening',
  live: 'Ready',
};

const DEFAULT_CAPTION = { loading: 'Warming up timelines', done: 'Ready to tween' };

/**
 * The landing spot for the ring: a 32-unit circle of radius 12.5 with the dot on top,
 * the same proportions the flight is solved for. The ring takes on the mark's `color`
 * and the dot's fill on the way in, so it lands matching either theme.
 */
export function IrisRingMark({ className, ...props }: ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      data-loader-target=""
      className={cn('size-7 shrink-0 text-[#03110f]', className)}
      {...props}
    >
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="3.5" r="3.5" fill="#045f64" data-loader-target-dot="" />
    </svg>
  );
}

function SamplePage() {
  return (
    <div className="flex h-full w-full flex-col bg-white text-[#03110f]">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <IrisRingMark />
          <span className="text-lg font-semibold tracking-tight">Tween UI</span>
        </span>
        <span className="font-mono text-[11px] tracking-[0.08em] text-[#03110f]/55 uppercase max-sm:hidden">
          Components · Blocks · Docs
        </span>
      </header>
      <div className="grid flex-1 place-items-center px-5 pb-16 text-center sm:px-8">
        <div className="grid justify-items-center gap-4">
          <p className="font-mono text-[11px] tracking-[0.08em] text-[#045f64] uppercase">
            Loader Iris Ring
          </p>
          <h2 className="max-w-[14ch] text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-[#03110f]">
            Your awesome hero here
          </h2>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-balance text-[#03110f]/60">
            Pass your own page as children. The ring lands on any mark with{' '}
            <code className="font-mono text-[13px]">data-loader-target</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoaderIrisRing({
  modules = DEFAULT_MODULES,
  frames = DEFAULT_FRAMES,
  status = DEFAULT_STATUS,
  caption = DEFAULT_CAPTION,
  fullscreen = false,
  onComplete,
  children,
  className,
  ...props
}: LoaderIrisRingProps) {
  const [done, setDone] = useState(false);
  const [percent, setPercent] = useState(0);
  const [counts, setCounts] = useState(() => modules.map(() => 0));
  const [states, setStates] = useState<Status[]>(() => modules.map(() => 'waiting'));
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useGSAP(
    () => {
      const root = rootRef.current;
      const page = pageRef.current;
      if (!root || prefersReducedMotion()) {
        onCompleteRef.current?.();
        const id = requestAnimationFrame(() => setDone(true));
        return () => cancelAnimationFrame(id);
      }

      const q = <T extends Element = HTMLElement>(selector: string) =>
        root.querySelector<T>(`[data-loader] ${selector}`);
      const veil = q('[data-loader-veil]');
      const content = q('[data-loader-content]');
      const ring = q('[data-loader-ring]');
      const arc = q<SVGCircleElement>('[data-loader-arc]');
      const track = q<SVGCircleElement>('[data-loader-track]');
      const hand = q('[data-loader-hand]');
      const dot = q('[data-loader-dot]');
      const lens = q('[data-loader-lens]');
      const readout = q('[data-loader-readout]');
      const moduleEls = gsap.utils.toArray<HTMLElement>('[data-loader] [data-loader-module]', root);
      const frameEls = gsap.utils.toArray<HTMLElement>('[data-loader] [data-loader-frame]', root);
      const mark = page?.querySelector<HTMLElement>('[data-loader-target]') ?? null;

      if (fullscreen) {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'hidden';
      }
      const unlock = () => {
        if (fullscreen) document.documentElement.style.overflow = '';
      };

      const iris = { r: 0 };
      const setIris = () => {
        if (!veil) return;
        const mask = `radial-gradient(circle at 50% 50%, transparent ${iris.r}px, #000 ${iris.r + 1.5}px)`;
        veil.style.maskImage = mask;
        veil.style.setProperty('-webkit-mask-image', mask);
      };

      if (mark) gsap.set(mark, { opacity: 0 });
      const origin = fullscreen ? `50% ${window.innerHeight / 2}px` : '50% 50%';
      if (page) gsap.set(page, { scale: 1.12, transformOrigin: origin });

      const tl = gsap.timeline({
        onComplete: () => {
          unlock();
          setDone(true);
        },
      });

      tl.fromTo(
        ring,
        { scale: 0.7, opacity: 0, rotation: -40 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.4, ease: 'expo.out' },
        0
      )
        .fromTo(lens, { scale: 0.4 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, 0.1)
        .to(readout, { opacity: 1, duration: 0.6 }, 0.3);

      frameEls.forEach((frame, i) => {
        const at = 0.35 + i * 0.3;
        tl.fromTo(
          frame,
          { opacity: 0, scale: 1.25 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
          at
        );
        if (i > 0) tl.set(frameEls[i - 1], { opacity: 0 }, at + 0.18);
      });

      // One continuous sweep through the uneven steps: the pace changes from step to step
      // but never stops, and the readout ticks over as the arc passes each step.
      const gauge = { p: 0 };
      const along = gsap.utils.interpolate(STEPS);
      const last = STEPS.length - 1;
      let shown = 0;
      tl.to(
        gauge,
        {
          p: 1,
          duration: last * STEP,
          ease: 'sine.inOut',
          onUpdate: () => {
            const value = along(gauge.p);
            arc?.setAttribute('stroke-dashoffset', String(1 - value / 100));
            if (hand) gsap.set(hand, { rotation: value * 3.6 });
            const step = Math.min(last, Math.floor(gauge.p * last + 1e-6));
            if (step !== shown) {
              shown = step;
              setPercent(STEPS[step]);
            }
          },
        },
        0.4
      );

      const setModule = (i: number, next: Status) =>
        setStates((prev) => prev.map((state, j) => (j === i ? next : state)));

      moduleEls.forEach((module, i) => {
        const at = 0.45 + i * 0.5;
        tl.fromTo(
          module,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
          at
        )
          .call(
            () => {
              setModule(i, 'syncing');
              setCounts((prev) => prev.map((count, j) => (j === i ? modules[i].count : count)));
            },
            [],
            at + 0.2
          )
          .call(() => setModule(i, 'live'), [], at + 1.1);
      });

      const end = 0.4 + (STEPS.length - 1) * STEP;
      tl.call(() => setIsDone(true), [], end + 0.1)
        .fromTo(
          dot,
          { scale: 1 },
          { scale: 1.8, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' },
          end + 0.1
        )
        .add('open', end + 0.65)
        .call(
          () => {
            iris.r = lens ? lens.getBoundingClientRect().width / 2 : 0;
            setIris();
          },
          [],
          'open'
        )
        .to(frameEls, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 'open')
        .to(lens, { opacity: 0, duration: 0.3 }, 'open')
        .to(
          iris,
          {
            r: () => {
              const box = root.getBoundingClientRect();
              const [w, h] = fullscreen
                ? [window.innerWidth, window.innerHeight]
                : [box.width, box.height];
              return Math.hypot(w, h) / 2 + 40;
            },
            duration: 1.5,
            ease: 'expo.inOut',
            onUpdate: setIris,
          },
          'open+=0.15'
        )
        .to(
          moduleEls,
          { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in', stagger: 0.04 },
          'open+=0.1'
        )
        .to(readout, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.in' }, 'open+=0.1');

      if (ring && arc && mark) {
        // Where the mark will sit once the page has settled to scale 1
        const landing = () => {
          const scale = page ? Number(gsap.getProperty(page, 'scale')) : 1;
          if (page) gsap.set(page, { scale: 1 });
          const to = mark.getBoundingClientRect();
          if (page) gsap.set(page, { scale });
          return to;
        };
        const flight = () => {
          const from = ring.getBoundingClientRect();
          const to = landing();
          const scale = (to.width * (25 / 32)) / (from.width * 0.96);
          const markDot = mark.querySelector('[data-loader-target-dot]');
          return {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale,
            stroke: (to.width * (2 / 32)) / ((from.width * scale) / 100),
            dot: (to.width * (7 / 32)) / ((dot?.offsetWidth || 14) * scale),
            // The ring lands in the mark's own colours, so it never vanishes on a light page
            color: getComputedStyle(mark).color,
            dotColor: markDot ? getComputedStyle(markDot).fill : LIME,
          };
        };
        let path = {
          x: 0,
          y: 0,
          scale: 1,
          stroke: 0.7,
          dot: 1,
          color: INK,
          dotColor: LIME,
        };
        tl.call(() => void (path = flight()), [], 'open+=0.2')
          .to(ring, { x: () => path.x, duration: 1.3, ease: 'power3.inOut' }, 'open+=0.25')
          .to(ring, { y: () => path.y, duration: 1.3, ease: 'expo.inOut' }, 'open+=0.25')
          .to(
            ring,
            { scale: () => path.scale, rotation: 0, duration: 1.3, ease: 'expo.inOut' },
            'open+=0.25'
          )
          .to(
            arc,
            {
              attr: { 'stroke-width': () => path.stroke, stroke: () => path.color },
              duration: 1.3,
              ease: 'expo.inOut',
            },
            'open+=0.25'
          )
          .to(track, { opacity: 0, duration: 0.4 }, 'open+=0.25')
          .to(hand, { rotation: 360, duration: 1.3, ease: 'expo.inOut' }, 'open+=0.25')
          .to(
            dot,
            {
              scale: () => path.dot,
              backgroundColor: () => path.dotColor,
              boxShadow: '0 0 0 rgb(198 245 111 / 0)',
              duration: 1.3,
              ease: 'expo.inOut',
            },
            'open+=0.25'
          )
          .call(
            () => {
              gsap.set(ring, { opacity: 0 });
              gsap.set(mark, { opacity: 1 });
              gsap.fromTo(
                mark,
                { scale: 1.25 },
                { scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '50% 50%' }
              );
            },
            [],
            'open+=1.55'
          )
          .set(content, { opacity: 0 }, 'open+=1.6');
      } else {
        tl.to(
          ring,
          { opacity: 0, scale: 1.25, duration: 0.9, ease: 'power3.in' },
          'open+=0.15'
        ).set(content, { opacity: 0 }, 'open+=1.1');
      }

      if (page) {
        tl.to(
          page,
          { scale: 1, duration: 1.9, ease: 'expo.out', clearProps: 'transform,transformOrigin' },
          'open+=0.2'
        );
      }

      tl.call(() => onCompleteRef.current?.(), [], 'open+=0.75');

      return () => {
        tl.kill();
        if (page) gsap.set(page, { clearProps: 'transform,transformOrigin' });
        if (mark) gsap.set(mark, { clearProps: 'opacity,transform' });
        unlock();
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      aria-busy={!done}
      className={cn(
        'relative isolate w-full bg-white text-[#03110f]',
        !fullscreen && 'h-full min-h-[600px] overflow-hidden',
        className
      )}
      {...props}
    >
      <div ref={pageRef} className={cn('w-full', !fullscreen && 'absolute inset-0')}>
        {children ?? <SamplePage />}
      </div>

      {!done && (
        <div
          aria-hidden="true"
          data-loader=""
          className={cn(
            'inset-0 [--ring:min(62cqw,24rem,52cqh)] motion-reduce:hidden',
            fullscreen ? 'fixed z-[90]' : 'absolute z-10'
          )}
          style={{ containerType: 'size' } as CSSProperties}
        >
          <div className="absolute inset-0 overflow-hidden bg-[#03110f]" data-loader-veil="">
            <span className="pointer-events-none absolute top-full left-1/2 h-[90%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(4_95_100/0.55)_0%,rgb(4_95_100/0.18)_50%,rgb(4_95_100/0)_100%)]" />
          </div>
          <div className="absolute inset-0" data-loader-content="">
            <div className="absolute inset-0 grid grid-cols-2 content-between px-5 py-8 sm:px-8 @min-[48rem]:py-10">
              {modules.map((module, i) => (
                <div
                  key={module.label}
                  className={cn('opacity-0', i % 2 === 1 && 'justify-self-end text-right')}
                  data-loader-module=""
                >
                  <p className="font-mono text-[11px] tracking-[0.08em] text-[#9fd4d6]/70 uppercase">
                    {module.label}
                  </p>
                  <p className="mt-2 text-[clamp(1.75rem,3cqw,2.75rem)] leading-none font-bold tracking-[-0.03em] text-[#e8f3f2]">
                    <NumberFlow
                      value={counts[i] ?? 0}
                      transformTiming={{ duration: 900, easing: 'ease-out' }}
                      spinTiming={{ duration: 900, easing: 'ease-out' }}
                    />
                  </p>
                  <p
                    className={cn(
                      'mt-2 font-mono text-[0.6875rem] tracking-[0.06em] uppercase transition-colors duration-300 motion-reduce:transition-none',
                      states[i] === 'live' ? 'text-[#c6f56f]' : 'text-[#9fd4d6]/40'
                    )}
                  >
                    {status[states[i] ?? 'waiting']}
                  </p>
                </div>
              ))}
            </div>

            <div className="absolute top-1/2 left-1/2 size-(--ring) -translate-x-1/2 -translate-y-1/2">
              <div className="relative size-full opacity-0" data-loader-ring="">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 size-full -rotate-90 overflow-visible"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="rgb(159 212 214 / 0.24)"
                    strokeWidth="0.3"
                    data-loader-track=""
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="#e8f3f2"
                    strokeWidth="0.7"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    data-loader-arc=""
                  />
                </svg>
                <div className="absolute inset-0" data-loader-hand="">
                  <span
                    className="absolute top-[2%] left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c6f56f] shadow-[0_0_24px_rgb(198_245_111/0.7)]"
                    data-loader-dot=""
                  />
                </div>
                <div
                  className="absolute inset-[13%] overflow-hidden rounded-full bg-[#071d1b]"
                  data-loader-lens=""
                >
                  {frames.map((frame) => (
                    <img
                      key={frame}
                      src={frame}
                      alt=""
                      loading="eager"
                      className="absolute inset-0 size-full object-cover opacity-0"
                      data-loader-frame=""
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              className="absolute inset-x-0 top-[calc(50%+var(--ring)/2+1.25rem)] flex flex-col items-center gap-2 opacity-0"
              data-loader-readout=""
            >
              <span className="flex items-baseline font-mono text-[clamp(2rem,4cqw,3.25rem)] leading-none text-[#e8f3f2]">
                <NumberFlow
                  value={percent}
                  format={{ useGrouping: false }}
                  transformTiming={{ duration: 300, easing: 'ease-out' }}
                  spinTiming={{ duration: 300, easing: 'ease-out' }}
                />
                <span className="ml-1 text-[#c6f56f]">%</span>
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-[#9fd4d6]/70 uppercase">
                {isDone ? caption.done : caption.loading}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
