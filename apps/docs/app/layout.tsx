import type { Metadata } from 'next';
import { createRootMetadata, DocsRoot, isAssistantEnabled } from 'docora';
import docsConfig from '../docs.config';
import { flattenSections } from '../lib/navigation';
import { source } from '../lib/source';
import './globals.css';

export const metadata: Metadata = createRootMetadata(docsConfig);

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DocsRoot
      config={docsConfig}
      navigation={flattenSections(await source.getNavigation())}
      assistantEnabled={isAssistantEnabled(docsConfig.assistant)}
    >
      {children}
    </DocsRoot>
  );
}
