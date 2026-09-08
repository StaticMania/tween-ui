export interface Snippet {
  code: string;
  codeHtml: string;
}

/** Fallback snippet when `__sources__.generated` has not hot-reloaded yet. */
export function plainSnippet(code: string): Snippet {
  const escaped = code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return { code, codeHtml: `<pre><code>${escaped}</code></pre>` };
}
