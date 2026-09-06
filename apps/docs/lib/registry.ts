// Registry data access (server-safe). Mirrors Magic UI's lib/registry.ts.
// NOTE: the client demo map lives in `@/registry/__index__` (a 'use client'
// module using next/dynamic) — import getDemo from there directly, never
// re-export it here, or server components that read `registry` through this
// barrel would pull the client module into a server graph and break hydration.
export { registry, getEntry, hrefFor } from '@/registry/index';
