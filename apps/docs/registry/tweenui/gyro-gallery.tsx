'use client';

import { useId, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface GyroItem {
  title: string;
  image: string;
  /** A short tag shown under the title, e.g. "Block". */
  kind?: string;
  href?: string;
}

export interface GyroGalleryProps extends ComponentPropsWithoutRef<'section'> {
  items?: GyroItem[];
  title?: string;
  description?: string;
}

/**
 * Three concentric orbits, counter-rotating like the rings of a gyroscope. `radius` is a
 * share of the stage's shorter side and `spin` is radians per second (negative runs
 * backwards). The rings share one plane on purpose: concentric ellipses on a shared
 * plane never cross, so tiles on different rings never pile onto each other, and the
 * gaps between rings are wider than a tile even at the steepest the pointer can tip them.
 */
const ORBITS = [
  { radius: 0.19, spin: 0.16, count: 5 },
  { radius: 0.31, spin: -0.11, count: 8 },
  { radius: 0.43, spin: 0.07, count: 11 },
] as const;
/** The plane the rings share: leaned back by TILT, that lean turned by TURN on screen. */
const TILT = 34;
const TURN = -10;

/** Focal length of the projection, in px. Smaller is a stronger perspective. */
const FOCAL = 1000;
/** How far the rig turns to face the pointer, in degrees. Kept gentle so targets stay put. */
const YAW = 22;
const PITCH = 12;
/**
 * Scroll, across one pass of the section through the viewport: the plane swivels on
 * screen by SCROLL_TURN degrees and tips by ±SCROLL_TILT, and each ring winds through
 * SCROLL_WIND radians per unit of its own spin. Swivelling in the screen plane cannot
 * make rings cross, and the small tip keeps the gaps wider than a tile.
 */
const SCROLL_TURN = 50;
const SCROLL_TILT = 6;
const SCROLL_WIND = 28;
/**
 * Focus is by proximity: the tile nearest the pointer, within this many px of its
 * centre, is the one you are pointing at. A rival has to be this much closer to steal it.
 */
const FOCUS_RADIUS = 130;
const FOCUS_STICK = 24;
/** The focused tile drifts this share of the way to the pointer, up to LIFT_MAX px. */
const LIFT = 0.35;
const LIFT_MAX = 46;
const FOCUS_GROW = 2.1;
/** Spin while the pointer is over the gallery but nothing is focused, as a share of cruise. */
const CALM = 0.22;
/**
 * The rings are framed to their real on-screen extent every frame: centred in the stage,
 * and scaled down to keep this many px clear at the edges if they would not otherwise fit.
 * A leaned-back ring is lopsided (its near half is larger and lower), so the plain centre
 * of the stage is not where it looks centred.
 */
const FRAME_MARGIN = 36;

const deg = Math.PI / 180;

const SITE = 'https://tween-ui.vercel.app';
const poster = (kind: 'block' | 'component', name: string, title: string): GyroItem => ({
  title,
  kind: kind === 'block' ? 'Block' : 'Component',
  image: `${SITE}/media/${kind}s/${name}-poster.webp`,
  href: `${SITE}/${kind}/${name}`,
});

const DEFAULT_ITEMS: GyroItem[] = [
  poster('block', 'shutter-slider', 'Shutter Slider'),
  poster('component', 'sliding-tabs', 'Sliding Tabs'),
  poster('block', 'kinetic-type-ring', 'Kinetic Type Ring'),
  poster('block', 'cta-starfall', 'CTA Starfall'),
  poster('component', 'flip-card', 'Flip Card'),
  poster('block', 'tab-wipe', 'Tab Wipe'),
  poster('block', 'integration-hub', 'Integration Hub'),
  poster('component', 'logo-orbit', 'Logo Orbit'),
  poster('block', 'pricing-plan-switch', 'Pricing Plan Switch'),
  poster('block', 'cube-roll-item', 'Cube Roll Item'),
  poster('component', 'image-fan-slider', 'Image Fan Slider'),
  poster('block', 'grid-cascade', 'Grid Cascade'),
  poster('block', 'testimonial-reel-focus', 'Testimonial Reel Focus'),
  poster('component', 'wordmark-reveal', 'Wordmark Reveal'),
  poster('block', 'footer-wordmark-rise', 'Footer Wordmark Rise'),
  poster('block', 'loader-iris-ring', 'Loader Iris Ring'),
  poster('component', 'morphing-text', 'Morphing Text'),
  poster('block', 'testimonial-ring', 'Testimonial Ring'),
  poster('block', 'card-spotlight-grid', 'Card Spotlight Grid'),
  poster('block', 'column-drift', 'Column Drift'),
];

/** Which orbit each tile rides, and where on it it starts. */
const SLOTS = ORBITS.flatMap((orbit, ring) =>
  Array.from({ length: orbit.count }, (_, i) => ({
    ring,
    angle: (i / orbit.count) * Math.PI * 2 + ring * 0.7,
  }))
);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export default function GyroGallery({
  items = DEFAULT_ITEMS,
  title = 'The archive, in orbit.',
  description = 'Point near a piece to bring it forward, click to open it, drag to spin the rings.',
  className,
  ...props
}: GyroGalleryProps) {
  const count = items.length;
  const tiles = SLOTS.map((slot, i) => ({ ...slot, item: items[i % Math.max(1, count)] }));

  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const tetherRef = useRef<SVGLineElement>(null);
  const spokeRef = useRef<SVGSVGElement>(null);
  const titleId = useId();

  useGSAP(
    () => {
      const section = rootRef.current;
      const stage = stageRef.current;
      const core = coreRef.current;
      const label = labelRef.current;
      const tether = tetherRef.current;
      const spoke = spokeRef.current;
      if (!section || !stage || !core || !label || !tether || !spoke || !count) return;

      const tileEls = Array.from(stage.querySelectorAll<HTMLElement>('[data-gyro-tile]'));
      const reduce = prefersReducedMotion();

      let width = stage.clientWidth;
      let height = stage.clientHeight;
      const measure = () => {
        width = stage.clientWidth;
        height = stage.clientHeight;
      };

      // Everything the frame loop reads; the intro and the pointer only ever write here
      const rig = {
        spread: reduce ? 1 : 0, // 0 = every tile at the centre, 1 = out on its orbit
        lean: reduce ? 1 : 0, // 0 = orbits face-on, 1 = at their full gyroscope tilt
        yaw: 0,
        pitch: 0,
        phase: ORBITS.map(() => 0),
        scroll: 0, // -0.5 as the section enters below, 0 centred, 0.5 as it leaves above
        wind: 0, // how far scrolling has wound the rings: page scroll plus wheel turns
        nudge: 0, // a swivel from the wheel that springs back once it stops
      };
      let scrollTarget = 0;
      let wheelWind = 0;
      let nudgeTarget = 0;
      const pointer = { x: 0, y: 0, inside: false };
      const spots = tileEls.map(() => ({ x: 0, y: 0, scale: 1, z: 0 }));
      const lifts = tileEls.map(() => ({ x: 0, y: 0 }));
      const grow = tileEls.map(() => 1);
      let focus: number | null = null;
      const view = { dx: 0, dy: 0, fit: 1, framed: false };
      let dragging = false;
      let moved = false;

      /** Swap the focused tile: the label, the tether, the core and the cursor all follow. */
      const setFocus = (next: number | null) => {
        if (next === focus) return;
        focus = next;
        setActive(next);
        stage.style.cursor = next === null ? '' : tiles[next].item.href ? 'pointer' : 'default';
        gsap.to(core, { opacity: next === null ? 1 : 0.18, duration: reduce ? 0 : 0.35 });
        gsap.to(label, { autoAlpha: next === null ? 0 : 1, duration: reduce ? 0 : 0.25 });
        // The spoke and its hub only show while a piece is in focus
        gsap.to(spoke, { opacity: next === null ? 0 : 1, duration: reduce ? 0 : 0.2 });
        if (next !== null) {
          // The spoke draws itself out from the core to the piece
          gsap.fromTo(
            tether,
            { attr: { 'stroke-dashoffset': reduce ? 0 : 1 } },
            { attr: { 'stroke-dashoffset': 0 }, duration: reduce ? 0 : 0.45, ease: 'power3.out' }
          );
        }
      };

      const pickFocus = () => {
        if (!pointer.inside || moved || rig.spread < 0.9) return setFocus(null);
        let best: number | null = null;
        let bestDistance = Infinity;
        spots.forEach((spot, i) => {
          const distance = Math.hypot(pointer.x - spot.x, pointer.y - spot.y);
          if (distance < bestDistance) {
            best = i;
            bestDistance = distance;
          }
        });
        // Keep the current piece unless a rival is clearly closer, so focus never flickers
        if (focus !== null) {
          const held = Math.hypot(pointer.x - spots[focus].x, pointer.y - spots[focus].y);
          if (held < FOCUS_RADIUS + FOCUS_STICK && held < bestDistance + FOCUS_STICK) return;
        }
        setFocus(bestDistance < FOCUS_RADIUS ? best : null);
      };

      const place = () => {
        const size = Math.min(width, height);
        const yaw = rig.yaw * deg;
        const pitch = rig.pitch * deg;
        const [cy, sy, cp, sp] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)];

        // Where every tile sits on screen this frame, before any pointer effects
        tileEls.forEach((_, i) => {
          const { ring, angle } = tiles[i];
          const orbit = ORBITS[ring];
          const r = orbit.radius * size * rig.spread;
          // Scrolling winds every ring along its own direction, the middle one against the rest
          const theta = angle + rig.phase[ring] + rig.wind * orbit.spin * SCROLL_WIND;

          // On the orbit's own plane, then lean it back and turn the lean around the screen
          // ...and swivels the plane on screen, tipping it a little further as it passes
          const swivel = gsap.utils.clamp(-0.6, 0.6, rig.scroll + rig.nudge);
          const tilt = (TILT + swivel * 2 * SCROLL_TILT) * rig.lean * deg;
          const turn = (TURN + swivel * SCROLL_TURN) * rig.lean * deg;
          const ox = Math.cos(theta) * r;
          const oy = Math.sin(theta) * r * Math.cos(tilt);
          const oz = Math.sin(theta) * r * Math.sin(tilt);
          let x = ox * Math.cos(turn) - oy * Math.sin(turn);
          let y = ox * Math.sin(turn) + oy * Math.cos(turn);
          let z = oz;

          // The whole rig turns to face the pointer
          [x, z] = [x * cy + z * sy, -x * sy + z * cy];
          [y, z] = [y * cp - z * sp, y * sp + z * cp];

          const scale = FOCAL / (FOCAL - z);
          Object.assign(spots[i], { x: x * scale, y: y * scale, scale, z });
        });

        // Frame the rings to their real extent: centre them, and fit them if they are too big
        const tileW = tileEls[0]?.offsetWidth ?? 0;
        const tileH = tileEls[0]?.offsetHeight ?? 0;
        let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
        spots.forEach((spot) => {
          minX = Math.min(minX, spot.x - (tileW * spot.scale) / 2);
          maxX = Math.max(maxX, spot.x + (tileW * spot.scale) / 2);
          minY = Math.min(minY, spot.y - (tileH * spot.scale) / 2);
          maxY = Math.max(maxY, spot.y + (tileH * spot.scale) / 2);
        });
        const roomX = (width - FRAME_MARGIN * 2) / Math.max(1, maxX - minX);
        const roomY = (height - FRAME_MARGIN * 2) / Math.max(1, maxY - minY);
        const settle = reduce || !view.framed ? 1 : 0.08;
        view.framed = width > 0;
        view.dx += (-(minX + maxX) / 2 - view.dx) * settle;
        view.dy += (-(minY + maxY) / 2 - view.dy) * settle;
        view.fit += (Math.min(1, roomX, roomY) - view.fit) * settle;
        spots.forEach((spot) => {
          spot.x = (spot.x + view.dx) * view.fit;
          spot.y = (spot.y + view.dy) * view.fit;
          spot.scale *= view.fit;
        });
        const shift = `translate(${view.dx * view.fit}px, ${view.dy * view.fit}px)`;
        core.style.transform = shift;
        spoke.style.transform = shift;

        pickFocus();

        tileEls.forEach((tile, i) => {
          const spot = spots[i];
          const isFocus = focus === i;

          // The focused piece drifts out to meet the pointer
          const lift = lifts[i];
          let tx = 0;
          let ty = 0;
          if (isFocus) {
            const dx = pointer.x - spot.x;
            const dy = pointer.y - spot.y;
            const reach = Math.min(Math.hypot(dx, dy) * LIFT, LIFT_MAX);
            const length = Math.hypot(dx, dy) || 1;
            tx = (dx / length) * reach;
            ty = (dy / length) * reach;
          }
          const follow = reduce ? 1 : 0.16;
          lift.x += (tx - lift.x) * follow;
          lift.y += (ty - lift.y) * follow;
          grow[i] += ((isFocus ? FOCUS_GROW : 1) - grow[i]) * follow;

          const x = spot.x + lift.x;
          const y = spot.y + lift.y;
          const depth = clamp01((spot.z + Math.min(width, height) * 0.5) / Math.min(width, height));
          const soften = focus !== null && !isFocus ? 0.45 : 1;

          tile.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${spot.scale * grow[i]})`;
          tile.style.opacity = String(
            isFocus ? 1 : (0.35 + 0.65 * depth) * soften * clamp01(rig.spread * 4)
          );
          tile.style.zIndex = String(isFocus ? 5000 : 1000 + Math.round(spot.z));
          tile.toggleAttribute('data-focused', isFocus);

          if (isFocus) {
            // The label rides beside the piece, on the side facing the middle of the stage
            const half = (tile.offsetWidth * spot.scale * grow[i]) / 2;
            const toLeft = x > 0;
            label.style.transform = `translate(${x + (toLeft ? -half - 16 : half + 16)}px, ${y}px) translate(${toLeft ? '-100%' : '0'}, -50%)`;
            // The spoke's svg moves with the core, so its end is measured from there
            tether.setAttribute('x2', String(x - view.dx * view.fit));
            tether.setAttribute('y2', String(y - view.dy * view.fit));
          }
        });
      };

      const observer = new ResizeObserver(() => {
        measure();
        place();
      });
      observer.observe(stage);
      measure();
      place();

      // Pointer: where it is, how far a drag has thrown the spin, and whether a tap is a first tap
      let throwSpin = 0;
      let dragX = 0;
      let speed = 1;
      let tapFocused = false;

      const track = (event: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        pointer.x = event.clientX - box.left - box.width / 2;
        pointer.y = event.clientY - box.top - box.height / 2;
        pointer.inside = true;
      };
      const onMove = (event: PointerEvent) => {
        track(event);
        if (dragging) {
          const dx = event.clientX - dragX;
          dragX = event.clientX;
          if (Math.abs(dx) > 1) moved = true;
          throwSpin = gsap.utils.clamp(-14, 14, throwSpin + dx * 0.06);
        }
        if (reduce) place();
      };
      const onLeave = (event: PointerEvent) => {
        // A finger leaves the moment it lifts; keep its focus for the second tap
        if (event.pointerType !== 'mouse') return;
        pointer.inside = false;
        if (reduce) place();
      };
      const onDown = (event: PointerEvent) => {
        track(event);
        const before = focus;
        place();
        tapFocused = event.pointerType !== 'mouse' && focus !== before;
        dragging = !reduce;
        moved = false;
        dragX = event.clientX;
        if (dragging) stage.setPointerCapture?.(event.pointerId);
      };
      const onUp = (event: PointerEvent) => {
        dragging = false;
        stage.releasePointerCapture?.(event.pointerId);
      };
      // A click opens the focused piece wherever it lands, except at the end of a drag or
      // on the first tap of a finger, which only brings the piece forward
      const onClick = (event: MouseEvent) => {
        const href = focus === null ? undefined : tiles[focus].item.href;
        if (moved || tapFocused || !href) {
          if (moved || tapFocused) event.preventDefault();
          moved = false;
          tapFocused = false;
          return;
        }
        if ((event.target as Element).closest('[data-focused]')) return;
        event.preventDefault();
        if (event.metaKey || event.ctrlKey) window.open(href, '_blank', 'noopener');
        else window.location.assign(href);
      };

      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);
      stage.addEventListener('click', onClick, true);
      const cleanupPointer = () => {
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointercancel', onUp);
        stage.removeEventListener('click', onClick, true);
        stage.style.cursor = '';
      };

      if (reduce) {
        return () => {
          observer.disconnect();
          cleanupPointer();
        };
      }

      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 64) / 1000;

        // The rig turns to face the pointer, but holds still while a piece is in focus,
        // so the piece you are reaching for does not slide away under the cursor
        if (focus === null) {
          const nx = pointer.inside ? gsap.utils.clamp(-1, 1, pointer.x / (width / 2)) : 0;
          const ny = pointer.inside ? gsap.utils.clamp(-1, 1, pointer.y / (height / 2)) : 0;
          const ease = Math.min(1, dt * 2.4);
          rig.yaw += (nx * YAW - rig.yaw) * ease;
          rig.pitch += (-ny * PITCH - rig.pitch) * ease;
        }

        // Spin: calm while the pointer is over the gallery, still while a piece is in focus,
        // thrown by a drag and wound back down afterwards
        const base = dragging ? 1 : focus !== null ? 0 : pointer.inside ? CALM : 1;
        const target = base + throwSpin;
        speed += (target - speed) * Math.min(1, dt * (focus !== null ? 6 : 2.4));
        if (!dragging) throwSpin *= Math.pow(0.18, dt);
        ORBITS.forEach((orbit, ring) => {
          rig.phase[ring] += orbit.spin * speed * dt;
        });

        // Scroll is followed with a little lag, so a flick of the wheel still reads as a turn;
        // the wheel's own swivel springs back to rest once the wheel goes quiet
        const follow = Math.min(1, dt * 4);
        rig.scroll += (scrollTarget - rig.scroll) * follow;
        rig.wind += (scrollTarget + wheelWind - rig.wind) * follow;
        nudgeTarget *= Math.pow(0.06, dt);
        rig.nudge += (nudgeTarget - rig.nudge) * Math.min(1, dt * 6);

        place();
      };

      let ticking = false;
      const setTicking = (on: boolean) => {
        if (on === ticking) return;
        ticking = on;
        if (on) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      };

      // The intro: tiles spiral out of the centre, then the orbits tip back into a gyroscope
      const intro = gsap
        .timeline({ paused: true })
        .to(rig, { spread: 1, duration: 1.8, ease: 'expo.out' }, 0)
        .to(rig.phase, { 0: '+=1.4', 1: '-=1.1', 2: '+=0.8', duration: 1.8, ease: 'expo.out' }, 0)
        .to(rig, { lean: 1, duration: 1.6, ease: 'power3.inOut' }, 0.5);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => intro.play(),
        onEnterBack: () => intro.play(),
        onToggle: (self) => setTicking(self.isActive),
        // Scroll position scrubs the rig; scroll speed flings the rings like a drag would
        onUpdate: (self) => {
          scrollTarget = self.progress - 0.5;
          throwSpin = gsap.utils.clamp(-6, 6, throwSpin + self.getVelocity() * 0.0012);
        },
      });
      rig.scroll = rig.wind = scrollTarget = trigger.progress - 0.5;
      if (trigger.isActive) {
        intro.play();
        setTicking(true);
      }

      // The wheel (or a vertical swipe) over the gallery also drives it, for pages where
      // the gallery fills the window and there is nothing to scroll. It is only counted
      // when the page did not move, so a page that does scroll is never driven twice.
      const scrollIntent = (delta: number) => {
        const before = window.scrollY;
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - before) > 0.5) return;
          wheelWind += delta * 0.0012;
          nudgeTarget = gsap.utils.clamp(-0.45, 0.45, nudgeTarget + delta * 0.0016);
          throwSpin = gsap.utils.clamp(-6, 6, throwSpin + delta * 0.012);
        });
      };
      const onWheel = (event: WheelEvent) => {
        const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
        scrollIntent(event.deltaY * scale);
      };
      let touchY: number | null = null;
      const onTouchStart = (event: TouchEvent) => {
        touchY = event.touches[0]?.clientY ?? null;
      };
      const onTouchMove = (event: TouchEvent) => {
        const y = event.touches[0]?.clientY;
        if (touchY === null || y === undefined) return;
        scrollIntent(touchY - y);
        touchY = y;
      };
      section.addEventListener('wheel', onWheel, { passive: true });
      section.addEventListener('touchstart', onTouchStart, { passive: true });
      section.addEventListener('touchmove', onTouchMove, { passive: true });

      return () => {
        setTicking(false);
        intro.kill();
        trigger.kill();
        observer.disconnect();
        cleanupPointer();
        section.removeEventListener('wheel', onWheel);
        section.removeEventListener('touchstart', onTouchStart);
        section.removeEventListener('touchmove', onTouchMove);
      };
    },
    { scope: rootRef, dependencies: [items] }
  );

  const shown = active === null ? null : tiles[active]?.item;

  return (
    <section
      ref={rootRef}
      aria-labelledby={titleId}
      className={cn(
        'relative isolate h-full min-h-[640px] w-full overflow-hidden bg-[#03110f] text-[#e8f3f2] max-sm:min-h-[560px]',
        '@container [--tile:clamp(3.25rem,6.5cqw,5.5rem)]',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[min(80cqw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(4_95_100/0.4),rgb(4_95_100/0.1)_55%,rgb(4_95_100/0)_100%)]"
      />

      {/* The core: the size of the archive, stepping back while a piece is in focus */}
      <div
        ref={coreRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-1 text-center"
      >
        <span className="text-[clamp(2rem,5cqw,3.5rem)] leading-none font-semibold tracking-[-0.04em] text-[#e8f3f2] tabular-nums">
          {count}
        </span>
        <span className="text-xs tracking-[0.14em] text-[#9fd4d6]/70 uppercase">
          pieces in orbit
        </span>
      </div>

      {/* The spoke from the core to the piece in focus */}
      <svg
        ref={spokeRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-[1] size-px overflow-visible opacity-0"
      >
        <line
          ref={tetherRef}
          x1="0"
          y1="0"
          x2="0"
          y2="0"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          stroke="#c6f56f"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle r="3" fill="#c6f56f" />
      </svg>

      <div
        ref={stageRef}
        aria-hidden="true"
        className="absolute inset-0 z-[2] cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        {tiles.map(({ item }, i) => {
          const Tile = item.href ? 'a' : 'div';
          return (
            <Tile
              key={`${item.title}-${i}`}
              data-gyro-tile=""
              {...(item.href ? { href: item.href, tabIndex: -1 } : {})}
              draggable={false}
              className="group/tile absolute top-1/2 left-1/2 block w-(--tile) opacity-0 will-change-transform"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[5px] border border-[#9fd4d6]/16 bg-[#071d1b] shadow-[0_18px_40px_-16px_rgb(0_0_0/0.75)] transition-[border-color,box-shadow] duration-300 group-data-focused/tile:border-[#c6f56f] group-data-focused/tile:shadow-[0_0_0_1px_#c6f56f,0_24px_60px_-18px_rgb(198_245_111/0.35)] motion-reduce:transition-none">
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
            </Tile>
          );
        })}

        {/* The label rides beside the piece in focus */}
        <div
          ref={labelRef}
          className="pointer-events-none invisible absolute top-1/2 left-1/2 z-[6000] w-max max-w-[16rem] rounded-lg border border-[#c6f56f]/30 bg-[#071d1b]/95 px-3.5 py-2.5 opacity-0 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.8)] backdrop-blur-sm"
        >
          {shown && (
            <>
              <span className="block text-[15px] leading-tight font-semibold tracking-tight text-[#e8f3f2]">
                {shown.title}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[11px] tracking-[0.12em] text-[#9fd4d6]/70 uppercase">
                {shown.kind}
                {shown.href && <span className="text-[#c6f56f]">Click to open</span>}
              </span>
            </>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {shown ? `${shown.title}${shown.kind ? `, ${shown.kind}` : ''}` : ''}
      </p>

      <div className="pointer-events-none absolute bottom-0 left-0 z-[3] grid max-w-[26rem] gap-2 px-5 pb-6 sm:px-8 sm:pb-8">
        <h2
          id={titleId}
          className="text-[clamp(1.5rem,3cqw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-[#e8f3f2]"
        >
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-balance text-[#9fd4d6]/75">{description}</p>
      </div>

      {/* The rig is decoration; the archive itself, for keyboards and screen readers */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.title}>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</li>
        ))}
      </ul>
    </section>
  );
}
