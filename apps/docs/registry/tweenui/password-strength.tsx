'use client';

import { useId, useRef, useState, type ComponentPropsWithoutRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const defaultRules: readonly PasswordRule[] = [
  { label: 'At least 10 characters', test: (value) => value.length >= 10 },
  {
    label: 'Upper and lower case letters',
    test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'At least one number', test: (value) => /\d/.test(value) },
  { label: 'At least one symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const LEVELS = [
  { word: 'Weak', color: '#e5484d' },
  { word: 'Fair', color: '#f5a524' },
  { word: 'Good', color: '#8bc34a' },
  { word: 'Strong', color: '#14b8a6' },
] as const;

const BARS = LEVELS.length;
const MASK_FONT = 'tween-password-mask';

const MASK_FONT_FACE = `@font-face{font-family:${MASK_FONT};src:url(data:font/woff2;base64,d09GMgABAAAAAAFkAAoAAAAAArgAAAEdAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAPAo4UAE2AiQDBgsGAAQgBYEEByYbFQIAngfZuXAl09NfFYuG5CSC5+9HP+e+u50UyUkJUmmRgm27aEsLsh79C6TC3NYwWgzVmEU1ytDDoCg4nqUv4Wv/nIGBrDp3sx3v/iaDxMNo7FHXLpA4AAgwCiwOJA0ww3SH6mliRErkr1cU6TpWIoMcc11oekhXT/9t+r8UKr8AdIUJBZotzM+GUFpDmtL+/0e6z893w4JInA9UowWQAUXOedcWVRu5JYo75ds9+o9eLmxefbR56fsIAsHWa1LdxNfyKL7A56HhZV179TSdQiGBYEt9jV9xI8CiehOBpFoBEgAAsnEBQhMCJGWaFCJXCAM680lSa2ZFgX3wnWZR5oOpX6BIAWzeAiaEOq7Om8XEFMDwWNhlhNiTawA=) format('woff2');unicode-range:U+2022,U+25CF;font-display:block}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scoreOf = (value: string, met: number, total: number) =>
  value ? Math.max(1, Math.round((met / (total || 1)) * BARS)) : 0;

const EyeIcon = ({ slashRef }: { slashRef: RefObject<SVGPathElement | null> }) => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    <path ref={slashRef} d="M4 4l16 16" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
  </svg>
);

export interface PasswordStrengthProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'onChange'
> {
  label?: string;
  placeholder?: string;
  name?: string;
  autoComplete?: string;
  rules?: readonly PasswordRule[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, met: number) => void;
}

const PasswordStrength = ({
  label = 'Password',
  placeholder = 'Choose a password',
  name = 'password',
  autoComplete = 'new-password',
  rules = defaultRules,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  className,
  ...props
}: PasswordStrengthProps) => {
  const id = useId();
  const inputId = `${id}-input`;
  const strengthId = `${id}-strength`;
  const rulesId = `${id}-rules`;

  const rootRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const discRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const checkRefs = useRef<(SVGPathElement | null)[]>([]);
  const eyeRef = useRef<HTMLSpanElement>(null);
  const previousScore = useRef(0);
  const settled = useRef(false);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [visible, setVisible] = useState(false);
  const [inheritedFont, setInheritedFont] = useState<string>();

  const value = controlledValue ?? innerValue;
  const results = rules.map((rule) => rule.test(value));
  const met = results.filter(Boolean).length;
  const score = scoreOf(value, met, rules.length);
  const level = score > 0 ? LEVELS[score - 1] : undefined;
  const metKey = results.map(Number).join('');

  useGSAP(
    () => {
      const instant = !settled.current || prefersReducedMotion();
      const from = previousScore.current;
      const rising = score >= from;
      const low = Math.min(from, score);
      const high = Math.max(from, score);

      fillRefs.current.forEach((fill, index) => {
        if (!fill) return;
        const changed = index >= low && index < high;
        const order = rising ? index - low : high - 1 - index;
        gsap.to(fill, {
          scaleX: index < score ? 1 : 0,
          duration: instant ? 0 : 0.45,
          delay: instant || !changed ? 0 : order * 0.06,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });

      if (!instant && level && score !== from) {
        gsap.fromTo(
          wordRef.current,
          { yPercent: rising ? 60 : -60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out', overwrite: true }
        );
      }

      previousScore.current = score;
    },
    { scope: rootRef, dependencies: [score] }
  );

  useGSAP(
    () => {
      const instant = !settled.current || prefersReducedMotion();
      results.forEach((ok, index) => {
        const disc = discRefs.current[index];
        const check = checkRefs.current[index];
        if (!disc || !check) return;
        gsap.to(disc, {
          scale: ok ? 1 : 0,
          duration: instant ? 0 : 0.3,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        gsap.to(check, {
          attr: { 'stroke-dashoffset': ok ? 0 : 1 },
          duration: instant ? 0 : ok ? 0.3 : 0.15,
          delay: instant || !ok ? 0 : 0.1,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      settled.current = true;
    },
    { scope: rootRef, dependencies: [metKey] }
  );

  useGSAP(
    () => {
      gsap.to(slashRef.current, {
        attr: { 'stroke-dashoffset': visible ? 0 : 1 },
        duration: prefersReducedMotion() ? 0 : 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    { scope: rootRef, dependencies: [visible] }
  );

  useGSAP(
    () => {
      if (rootRef.current) setInheritedFont(getComputedStyle(rootRef.current).fontFamily);
    },
    { scope: rootRef }
  );

  const toggleVisible = () => {
    const next = !visible;
    setVisible(next);
    if (prefersReducedMotion()) return;
    gsap
      .timeline()
      .to(eyeRef.current, { scaleY: 0.1, duration: 0.1, ease: 'power2.in' })
      .to(eyeRef.current, { scaleY: 1, duration: 0.2, ease: 'power2.out' });
  };

  const handleChange = (next: string) => {
    if (controlledValue === undefined) setInnerValue(next);
    onValueChange?.(next, rules.filter((rule) => rule.test(next)).length);
  };

  return (
    <div
      ref={rootRef}
      data-password-strength
      className={cn(
        'w-full max-w-sm [--password-accent:#045f64] [--password-on-accent:#ffffff] dark:[--password-accent:#c6f56f] dark:[--password-on-accent:#12161f]',
        className
      )}
      {...props}
    >
      <style href={MASK_FONT} precedence="default">
        {MASK_FONT_FACE}
      </style>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          aria-describedby={`${strengthId} ${rulesId}`}
          onChange={(event) => handleChange(event.target.value)}
          style={{ fontFamily: inheritedFont ? `${MASK_FONT}, ${inheritedFont}` : MASK_FONT }}
          className="w-full rounded-xl border border-current/15 bg-transparent py-3 pr-12 pl-4 text-sm transition-[border-color] duration-200 placeholder:text-current/40 focus:border-(--password-accent) focus:outline-none motion-reduce:transition-none"
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={toggleVisible}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg opacity-60 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
        >
          <span ref={eyeRef} className="flex">
            <EyeIcon slashRef={slashRef} />
          </span>
        </button>
      </div>

      <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-1.5">
        {LEVELS.map(({ word }, index) => (
          <span key={word} className="h-1.5 overflow-hidden rounded-full bg-current/10">
            <span
              ref={(node) => {
                fillRefs.current[index] = node;
              }}
              className="block size-full origin-left [transform:scaleX(0)] rounded-full transition-colors duration-300 will-change-transform"
              style={{ backgroundColor: level?.color ?? LEVELS[0].color }}
            />
          </span>
        ))}
      </div>

      <p id={strengthId} aria-live="polite" className="mt-2 h-4 overflow-hidden text-xs">
        {level && (
          <>
            <span className="opacity-60">Strength: </span>
            <span ref={wordRef} className="inline-block font-medium">
              {level.word}
            </span>
          </>
        )}
      </p>

      <ul id={rulesId} className="mt-4 space-y-2 text-sm">
        {rules.map((rule, index) => (
          <li
            key={rule.label}
            data-met={results[index] || undefined}
            className="flex items-center gap-2.5 opacity-60 transition-opacity duration-200 data-met:opacity-100 motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="relative grid size-4 shrink-0 place-items-center rounded-full border border-current/25"
            >
              <span
                ref={(node) => {
                  discRefs.current[index] = node;
                }}
                className="absolute -inset-px [transform:scale(0)] rounded-full bg-(--password-accent)"
              />
              <svg viewBox="0 0 16 16" className="relative size-3" fill="none">
                <path
                  ref={(node) => {
                    checkRefs.current[index] = node;
                  }}
                  d="M3.5 8.5l3 3 6-7"
                  pathLength={1}
                  strokeDasharray="1"
                  stroke="var(--password-on-accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDashoffset="1"
                />
              </svg>
            </span>
            {rule.label}
            <span className="sr-only">{results[index] ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
