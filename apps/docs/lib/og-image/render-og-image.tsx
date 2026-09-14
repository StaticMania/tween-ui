import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';
import { TWEEN_EASE } from '@/lib/motion';
import { isSiteTitle, type OgImageParams } from '@/lib/og-image/og-image-params';

type FontWeight = 400 | 500;

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: 'normal';
};

type Point = Readonly<{ x: number; y: number }>;

const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const colors = {
  ink: '#12161f',
  teal: '#045f64',
  tealSoft: '#9fd4d6',
  lime: '#c6f56f',
  white: '#ffffff',
} as const;

const SANS_FAMILY = 'Outfit';
const MONO_FAMILY = 'Geist Mono';
const GRID_STEP = 48;
const CURVE_POINTS = [
  { x: 0, y: 400 },
  { x: 128, y: 112 },
  { x: 0, y: 0 },
  { x: 400, y: 0 },
] as const satisfies readonly Point[];
const RIDERS = [
  { id: 'trail-b', at: 0.62, radius: 5, opacity: 0.35 },
  { id: 'trail-a', at: 0.7, radius: 5.5, opacity: 0.55 },
  { id: 'halo', at: 0.78, radius: 18, opacity: 0.25 },
  { id: 'head', at: 0.78, radius: 8.5, opacity: 1 },
] as const;
const RULER_TICKS = Array.from({ length: 25 }, (_, index) => index);
const RULER_KEYFRAMES = [0.08, 0.25, 0.5, 0.66] as const;
const PLAYHEAD_AT = 0.72;
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

export async function renderOgImage(params: OgImageParams): Promise<ImageResponse> {
  const copy = describeCopy(params);
  const siteHost = new URL(siteConfig.url).host;
  const monoText = [copy.label, siteHost, `cubic-bezier(${TWEEN_EASE})`, 'time', 'value'].join('');
  const sansText = [siteConfig.name, ...copy.titleLines.flat(), params.description].join('');

  const fonts = (
    await Promise.all([
      loadGoogleFont(SANS_FAMILY, 500, sansText),
      loadGoogleFont(SANS_FAMILY, 400, sansText),
      loadGoogleFont(MONO_FAMILY, 400, monoText),
    ])
  ).filter((font): font is LoadedFont => font !== undefined);

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '56px 72px 52px',
        backgroundColor: colors.ink,
        color: colors.white,
        fontFamily: SANS_FAMILY,
      }}
    >
      <GridBackdrop />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LogoMark size={44} />
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>
            {siteConfig.name}
          </div>
        </div>
        <Badge label={copy.label} />
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {copy.titleLines.map((line) => (
              <div
                key={line.join('')}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  fontSize: copy.titleSize,
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: copy.titleSize * -0.035,
                }}
              >
                {line.map((word, index) => (
                  <span
                    key={word}
                    style={{
                      marginLeft: index === 0 ? 0 : copy.titleSize * 0.24,
                      color: word === copy.accentWord ? colors.lime : colors.white,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              maxWidth: 640,
              fontSize: 27,
              fontWeight: 400,
              lineHeight: 1.4,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {params.description}
          </div>
        </div>
        <EaseCurve />
      </div>

      <Ruler siteHost={siteHost} />
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts,
      headers: { 'Cache-Control': CACHE_CONTROL },
    }
  );
}

function describeCopy({ title, kind }: OgImageParams): {
  label: string;
  titleLines: string[][];
  accentWord: string | undefined;
  titleSize: number;
} {
  if (isSiteTitle(title)) {
    return {
      label: 'GSAP · React 19 · Tailwind v4',
      titleLines: [
        ['Copy', 'the', 'source.'],
        ['Own', 'the', 'animation.'],
      ],
      accentWord: 'animation.',
      titleSize: 82,
    };
  }

  return {
    label: kind ? `Animated React ${kind}` : 'Docs',
    titleLines: [title.split(' ')],
    accentWord: undefined,
    titleSize: title.length > 18 ? 70 : 84,
  };
}

function GridBackdrop() {
  const columns = Math.ceil(OG_IMAGE_SIZE.width / GRID_STEP);
  const rows = Math.ceil(OG_IMAGE_SIZE.height / GRID_STEP);

  return (
    <svg
      width={OG_IMAGE_SIZE.width}
      height={OG_IMAGE_SIZE.height}
      viewBox={`0 0 ${OG_IMAGE_SIZE.width} ${OG_IMAGE_SIZE.height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {Array.from({ length: columns }, (_, index) => (
        <line
          key={`column-${index}`}
          x1={index * GRID_STEP + 0.5}
          y1={0}
          x2={index * GRID_STEP + 0.5}
          y2={OG_IMAGE_SIZE.height}
          stroke="rgba(159, 212, 214, 0.06)"
        />
      ))}
      {Array.from({ length: rows }, (_, index) => (
        <line
          key={`row-${index}`}
          x1={0}
          y1={index * GRID_STEP + 0.5}
          x2={OG_IMAGE_SIZE.width}
          y2={index * GRID_STEP + 0.5}
          stroke="rgba(159, 212, 214, 0.045)"
        />
      ))}
    </svg>
  );
}

function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill={colors.teal} />
      <path
        d="M5 19 C 9.5 8.9, 5 5, 19 5"
        fill="none"
        stroke={colors.lime}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19" cy="5" r="1.8" fill={colors.lime} />
    </svg>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderRadius: 999,
        border: '1px solid rgba(159, 212, 214, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        color: colors.tealSoft,
        fontFamily: MONO_FAMILY,
        fontSize: 19,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.lime }} />
      {label}
    </div>
  );
}

function EaseCurve() {
  const [start, controlA, controlB, end] = CURVE_POINTS;
  const path = `M${start.x} ${start.y} C${controlA.x} ${controlA.y} ${controlB.x} ${controlB.y} ${end.x} ${end.y}`;

  return (
    <svg width={330} height={330} viewBox="-30 -30 460 460">
      <line x1="0" y1="400" x2="400" y2="400" stroke="rgba(159, 212, 214, 0.3)" strokeWidth="2" />
      <line x1="0" y1="400" x2="0" y2="0" stroke="rgba(159, 212, 214, 0.3)" strokeWidth="2" />
      <line
        x1="0"
        y1="400"
        x2="400"
        y2="0"
        stroke="rgba(159, 212, 214, 0.2)"
        strokeWidth="2"
        strokeDasharray="6 9"
      />
      <line
        x1={start.x}
        y1={start.y}
        x2={controlA.x}
        y2={controlA.y}
        stroke="rgba(159, 212, 214, 0.45)"
        strokeWidth="2"
        strokeDasharray="5 7"
      />
      <line
        x1={end.x}
        y1={end.y}
        x2={controlB.x}
        y2={controlB.y}
        stroke="rgba(159, 212, 214, 0.45)"
        strokeWidth="2"
        strokeDasharray="5 7"
      />
      <circle
        cx={controlA.x}
        cy={controlA.y}
        r="7"
        fill={colors.ink}
        stroke={colors.tealSoft}
        strokeWidth="2.5"
      />
      <circle
        cx={controlB.x}
        cy={controlB.y}
        r="7"
        fill={colors.ink}
        stroke={colors.tealSoft}
        strokeWidth="2.5"
      />
      <path d={path} fill="none" stroke={colors.tealSoft} strokeWidth="4" strokeLinecap="round" />
      {RIDERS.map((rider) => {
        const point = pointOnCurve(rider.at);
        return (
          <circle
            key={rider.id}
            cx={point.x}
            cy={point.y}
            r={rider.radius}
            fill={colors.lime}
            fillOpacity={rider.opacity}
          />
        );
      })}
    </svg>
  );
}

function Ruler({ siteHost }: { siteHost: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO_FAMILY,
          fontSize: 18,
          color: 'rgba(159, 212, 214, 0.75)',
        }}
      >
        <span>{siteHost}</span>
        <span>{`cubic-bezier(${TWEEN_EASE})`}</span>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          height: 26,
          borderTop: '1px solid rgba(159, 212, 214, 0.25)',
        }}
      >
        {RULER_TICKS.map((tick) => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(tick / (RULER_TICKS.length - 1)) * 100}%`,
              width: 1,
              height: tick % 2 === 0 ? 12 : 6,
              backgroundColor: 'rgba(159, 212, 214, 0.45)',
            }}
          />
        ))}
        {RULER_KEYFRAMES.map((at) => (
          <div
            key={at}
            style={{
              position: 'absolute',
              top: -6,
              left: `${at * 100}%`,
              width: 11,
              height: 11,
              marginLeft: -5.5,
              borderRadius: 1.5,
              transform: 'rotate(45deg)',
              backgroundColor: at < PLAYHEAD_AT ? colors.lime : 'rgba(159, 212, 214, 0.35)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: -1,
            bottom: 0,
            left: `${PLAYHEAD_AT * 100}%`,
            width: 2,
            backgroundColor: colors.lime,
            boxShadow: `0 0 14px ${colors.lime}`,
          }}
        />
      </div>
    </div>
  );
}

function pointOnCurve(at: number): Point {
  const [start, controlA, controlB, end] = CURVE_POINTS;
  const rest = 1 - at;
  const weights = [rest ** 3, 3 * rest ** 2 * at, 3 * rest * at ** 2, at ** 3] as const;

  return {
    x:
      weights[0] * start.x + weights[1] * controlA.x + weights[2] * controlB.x + weights[3] * end.x,
    y:
      weights[0] * start.y + weights[1] * controlA.y + weights[2] * controlB.y + weights[3] * end.y,
  };
}

async function loadGoogleFont(
  family: string,
  weight: FontWeight,
  text: string
): Promise<LoadedFont | undefined> {
  const characters = [...new Set(text)].join('');
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(characters)}`;

  try {
    const css = await (await fetch(cssUrl)).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!fontUrl) {
      console.warn('og-image: no font file in stylesheet', { family, weight });
      return undefined;
    }

    const response = await fetch(fontUrl);
    if (!response.ok) {
      console.warn('og-image: font download failed', { family, weight, status: response.status });
      return undefined;
    }

    return { name: family, data: await response.arrayBuffer(), weight, style: 'normal' };
  } catch (error) {
    console.warn('og-image: font request failed', { family, weight, error });
    return undefined;
  }
}
