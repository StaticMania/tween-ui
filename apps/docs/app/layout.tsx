import type { Metadata, Viewport } from 'next';
import { DocsRoot, isAssistantEnabled } from 'docora';
import docsConfig from '../docs.config';
import { rootMetadata, rootViewport } from '../lib/metadata';
import { flattenSections } from '../lib/navigation';
import { isNewHref } from '../lib/new-items';
import { source } from '../lib/source';
import './globals.css';

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = rootViewport;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DocsRoot
      config={docsConfig}
      navigation={flattenSections(await source.getNavigation(), isNewHref)}
      assistantEnabled={isAssistantEnabled(docsConfig.assistant)}
    >
      {children}
    </DocsRoot>
  );
}
