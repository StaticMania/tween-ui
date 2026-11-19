import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { DocsRoot, isAssistantEnabled } from 'docora';
import docsConfig from '../docs.config';
import { rootMetadata, rootViewport } from '../lib/metadata';
import { flattenSections } from '../lib/navigation';
import { isNewHref } from '../lib/new-items';
import { source } from '../lib/source';
import './globals.css';

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = rootViewport;

// Cloudflare Web Analytics site token, from Web Analytics → the site → snippet.
// It is public (it ships in the page), so it is read as a build variable.
const cloudflareAnalyticsToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <DocsRoot
      config={docsConfig}
      navigation={flattenSections(await source.getNavigation(), isNewHref)}
      assistantEnabled={isAssistantEnabled(docsConfig.assistant)}
    >
      {children}
      {cloudflareAnalyticsToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: cloudflareAnalyticsToken })}
          strategy="afterInteractive"
        />
      )}
    </DocsRoot>
  );
};

export default RootLayout;
