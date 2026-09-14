/** How long a star count is served from the Data Cache before GitHub is asked again. */
const STAR_COUNT_TTL_SECONDS = 3600;

const REPO_URL_PATTERN = /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/;

export function repoSlug(repoUrl: string | undefined): string | null {
  const match = repoUrl?.match(REPO_URL_PATTERN);
  return match ? `${match[1]}/${match[2]}` : null;
}

function parseStarCount(payload: unknown): number | null {
  if (typeof payload !== 'object' || payload === null) return null;
  if (!('stargazers_count' in payload)) return null;

  const count = payload.stargazers_count;
  return typeof count === 'number' && Number.isFinite(count) ? count : null;
}

/**
 * Stargazers for a repo, or `null` when GitHub is unreachable, rate limited or
 * answers something unexpected. Callers render without the count rather than
 * failing — this is decoration, not data the page depends on.
 */
export async function fetchStarCount(repoUrl: string | undefined): Promise<number | null> {
  const slug = repoSlug(repoUrl);
  if (!slug) return null;

  // Anonymous callers get 60 requests an hour per IP, which shared CI runners
  // exhaust routinely. GITHUB_TOKEN (set for free inside GitHub Actions) lifts
  // that to 5000. It is read here and nowhere else, and never leaves the server.
  const token = process.env.GITHUB_TOKEN;

  try {
    const response = await fetch(`https://api.github.com/repos/${slug}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: STAR_COUNT_TTL_SECONDS },
    });
    if (!response.ok) return null;

    return parseStarCount(await response.json());
  } catch {
    return null;
  }
}

export function formatStarCount(count: number): string {
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}
