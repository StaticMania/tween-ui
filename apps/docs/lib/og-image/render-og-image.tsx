import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';
import { TWEEN_EASE } from '@/lib/motion';
import { Badge } from '@/lib/og-image/badge';
import { EaseCurve } from '@/lib/og-image/ease-curve';
import { GridBackdrop } from '@/lib/og-image/grid-backdrop';
import { LogoMark } from '@/lib/og-image/logo-mark';
import { isSiteTitle, type OgImageParams } from '@/lib/og-image/og-image-params';
import { colors, MONO_FAMILY, OG_IMAGE_SIZE, SANS_FAMILY } from '@/lib/og-image/og-theme';
import { Ruler } from '@/lib/og-image/ruler';

type FontWeight = 400 | 500;

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: 'normal';
};

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
