'use client';

import SvgDraw from '@/registry/tweenui/svg-draw';

const CARD = {
  fill: 'currentColor',
  fillOpacity: 0.06,
  stroke: 'currentColor',
  strokeOpacity: 0.12,
} as const;

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeOpacity: 0.35,
  strokeLinecap: 'round',
} as const;

const SvgDrawDemo = () => {
  return (
    <SvgDraw
      duration={1.2}
      stagger={0.08}
      ease="power3.out"
      className="text-tween-teal dark:text-tween-teal-soft"
    >
      <svg viewBox="0 0 160 112" className="h-56 w-80" aria-label="Tween UI dashboard">
        <rect
          x="1"
          y="1"
          width="158"
          height="110"
          rx="8"
          stroke="currentColor"
          strokeOpacity="0.25"
          className="dark:fill-tween-ink fill-white"
        />
        <path d="M1 16H159" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <g fill="currentColor" fillOpacity="0.3">
          <circle cx="10" cy="8.5" r="2" />
          <circle cx="17" cy="8.5" r="2" />
          <circle cx="24" cy="8.5" r="2" />
        </g>
        <rect x="58" y="5" width="44" height="7" rx="3.5" fill="currentColor" fillOpacity="0.08" />

        <rect x="8" y="23" width="38" height="82" rx="5" fill="currentColor" fillOpacity="0.06" />
        <rect x="13" y="27" width="16" height="16" rx="4" className="fill-tween-teal" />
        <path
          d="M16.33 39.67C19.33 32.93 16.33 30.33 25.67 30.33"
          fill="none"
          strokeWidth="1.33"
          strokeLinecap="round"
          className="stroke-tween-lime"
        />
        <circle cx="25.67" cy="30.33" r="1.2" className="fill-tween-lime" />
        <path d="M33 35H41" {...LINE} strokeOpacity="0.55" strokeWidth="2.5" />
        <rect x="12" y="50" width="30" height="9" rx="3" className="fill-tween-lime/40" />
        <path d="M16 54.5H34M16 66H37M16 76H31M16 86H35" {...LINE} strokeWidth="2.5" />

        <rect x="52" y="23" width="100" height="52" rx="6" {...CARD} />
        <path d="M59 31H81M59 36H72" {...LINE} strokeWidth="2" />
        <path
          d="M59 68C68 66 72 54 81 56S96 48 105 50S122 36 131 39S140 33 145 34L145 68Z"
          className="fill-tween-lime/40 dark:fill-tween-lime/15"
        />
        <path
          d="M59 68C68 66 72 54 81 56S96 48 105 50S122 36 131 39S140 33 145 34"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="stroke-tween-teal dark:stroke-tween-lime"
        />
        <circle cx="145" cy="34" r="2.8" className="fill-tween-lime" />

        <rect x="52" y="81" width="47" height="24" rx="6" {...CARD} />
        <rect x="58" y="89" width="16" height="8" rx="4" className="fill-tween-lime" />
        <circle cx="70" cy="93" r="2.8" className="dark:fill-tween-ink-deep fill-white" />
        <path d="M79 90.5H93M79 95.5H88" {...LINE} strokeWidth="2" />

        <rect x="105" y="81" width="47" height="24" rx="6" {...CARD} />
        <rect
          x="111"
          y="87"
          width="35"
          height="12"
          rx="6"
          className="fill-tween-teal dark:fill-tween-lime"
        />
        <path
          d="M118 93H131"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="dark:stroke-tween-ink-deep stroke-white"
        />
        <path
          d="M139 95V107L142.2 104.1L144.5 109.1L146.6 108.2L144.3 103.2L148.6 102.9Z"
          strokeLinejoin="round"
          className="fill-tween-ink-deep dark:stroke-tween-ink-deep stroke-white dark:fill-white"
        />
      </svg>
    </SvgDraw>
  );
};

export default SvgDrawDemo;
