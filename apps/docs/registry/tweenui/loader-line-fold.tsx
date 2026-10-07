'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase, SplitText);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ease = {
  out: CustomEase.create('llf-out', '0.22,1,0.36,1'),
  expo: CustomEase.create('llf-expo', '0.16,1,0.3,1'),
  inOut: CustomEase.create('llf-in-out', '0.76,0,0.24,1'),
};

const ASSET_TIMEOUT = 6000;

/** Fonts plus every image in the content, capped so a slow network never holds the page. */
const assetsReady = (content: HTMLElement | null) => {
  const fonts = typeof document !== 'undefined' ? document.fonts?.ready : undefined;
  const images = Array.from(content?.querySelectorAll('img') ?? []).map((img) =>
    typeof img.decode === 'function' ? img.decode().catch(() => undefined) : undefined
  );
  return Promise.race([
    Promise.all([fonts, ...images]),
    new Promise((resolve) => setTimeout(resolve, ASSET_TIMEOUT)),
  ]);
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const label = 'font-mono text-[11px] font-medium tracking-[0.08em] uppercase';

export interface LoaderLineFoldProps extends ComponentPropsWithoutRef<'section'> {
  /** The word that rises letter by letter. */
  wordmark?: string;
  /** Left of the meta row, before the live clock. */
  location?: string;
  /** IANA time zone for the clock. Defaults to the visitor's own. */
  timeZone?: string;
  /** Right of the meta row. */
  credit?: string;
  /** Seconds the counter takes to reach 90%, however fast the assets load. */
  minDuration?: number;
  /** Resolves when the page is ready. Defaults to fonts plus every image in `children`. */
  ready?: () => Promise<unknown>;
  /** Cover the whole viewport and lock page scroll, instead of filling this section. */
  fullscreen?: boolean;
  /** Fires as the page starts opening out of the centre point. */
  onComplete?: () => void;
  /** What the loader opens onto. Defaults to a sample hero. */
  children?: ReactNode;
}

function Clock({ timeZone }: { timeZone?: string }) {
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    let timer = 0;
    const tick = () => {
      setTime(format.format(new Date()));
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [timeZone]);

  return <time className="tabular-nums">{time}</time>;
}

function SampleHero() {
  return (
    <div className="grid h-full w-full place-items-center bg-white px-5 text-center sm:px-8">
      <div className="grid justify-items-center gap-4">
        <p className={cn(label, 'text-[#045f64]')}>Loader Line Fold</p>
        <h2 className="max-w-[14ch] text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-[#03110f]">
          Your awesome hero here
        </h2>
        <p className="max-w-[38ch] text-[15px] leading-relaxed text-balance text-[#03110f]/60">
          Pass your own hero as children and the page opens onto it.
        </p>
      </div>
    </div>
  );
}

export default function LoaderLineFold({
  wordmark = 'Tween UI',
  location = 'Local time',
  timeZone,
  credit,
  minDuration = 1.6,
  ready,
  fullscreen = false,
  onComplete,
  children,
  className,
  ...props
}: LoaderLineFoldProps) {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useGSAP(
    () => {
      const content = contentRef.current;
      const word = wordRef.current;
      const panel = panelRef.current;
      const line = lineRef.current;
      const track = trackRef.current;
      const fill = fillRef.current;
      const count = countRef.current;
      const meta = metaRef.current;
      if (
        !word ||
        !panel ||
        !line ||
        !track ||
        !fill ||
        !count ||
        !meta ||
        prefersReducedMotion()
      ) {
        onCompleteRef.current?.();
        const id = requestAnimationFrame(() => setDone(true));
        return () => cancelAnimationFrame(id);
      }

      const lock = (on: boolean) => {
        if (fullscreen) document.documentElement.style.overflow = on ? 'hidden' : '';
      };
      lock(true);

      const split = SplitText.create(word, { type: 'chars', mask: 'chars', aria: 'none' });
      // Tight tracking lets curves and diagonals overhang their letter boxes: give each mask
      // room on every side and cancel it with negative margins so the spacing stays the same.
      (split.masks as HTMLElement[]).forEach((mask) => {
        mask.style.cssText += ';padding:0.08em 0.1em;margin:-0.08em -0.1em';
      });

      const progress = { value: 0 };
      const render = () => {
        const p = progress.value / 100;
        fill.style.transform = `scaleX(${p})`;
        count.textContent = `${String(Math.round(progress.value)).padStart(3, '0')}%`;
        // The counter rides the tip of the line, never past the left edge
        count.style.left = `${Math.max(count.offsetWidth, p * line.offsetWidth)}px`;
      };
      render();

      gsap.set(split.chars, { yPercent: 110 });
      gsap.set(word, { opacity: 1 });
      if (content) gsap.set(content, { scale: 1.25, filter: 'brightness(0.2)' });

      const intro = gsap
        .timeline({ defaults: { ease: ease.out } })
        .fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06 }, 0.15)
        .fromTo([meta, count], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.35)
        .fromTo(
          track,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: ease.inOut, transformOrigin: 'left center' },
          0.2
        );

      const counting = gsap.to(progress, {
        value: 90,
        duration: minDuration,
        delay: 0.4,
        ease: 'power2.inOut',
        onUpdate: render,
      });

      // A centred rectangular hole in the sheet (evenodd polygon): 0 = closed, 1 = past the edges
      const hole = { w: 0, h: 0 };
      const cut = () => {
        const [l, r] = [50 - 51 * hole.w, 50 + 51 * hole.w];
        const [t, b] = [50 - 51 * hole.h, 50 + 51 * hole.h];
        panel.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${l}% ${t}%, ${r}% ${t}%, ${r}% ${b}%, ${l}% ${b}%, ${l}% ${t}%)`;
      };

      let outro: gsap.core.Timeline | null = null;
      const exit = () => {
        const stage = panel.getBoundingClientRect();
        const lineBox = line.getBoundingClientRect();
        const toMiddle = stage.top + stage.height / 2 - (lineBox.top + lineBox.height / 2);
        outro = gsap
          .timeline({
            onComplete: () => {
              lock(false);
              setDone(true);
            },
          })
          .to(split.chars, { yPercent: -110, duration: 0.7, stagger: 0.04, ease: ease.inOut }, 0)
          .to([meta, count], { autoAlpha: 0, y: 10, duration: 0.4, ease: 'power2.in' }, 0)
          .to(track, { autoAlpha: 0, duration: 0.4 }, 0.1)
          .to(line, { y: toMiddle, duration: 0.9, ease: ease.inOut }, 0.15)
          // The line folds into the centre point...
          .to(fill, { scaleX: 0, transformOrigin: '50% 50%', duration: 0.6, ease: ease.inOut }, 1)
          // ...and the page opens out of that point to every edge, width leading height
          .add('open', 1.25)
          .to(hole, { w: 1, duration: 1.3, ease: ease.inOut, onUpdate: cut }, 'open')
          .to(hole, { h: 1, duration: 1.3, ease: ease.inOut, onUpdate: cut }, 'open+=0.1')
          .call(() => onCompleteRef.current?.(), undefined, 'open');
        if (content) {
          outro.to(
            content,
            {
              scale: 1,
              filter: 'brightness(1)',
              duration: 2.4,
              ease: ease.expo,
              clearProps: 'transform,filter',
            },
            'open'
          );
        }
      };

      let finish: gsap.core.Tween | null = null;
      let cancelled = false;
      const waiting = readyRef.current?.() ?? assetsReady(content);
      Promise.all([waiting, counting.then()]).then(() => {
        if (cancelled) return;
        finish = gsap.to(progress, {
          value: 100,
          duration: 0.45,
          ease: 'power2.out',
          onUpdate: render,
          onComplete: exit,
        });
      });

      return () => {
        cancelled = true;
        [intro, counting, finish, outro].forEach((tween) => tween?.kill());
        split.revert();
        if (content) gsap.set(content, { clearProps: 'transform,filter' });
        lock(false);
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
        !fullscreen && 'h-full min-h-[600px] overflow-hidden max-sm:min-h-[540px]',
        className
      )}
      {...props}
    >
      <div ref={contentRef} className={cn('w-full', !fullscreen && 'absolute inset-0')}>
        {children ?? <SampleHero />}
      </div>

      {!done && (
        <div
          aria-hidden="true"
          className={cn(
            '@container inset-0 motion-reduce:hidden',
            fullscreen ? 'fixed z-[60]' : 'absolute z-10'
          )}
        >
          {/* One dark sheet; the exit cuts a hole in it that grows out from the centre */}
          <div ref={panelRef} className="absolute inset-0 overflow-hidden bg-[#03110f]">
            <span className="pointer-events-none absolute top-full left-1/2 h-[90%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(4_95_100/0.55)_0%,rgb(4_95_100/0.18)_50%,rgb(4_95_100/0)_100%)]" />
            <div
              className="pointer-events-none absolute inset-0 bg-size-[128px_128px] bg-repeat opacity-12 mix-blend-screen"
              style={{ backgroundImage: GRAIN }}
            />
          </div>

          <div className="absolute inset-0 grid place-items-center">
            <p
              ref={wordRef}
              className="pb-[0.04em] text-[min(17cqw,224px)] leading-[0.85] font-semibold tracking-[-0.05em] whitespace-nowrap text-[#e8f3f2] uppercase opacity-0 @3xl:text-[min(14cqw,224px)]"
            >
              {wordmark}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 @5xl:px-12 @5xl:pb-12">
            <div ref={lineRef} className="relative h-px w-full">
              <div ref={trackRef} className="absolute inset-0 bg-[#9fd4d6]/16" />
              <div
                ref={fillRef}
                className="absolute inset-0 origin-left bg-[#c6f56f]"
                style={{ transform: 'scaleX(0)' }}
              />
              <span
                ref={countRef}
                className={cn(
                  label,
                  'absolute bottom-3 left-0 -translate-x-full text-[#c6f56f] tabular-nums opacity-0'
                )}
              >
                000%
              </span>
            </div>
            <div
              ref={metaRef}
              className={cn(label, 'mt-4 flex justify-between gap-6 text-[#9fd4d6]/60 opacity-0')}
            >
              <span>
                {location} {'//'} <Clock timeZone={timeZone} />
              </span>
              <span suppressHydrationWarning>
                {credit ?? `${wordmark} ©${new Date().getFullYear()}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
