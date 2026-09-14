import { parseOgImageParams } from '@/lib/og-image/og-image-params';
import { renderOgImage } from '@/lib/og-image/render-og-image';

export async function GET(request: Request) {
  return renderOgImage(parseOgImageParams(new URL(request.url).searchParams));
}
