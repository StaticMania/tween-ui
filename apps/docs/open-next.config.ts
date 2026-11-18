import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// docora reads `content/` from disk while rendering, and a Worker has no disk.
// Every docs page is prerendered at build time, so serve those prerendered
// pages from Workers static assets instead of rendering them per request.
// This cache does not support revalidation; the site is rebuilt on each push.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
