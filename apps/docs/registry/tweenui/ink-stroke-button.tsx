'use client';

import { useRef, useState, type ComponentPropsWithRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

type Rgb = [number, number, number];
const TEAL: Rgb = [4 / 255, 95 / 255, 100 / 255];
const LIME: Rgb = [198 / 255, 245 / 255, 111 / 255];

// Brush: the ink that trails the cursor.
const RADIUS = 0.52; // dab size, in button heights
const FOLLOW = 0.08; // seconds the brush lags the pointer; the lag is the glide
const INK_PER_PX = 0.06; // ink per pixel moved, so circling builds up more
const INK_MAX = 1.6;
const INK_FADE = 1.6; // ink lost per second
const PUSH = 0.15; // share of the pointer's speed handed to the fluid
const FLOW_FADE = 2.5; // motion lost per second

// Pool: the ink that floods in when the cursor crosses an edge.
const POOL_X = 0.28; // from a side: reach in, in widths
const POOL_Y = 1; // from a side: height, in heights; 1 fills top to bottom
const POOL_SPAN = 0.22; // from top or bottom: half its width, in widths
const POOL_DEPTH = 0.8; // from top or bottom: reach in, in heights
const POOL_INK = 1.6;
const POOL_FADE = 2.4; // lost per second, apart from the brush's ink
const POOL_GROW = 0.88; // seconds to spread in
const POOL_GAP = 0.35; // shortest time between two pools

// Solver.
const CELL = 3; // simulation cell size, in CSS pixels
const PRESSURE_STEPS = 12;
const PRESSURE_KEEP = 0.8; // last frame's pressure, reused as a head start
const IDLE_AFTER = 3.5; // seconds without new ink before the loop sleeps

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const head = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
`;

// Adds a soft dab. Ink has two layers: x is the brush, which builds up to a
// cap, and y the pools, which keep the highest dab so their edge stays soft.
const SPLAT = `${head}
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec2 uValue;
uniform float uRadius;
uniform float uAspect;
uniform float uShape;
uniform float uMax;
uniform float uInk;
void main() {
  vec2 d = vUv - uPoint;
  d.x *= uAspect;
  float dab = exp(-pow(dot(d, d) / uRadius, uShape));
  vec4 base = texture(uTarget, vUv);
  outColor = uInk > 0.5
    ? vec4(min(base.x + dab * uValue.x, uMax), max(base.y, dab * uValue.y), 0.0, 1.0)
    : vec4(base.xy + dab * uValue, 0.0, 1.0);
}`;

// Moves a field along the velocity and fades it: ink by a fixed amount a
// second, motion in proportion.
const ADVECT = `${head}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uCell;
uniform float uDt;
uniform vec4 uFade;
uniform float uInk;
void main() {
  vec2 from = vUv - uDt * texture(uVelocity, vUv).xy * uCell;
  vec4 value = texture(uSource, from);
  // Nothing flows in from outside, so teal washes back in behind the ink.
  vec2 edge = min(from, 1.0 - from) / (uCell * 0.75);
  vec4 carried = value * clamp(min(edge.x, edge.y), 0.0, 1.0);
  if (uInk > 0.5) {
    carried.y = value.y; // pools sit against the edge, so they keep it
    outColor = max(carried - uFade * uDt, 0.0);
  } else {
    outColor = carried / (1.0 + uFade * uDt);
  }
}`;

// The cell to the left, right, below and above, for the three passes below.
const neighbours = `${head}
uniform vec2 uCell;
vec4 L(sampler2D s) { return texture(s, vUv - vec2(uCell.x, 0.0)); }
vec4 R(sampler2D s) { return texture(s, vUv + vec2(uCell.x, 0.0)); }
vec4 B(sampler2D s) { return texture(s, vUv - vec2(0.0, uCell.y)); }
vec4 T(sampler2D s) { return texture(s, vUv + vec2(0.0, uCell.y)); }
`;

const DIVERGENCE = `${neighbours}
uniform sampler2D uVelocity;
void main() {
  float div = R(uVelocity).x - L(uVelocity).x + T(uVelocity).y - B(uVelocity).y;
  outColor = vec4(0.5 * div, 0.0, 0.0, 1.0);
}`;

// One relaxation pass. uKeep scales the neighbours: PRESSURE_KEEP on the first
// pass, so it starts from most of last frame's pressure, then 1.
const PRESSURE = `${neighbours}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform float uKeep;
void main() {
  float sum = L(uPressure).x + R(uPressure).x + B(uPressure).x + T(uPressure).x;
  outColor = vec4((sum * uKeep - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${neighbours}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  vec2 grad = vec2(R(uPressure).x - L(uPressure).x, T(uPressure).x - B(uPressure).x);
  outColor = vec4(texture(uVelocity, vUv).xy - 0.5 * grad, 0.0, 1.0);
}`;

// Shows the ink as a soft threshold, so the lime has an edge, and flips the
// label's colours under it.
const DISPLAY = `${head}
uniform sampler2D uInk;
uniform sampler2D uLabel;
uniform vec3 uBase;
uniform vec3 uFill;
void main() {
  vec2 ink = texture(uInk, vUv).xy;
  float k = smoothstep(0.3, 0.72, ink.x + ink.y);
  vec3 surface = mix(uBase, uFill, k);
  vec3 text = mix(uFill, uBase, k);
  outColor = vec4(mix(surface, text, texture(uLabel, vUv).a), 1.0);
}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Where a move from a (outside) to b (inside) crossed into a w×h box, and
// whether it came in through a side rather than the top or bottom.
const entryPoint = (ax: number, ay: number, bx: number, by: number, w: number, h: number) => {
  const tx = ax < 0 ? -ax / (bx - ax) : ax > w ? (ax - w) / (ax - bx) : -1;
  const ty = ay < 0 ? -ay / (by - ay) : ay > h ? (ay - h) / (ay - by) : -1;
  const t = Math.max(tx, ty);
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, side: tx >= ty };
};

const isFocusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

type Gl = WebGL2RenderingContext;
type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Pair = { read: Target; write: Target; swap: () => void };
type Program = { use: () => void; set: Record<string, WebGLUniformLocation | null> };

const program = (gl: Gl, fragment: string): Program | null => {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(prog, shader);
    gl.deleteShader(shader); // freed with the program
  }
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  const set: Program['set'] = {};
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i += 1) {
    const name = gl.getActiveUniform(prog, i)?.name;
    if (name) set[name] = gl.getUniformLocation(prog, name);
  }
  return { use: () => gl.useProgram(prog), set };
};

const free = (gl: Gl, ...items: (Target | Pair | null)[]) => {
  for (const item of items) {
    if (!item) continue;
    for (const t of 'read' in item ? [item.read, item.write] : [item]) {
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
    }
  }
};

// A half-float texture to draw into. Null if the device can't render to one.
const target = (gl: Gl, w: number, h: number): Target | null => {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const t = { tex, fbo, w, h };
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    free(gl, t);
    return null;
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return t;
};

// Two targets to read from one while writing the other, then swap.
const pair = (gl: Gl, w: number, h: number): Pair | null => {
  const a = target(gl, w, h);
  const b = target(gl, w, h);
  if (!a || !b) {
    free(gl, a, b);
    return null;
  }
  const p: Pair = {
    read: a,
    write: b,
    swap: () => {
      [p.read, p.write] = [p.write, p.read];
    },
  };
  return p;
};

type Stroke = { x: number; y: number; vx: number; vy: number; moved: number };

type Renderer = {
  /** Fits the canvas to the button. False if the device can't run it. */
  resize: () => boolean;
  step: (dt: number, stroke: Stroke | null) => void;
  /** A pool at (x, y) reaching rx widths across and ry heights up and down. */
  pool: (x: number, y: number, rx: number, ry: number, size: number) => void;
  dispose: () => void;
};

// A small stable-fluids solver. The pointer pushes motion and drops ink, a few
// pressure passes keep the motion swirling rather than piling up, and both are
// carried along and fade.
const createRenderer = (
  canvas: HTMLCanvasElement,
  button: HTMLElement,
  label: HTMLElement
): Renderer | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    // A button never needs the discrete GPU; don't wake it on dual-GPU laptops.
    powerPreference: 'low-power',
  });
  if (!gl) return null;
  gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('EXT_color_buffer_half_float');
  const dispose = () => gl.getExtension('WEBGL_lose_context')?.loseContext();

  const sources = [SPLAT, ADVECT, DIVERGENCE, PRESSURE, GRADIENT, DISPLAY];
  const programs = sources.map((source) => program(gl, source));
  if (programs.some((p) => !p)) {
    dispose();
    return null;
  }
  const [splatP, advectP, divergenceP, pressureP, gradientP, displayP] = programs as Program[];

  // One quad covering the target; every pass draws it.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const labelTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, labelTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const text = document.createElement('canvas');

  let velocity: Pair | null = null;
  let pressure: Pair | null = null;
  let divergence: Target | null = null;
  let ink: Pair | null = null;
  // Button size in CSS pixels, and canvas size in device pixels.
  let cssW = 1;
  let cssH = 1;
  let width = 1;
  let height = 1;
  let dpr = 1;

  const draw = (to: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to ? to.fbo : null);
    gl.viewport(0, 0, to ? to.w : width, to ? to.h : height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const bind = (unit: number, tex: WebGLTexture | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    return unit;
  };

  // Adds a dab to a field at (x, y) in button pixels. The radius is in button
  // heights; aspect stretches it across.
  const splat = (
    field: Pair,
    x: number,
    y: number,
    value: [number, number],
    {
      radius,
      aspect,
      shape,
      isInk,
    }: { radius: number; aspect: number; shape: number; isInk: boolean }
  ) => {
    splatP.use();
    gl.uniform1i(splatP.set.uTarget, bind(0, field.read.tex));
    gl.uniform2f(splatP.set.uPoint, x / cssW, 1 - y / cssH);
    gl.uniform2f(splatP.set.uValue, ...value);
    gl.uniform1f(splatP.set.uRadius, radius * radius);
    gl.uniform1f(splatP.set.uAspect, aspect);
    gl.uniform1f(splatP.set.uShape, shape);
    gl.uniform1f(splatP.set.uMax, INK_MAX);
    gl.uniform1f(splatP.set.uInk, isInk ? 1 : 0);
    draw(field.write);
    field.swap();
  };

  const advect = (field: Pair, cell: readonly [number, number], dt: number, fade: Rgb) => {
    if (!velocity) return;
    const isInk = field === ink;
    advectP.use();
    gl.uniform1i(advectP.set.uVelocity, bind(0, velocity.read.tex));
    gl.uniform1i(advectP.set.uSource, bind(1, field.read.tex));
    gl.uniform2f(advectP.set.uCell, ...cell);
    gl.uniform1f(advectP.set.uDt, dt);
    gl.uniform4f(advectP.set.uFade, ...fade, 0);
    gl.uniform1f(advectP.set.uInk, isInk ? 1 : 0);
    draw(field.write);
    field.swap();
  };

  // The DOM label stays for assistive tech; its pixels are drawn here so the
  // shader can recolour them under the ink.
  const drawLabel = () => {
    const ctx = text.getContext('2d');
    if (!ctx) return;
    text.width = width;
    text.height = height;
    const style = getComputedStyle(label);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${parseFloat(style.fontSize) * dpr}px ${style.fontFamily}`;
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${(parseFloat(style.letterSpacing) || 0) * dpr}px`;
    }
    const words = label.textContent ?? '';
    const metrics = ctx.measureText(words);
    // Font box metrics arrived in Firefox 116; the glyph box is close enough.
    const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
    const gap = (label.offsetHeight * dpr - (ascent + descent)) / 2;
    ctx.fillStyle = '#fff';
    ctx.fillText(words, label.offsetLeft * dpr, label.offsetTop * dpr + gap + ascent);
    gl.bindTexture(gl.TEXTURE_2D, labelTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  };

  const show = () => {
    if (!ink) return;
    displayP.use();
    gl.uniform1i(displayP.set.uInk, bind(0, ink.read.tex));
    gl.uniform1i(displayP.set.uLabel, bind(1, labelTex));
    gl.uniform3fv(displayP.set.uBase, TEAL);
    gl.uniform3fv(displayP.set.uFill, LIME);
    draw(null);
  };

  return {
    resize: () => {
      cssW = Math.max(1, button.offsetWidth);
      cssH = Math.max(1, button.offsetHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(cssW * dpr);
      height = Math.round(cssH * dpr);
      canvas.width = width;
      canvas.height = height;

      free(gl, velocity, pressure, divergence, ink);
      const simW = Math.max(8, Math.round(cssW / CELL));
      const simH = Math.max(8, Math.round(cssH / CELL));
      velocity = pair(gl, simW, simH);
      pressure = pair(gl, simW, simH);
      divergence = target(gl, simW, simH);
      ink = pair(gl, Math.max(8, cssW), Math.max(8, cssH));
      if (!velocity || !pressure || !divergence || !ink) return false;

      drawLabel();
      show();
      return true;
    },

    step: (dt, stroke) => {
      if (!velocity || !pressure || !divergence || !ink) return;
      const cell = [1 / velocity.read.w, 1 / velocity.read.h] as const;

      if (stroke) {
        const brush = { radius: RADIUS, aspect: cssW / cssH, shape: 1 };
        const push: [number, number] = [(stroke.vx / CELL) * PUSH, (-stroke.vy / CELL) * PUSH];
        splat(velocity, stroke.x, stroke.y, push, { ...brush, isInk: false });
        splat(ink, stroke.x, stroke.y, [stroke.moved * INK_PER_PX, 0], { ...brush, isInk: true });
      }

      // Pressure: start from most of last frame's, then relax it.
      divergenceP.use();
      gl.uniform2f(divergenceP.set.uCell, ...cell);
      gl.uniform1i(divergenceP.set.uVelocity, bind(0, velocity.read.tex));
      draw(divergence);

      pressureP.use();
      gl.uniform2f(pressureP.set.uCell, ...cell);
      gl.uniform1i(pressureP.set.uDivergence, bind(1, divergence.tex));
      for (let i = 0; i < PRESSURE_STEPS; i += 1) {
        gl.uniform1f(pressureP.set.uKeep, i === 0 ? PRESSURE_KEEP : 1);
        gl.uniform1i(pressureP.set.uPressure, bind(0, pressure.read.tex));
        draw(pressure.write);
        pressure.swap();
      }

      gradientP.use();
      gl.uniform2f(gradientP.set.uCell, ...cell);
      gl.uniform1i(gradientP.set.uPressure, bind(0, pressure.read.tex));
      gl.uniform1i(gradientP.set.uVelocity, bind(1, velocity.read.tex));
      draw(velocity.write);
      velocity.swap();

      advect(velocity, cell, dt, [FLOW_FADE, FLOW_FADE, 0]);
      advect(ink, cell, dt, [INK_FADE, POOL_FADE, 0]);
      show();
    },

    pool: (x, y, rx, ry, size) => {
      if (!ink) return;
      // Measured in heights, so squeeze x to reach rx of the width.
      splat(ink, x, y, [0, POOL_INK], {
        radius: ry * size,
        aspect: ry / rx,
        shape: 2,
        isInk: true,
      });
    },

    dispose,
  };
};

export interface InkStrokeButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
}

const InkStrokeButton = ({
  children,
  className,
  type = 'button',
  ref,
  ...props
}: InkStrokeButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);

  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useGSAP(
    () => {
      const btn = btnRef.current;
      const canvas = canvasRef.current;
      const label = labelRef.current;
      if (!btn || !canvas || !label) return;

      let renderer: Renderer | null = null;
      let ticking = false;
      let lastInk = -Infinity;
      let sweep: gsap.core.Tween | null = null;
      // All positions are in the button's own pixels. The pointer is tracked
      // across the page, so the ink is ready as the cursor arrives.
      const pointer = { x: 0, y: 0, known: false };
      const brush = { x: 0, y: 0 };
      const pool = { x: 0, y: 0, rx: POOL_X, ry: POOL_Y, at: -Infinity };

      const near = (x: number, y: number, margin: number) =>
        x > -margin && y > -margin && x < btn.offsetWidth + margin && y < btn.offsetHeight + margin;

      const stop = () => {
        gsap.ticker.remove(tick);
        ticking = false;
      };

      function tick(time: number, deltaTime: number) {
        if (!renderer || !btn) return stop();
        const dt = Math.min(deltaTime / 1000, 1 / 30);

        // The brush eases after the pointer, which is what makes the ink glide.
        const ease = 1 - Math.exp(-dt / FOLLOW);
        const x = brush.x + (pointer.x - brush.x) * ease;
        const y = brush.y + (pointer.y - brush.y) * ease;
        const dx = x - brush.x;
        const dy = y - brush.y;
        const moved = Math.hypot(dx, dy);
        const painting =
          pointer.known && moved > 0.2 && near(x, y, btn.offsetHeight * RADIUS * 0.6);
        brush.x = x;
        brush.y = y;

        // A new pool eases out from 15% to full size.
        const grown = (time - pool.at) / POOL_GROW;
        if (grown < 1)
          renderer.pool(pool.x, pool.y, pool.rx, pool.ry, 0.15 + 0.85 * (1 - (1 - grown) ** 3));

        renderer.step(dt, painting ? { x, y, vx: dx / dt, vy: dy / dt, moved } : null);
        if (painting || grown < 1) lastInk = time;
        // Sleep once the ink has faded; the next move wakes it.
        if (!sweep?.isActive() && time - lastInk > IDLE_AFTER) stop();
      }

      const wake = () => {
        if (ticking || !renderer) return;
        ticking = true;
        gsap.ticker.add(tick);
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch' || !renderer || btn.disabled) return;
        const box = btn.getBoundingClientRect();
        const scale = box.width / btn.offsetWidth || 1;
        const x = (event.clientX - box.left) / scale;
        const y = (event.clientY - box.top) / scale;

        // Coming in over an edge floods a pool in from that edge. Through a
        // side it fills a full-height band; through the top or bottom it
        // spreads from where the cursor crossed.
        const now = gsap.ticker.time;
        const entered = pointer.known && near(x, y, 0) && !near(pointer.x, pointer.y, 0);
        if (entered && now - pool.at > POOL_GAP) {
          const w = btn.offsetWidth;
          const h = btn.offsetHeight;
          const at = entryPoint(pointer.x, pointer.y, x, y, w, h);
          Object.assign(
            pool,
            at.side
              ? { x: at.x < w / 2 ? 0 : w, y: h / 2, rx: POOL_X, ry: POOL_Y }
              : {
                  x: Math.min(Math.max(at.x, 0), w),
                  y: at.y < h / 2 ? 0 : h,
                  rx: POOL_SPAN,
                  ry: POOL_DEPTH,
                },
            { at: now }
          );
        }

        // A sleeping brush starts where the pointer was, not where it rested.
        if (!pointer.known || !ticking) {
          brush.x = pointer.known ? pointer.x : x;
          brush.y = pointer.known ? pointer.y : y;
        }
        Object.assign(pointer, { x, y, known: true });
        if (near(x, y, btn.offsetHeight * RADIUS * 2)) wake();
      };

      // Chrome sends pointer events to disabled buttons, so skip those.
      const onHover = (event: PointerEvent) => {
        btn.dataset.active = String(event.type === 'pointerenter' && !btn.disabled);
      };

      // A keyboard user has no cursor, so focus sweeps one across for them.
      const onFocus = () => {
        if (!isFocusVisible(btn)) return;
        btn.dataset.active = 'true';
        if (!renderer) return;
        sweep?.kill();
        const y = btn.offsetHeight / 2;
        Object.assign(pointer, { x: -btn.offsetHeight * 0.4, y, known: true });
        Object.assign(brush, { x: pointer.x, y });
        wake();
        sweep = gsap.to(pointer, { x: btn.offsetWidth * 0.75, duration: 0.6, ease: 'power2.out' });
      };
      const onBlur = () => {
        if (!btn.matches(':hover')) btn.dataset.active = 'false';
      };

      // Without WebGL the CSS colour swap takes over (data-live=false).
      const fallBack = () => {
        stop();
        renderer?.dispose();
        renderer = null;
        setLive(false);
      };
      const fit = () => {
        if (renderer && !renderer.resize()) fallBack();
      };
      const resize = new ResizeObserver(fit);

      const start = () => {
        if (renderer || prefersReducedMotion()) return;
        renderer = createRenderer(canvas, btn, label);
        if (!renderer) return;
        if (!renderer.resize()) return fallBack();
        setLive(true);
        resize.observe(btn);
        // The label too: new text in a fixed-width button must be redrawn.
        resize.observe(label);
        document.fonts?.ready.then(fit);
      };

      // Not restored: the CSS fallback takes over for the rest of the visit.
      const onLost = () => {
        stop();
        renderer = null;
        setLive(false);
      };

      // Contexts are limited per page, so one is only made once on screen.
      const visible =
        typeof IntersectionObserver === 'undefined'
          ? null
          : new IntersectionObserver((entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                visible?.disconnect();
                start();
              }
            });
      if (visible) visible.observe(btn);
      else start();

      window.addEventListener('pointermove', onMove, { passive: true });
      btn.addEventListener('pointerenter', onHover);
      btn.addEventListener('pointerleave', onHover);
      btn.addEventListener('focus', onFocus);
      btn.addEventListener('blur', onBlur);
      canvas.addEventListener('webglcontextlost', onLost);
      return () => {
        window.removeEventListener('pointermove', onMove);
        btn.removeEventListener('pointerenter', onHover);
        btn.removeEventListener('pointerleave', onHover);
        btn.removeEventListener('focus', onFocus);
        btn.removeEventListener('blur', onBlur);
        canvas.removeEventListener('webglcontextlost', onLost);
        visible?.disconnect();
        resize.disconnect();
        sweep?.kill();
        stop();
        renderer?.dispose();
        renderer = null; // so a late fonts.ready finds nothing to resize
      };
    },
    { scope: btnRef }
  );

  return (
    <button
      ref={setRef}
      type={type}
      data-active="false"
      data-live={live}
      className={cn(
        'relative inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-[14px] bg-[#045f64] px-6 text-base font-medium text-[#c6f56f] transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none select-none focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 not-disabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:data-[live=false]:bg-[#c6f56f] data-[active=true]:data-[live=false]:text-[#045f64] motion-reduce:transition-none motion-reduce:active:scale-100',
        className
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          // High-contrast mode forces the label visible, so hide the copy.
          'pointer-events-none absolute inset-0 size-full forced-colors:hidden',
          live ? 'opacity-100' : 'opacity-0'
        )}
      />
      <span ref={labelRef} className={cn('relative whitespace-nowrap', live && 'text-transparent')}>
        {children}
      </span>
    </button>
  );
};

export default InkStrokeButton;
