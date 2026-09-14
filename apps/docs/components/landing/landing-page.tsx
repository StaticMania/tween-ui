import { LandingShell } from '@/components/layout/landing-shell';
import { registry } from '@/lib/registry';
import { BlockSpotlight } from './block-spotlight';
import { Cta } from './cta';
import { Hero } from './hero';
import { LiveRow } from './live-row';
import { Preloader } from './preloader';
import { Showcase } from './showcase';
import { Why } from './why';

export type LandingPageProps = Readonly<{
  starCount: number | null;
}>;

export function LandingPage({ starCount }: LandingPageProps) {
  const componentCount = registry.filter((entry) => entry.type === 'component').length;
  const blockCount = registry.filter((entry) => entry.type === 'block').length;

  return (
    <>
      <Preloader />
      <LandingShell starCount={starCount}>
        <Hero componentCount={componentCount} blockCount={blockCount} />
        <LiveRow />
        <Why />
        <Showcase componentCount={componentCount} />
        <BlockSpotlight />
        <Cta />
      </LandingShell>
    </>
  );
}
