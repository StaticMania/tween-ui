'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Letter colour at the front of the ring and at the back, lerped by depth. */
const FRONT: [number, number, number] = [239, 235, 227];
const BACK: [number, number, number] = [58, 58, 58];

const DEFAULT_TEXT = 'KINETIC TYPE · 3D · SOUND · LOOPS · SPRINGS · EASING · ';

/** Perspective distance as a multiple of the ring radius. */
const DEPTH = 2.5;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const shade = (t: number) =>
  `rgb(${lerp(BACK[0], FRONT[0], t) | 0},${lerp(BACK[1], FRONT[1], t) | 0},${lerp(BACK[2], FRONT[2], t) | 0})`;

interface Char {
  el: HTMLSpanElement;
  glyph: HTMLSpanElement;
  /** Position around the ring, in degrees. */
  angle: number;
  width: number;
}

export interface KineticTypeRingProps extends ComponentPropsWithoutRef<'section'> {
  /**
   * The phrase wrapped around the ring. It is repeated verbatim, so end it with
   * the same separator it uses inside — otherwise the loop reads with a seam.
   */
  text?: string;
  /** Idle spin in degrees per second. The front of the text flows leftwards. */
  speed?: number;
  /** Resting camera tilt in degrees. Negative looks down on the ring. */
  tilt?: number;
}

export default function KineticTypeRing({
  text = DEFAULT_TEXT,
  speed = 14,
  tilt = -16,
  className,
  ...props
}: KineticTypeRingProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const scene = sceneRef.current;
      const spin = spinRef.current;
      const tiltEl = tiltRef.current;
      const dotWrap = dotWrapRef.current;
      const dot = dotRef.current;
      if (!stage || !scene || !spin || !tiltEl || !dotWrap || !dot) return;

      const reduced = prefersReducedMotion();

      const state = {
        rotation: 0,
        /** Negative so the text facing us flows leftwards. */
        baseSpeed: -Math.abs(speed),
        /** Extra velocity from a drag or a wheel, eased back to zero each frame. */
        boost: 0,
        tilt,
        radius: 0,
      };

      // One span per character: `layout` owns the outer span's transform, which
      // puts it on the ring, and GSAP owns the inner glyph's. Nothing writes to
      // both, so a re-solve mid-intro cannot wipe a tween and vice versa.
      spin.replaceChildren();
      const chars: Char[] = [...text].map((character) => {
        const el = document.createElement('span');
        el.className =
          'absolute top-0 left-0 leading-none font-extrabold tracking-tight whitespace-pre transform-3d will-change-[transform,color] motion-reduce:will-change-auto';
        const glyph = document.createElement('span');
        glyph.className =
          'inline-block will-change-[transform,opacity,filter] motion-reduce:will-change-auto';
        glyph.textContent = character;
        el.appendChild(glyph);
        spin.appendChild(el);
        return { el, glyph, angle: 0, width: 0 };
      });

      /**
       * How far the ring reaches on screen, per unit of radius. Points at the
       * side sit at z = 0 and are not magnified; the ones between the side and
       * the front are, so the widest part of the silhouette is a little past
       * the radius. The tallest part is the front of the ring, lifted by the
       * tilt and magnified most of all.
       */
      const tiltRad = (Math.abs(tilt) * Math.PI) / 180;
      const spread = 1.12;
      const rise =
        Math.sin(tiltRad) * (DEPTH / (DEPTH - Math.cos(tiltRad))) + 0.08 * (DEPTH / (DEPTH - 1));

      /**
       * Solve the type size so the phrase wraps the ring exactly once and the
       * whole ring fits the stage, then give each glyph an arc proportional to
       * its real width — so "I" and "W" sit evenly rather than on a fixed grid.
       */
      const layout = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (!w || !h) return false;

        chars.forEach((c) => (c.el.style.fontSize = '100px'));
        const unitWidth = chars.reduce((sum, c) => sum + c.el.offsetWidth, 0) / 100;
        // jsdom and a stage that is not displayed both measure zero.
        if (!unitWidth) return false;

        // The type scales with the ring, so the cap height does too.
        const fontPerRadius = (2 * Math.PI) / unitWidth;
        const halfHeight = rise + 0.62 * fontPerRadius * (DEPTH / (DEPTH - 1));

        // 0.97 leaves a little air between the ring and the edge of the stage.
        const targetR = Math.min((w * 0.97) / (2 * spread), (h * 0.97) / (2 * halfHeight), 720);

        let total = 0;
        chars.forEach((c) => {
          c.el.style.fontSize = `${targetR * fontPerRadius}px`;
          c.width = c.el.offsetWidth;
          total += c.width;
        });
        if (!total) return false;

        // Re-derive from the measured widths so the loop closes exactly.
        const radius = total / (2 * Math.PI);
        state.radius = radius;

        let acc = 0;
        chars.forEach((c) => {
          c.angle = ((acc + c.width / 2) / total) * 360;
          acc += c.width;
          place(c);
        });

        scene.style.perspective = `${radius * DEPTH}px`;
        const dotSize = Math.max(20, Math.min(radius * 0.16, 96));
        dot.style.width = `${dotSize}px`;
        dot.style.height = `${dotSize}px`;
        return true;
      };

      /**
       * Put a letter on the ring. `rotateY` has to come before `translateZ` so
       * the letter travels out along its own axis rather than the stage's —
       * which is why this is a string rather than a GSAP transform.
       */
      const place = (c: Char) => {
        c.el.style.transform = `translate(-50%, -50%) rotateY(${c.angle}deg) translateZ(${state.radius}px)`;
      };

      /** Paint every glyph by how far round the ring it currently sits. */
      const paint = () => {
        const rad = Math.PI / 180;
        for (const c of chars) {
          const depth = (Math.cos((c.angle + state.rotation) * rad) + 1) / 2;
          c.el.style.color = shade(Math.pow(depth, 1.6));
        }
      };

      const applyTransforms = () => {
        spin.style.transform = `rotateY(${state.rotation}deg)`;
        tiltEl.style.transform = `rotateX(${state.tilt}deg)`;
        // Counter-tilted so the dot keeps facing the camera.
        dotWrap.style.transform = `rotateX(${-state.tilt}deg)`;
      };

      /**
       * The dot reads the ring's momentum. Scrolling, dragging or arrowing adds
       * boost, and the dot swells or shrinks with it — a scroll forward grows
       * it, a scroll back shrinks it — easing home to its resting size as the
       * boost decays.
       */
      const swell = () => {
        if (!settled) return;
        const push = gsap.utils.clamp(-1, 1, state.boost / 700);
        gsap.set(dot, { scale: 1 - push * 0.35 });
      };

      const render = (_time: number, delta: number) => {
        const sec = delta / 1000;
        state.boost *= Math.pow(0.04, sec);
        state.rotation += (state.baseSpeed + state.boost) * sec;
        applyTransforms();
        paint();
        swell();
      };

      const kick = (amount: number) => {
        state.boost = gsap.utils.clamp(-900, 900, state.boost + amount);
      };

      let intro: gsap.core.Timeline | null = null;
      /** The dot only starts responding once it has landed and stopped squashing. */
      let settled = false;
      let tiltTo: ((value: number) => void) | null = null;
      let running = false;

      /**
       * The ring cannot be built until the stage has a box to measure, and the
       * first paint often beats that. So nothing starts until a layout lands —
       * whether that is now or on the first callback from the observer below.
       */
      const begin = () => {
        if (running || !layout()) return;
        running = true;
        paint();
        gsap.ticker.add(render);

        const fall = 0.9;
        /** Where the ring will have turned to by the time the dot lands. */
        const restRotation = state.baseSpeed * fall;
        /** 0 for the letter facing the camera on impact, 1 for the far side. */
        const wave = (angle: number) =>
          Math.abs(((((angle + restRotation) % 360) + 540) % 360) - 180) / 180;
        // Blur is a length, so it has to scale with the type or it reads as a
        // smudge on a phone and a whisper on a hero.
        const haze = gsap.utils.clamp(6, 26, state.radius * 0.045);

        gsap.set(dot, { xPercent: -50, yPercent: -50, transformOrigin: '50% 100%' });

        intro = gsap.timeline();
        intro
          // The dot falls in, stretching as it picks up speed.
          .fromTo(
            dot,
            { y: -(stage.clientHeight / 2 + dot.offsetHeight * 2), scaleX: 0.75, scaleY: 1.35 },
            { y: 0, duration: fall, ease: 'power3.in' },
            0
          )
          // Squash on impact, then spring back round.
          .to(dot, { scaleX: 1.4, scaleY: 0.6, duration: 0.1, ease: 'power2.out' }, fall)
          .to(
            dot,
            { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.1, 0.3)' },
            fall + 0.1
          )
          .set(dot, { transformOrigin: '50% 50%' })
          // The letters start as soft, oversized blurs. The impact pulls them
          // into focus, the sweep rolling round from the one nearest the
          // camera to the far side of the ring.
          .from(
            chars.map((c) => c.glyph),
            {
              opacity: 0,
              filter: `blur(${haze}px)`,
              scale: 1.3,
              duration: 1.2,
              ease: 'power2.out',
              stagger: (i: number) => wave(chars[i].angle) * 0.5,
              // A filter left at 0 still costs a compositing layer per letter.
              clearProps: 'filter',
            },
            fall
          )
          // The camera settles while the ring takes a kick that decays into the idle spin.
          .from(state, { tilt: tilt - 26, duration: 2.2, ease: 'power3.out' }, fall)
          .call(() => (state.boost = -380), undefined, fall)
          // Created on completion so it cannot overwrite the intro's tilt tween.
          .eventCallback('onComplete', () => {
            settled = true;
            tiltTo = gsap.quickTo(state, 'tilt', { duration: 1.2, ease: 'power3.out' });
          });
      };

      applyTransforms();

      // Re-solves on any box change, so the ring fits a resized window, a
      // drawer opening beside it or a container that grows with its content.
      const observer = new ResizeObserver(() => {
        if (reduced || running) {
          if (layout()) paint();
          return;
        }
        begin();
      });
      observer.observe(stage);

      // Finished state: the ring is laid out and shaded, nothing moves.
      if (reduced) {
        gsap.set(dot, { xPercent: -50, yPercent: -50 });
        if (layout()) paint();
        return () => {
          observer.disconnect();
          spin.replaceChildren();
        };
      }

      begin();

      let dragging = false;
      let lastX = 0;

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        stage.setPointerCapture(event.pointerId);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (dragging) {
          kick((event.clientX - lastX) * 6);
          lastX = event.clientX;
        }
        const { top, height } = stage.getBoundingClientRect();
        tiltTo?.(tilt - ((event.clientY - top) / height - 0.5) * 22);
      };
      const endDrag = () => (dragging = false);
      const onWheel = (event: WheelEvent) => kick(-event.deltaY * 0.8);
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') kick(220);
        else if (event.key === 'ArrowRight') kick(-220);
        else return;
        event.preventDefault();
      };

      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', endDrag);
      stage.addEventListener('pointercancel', endDrag);
      stage.addEventListener('wheel', onWheel, { passive: true });
      stage.addEventListener('keydown', onKeyDown);

      return () => {
        observer.disconnect();
        gsap.ticker.remove(render);
        intro?.kill();
        stage.removeEventListener('pointerdown', onPointerDown);
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerup', endDrag);
        stage.removeEventListener('pointercancel', endDrag);
        stage.removeEventListener('wheel', onWheel);
        stage.removeEventListener('keydown', onKeyDown);
        spin.replaceChildren();
      };
    },
    { scope: stageRef, dependencies: [text, speed, tilt] }
  );

  return (
    <section
      data-kinetic-type-ring
      className={cn(
        'relative h-full w-full overflow-hidden bg-[#141414] text-[#efebe3]',
        className
      )}
      {...props}
    >
      {/* The ring is decoration built from one span per letter; this is the text itself. */}
      <p className="sr-only">{text}</p>

      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Kinetic type ring. Drag, scroll, or use the left and right arrow keys to spin it."
        className="relative aspect-[16/9] h-full max-h-svh min-h-[280px] w-full cursor-grab touch-pan-y select-none focus-visible:ring-2 focus-visible:ring-[#c6f56f] focus-visible:outline-none focus-visible:ring-inset active:cursor-grabbing"
      >
        <div
          ref={sceneRef}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div ref={tiltRef} className="relative h-0 w-0 transform-3d">
            <div ref={spinRef} className="relative h-0 w-0 transform-3d" />
            <div ref={dotWrapRef} className="absolute top-0 left-0 transform-3d">
              <div ref={dotRef} className="absolute size-14 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
