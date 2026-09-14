import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchStarCount, formatStarCount, repoSlug } from '@/lib/github';

const REPO = 'https://github.com/StaticMania/tween-ui';

const mockGithub = (init: { ok: boolean; payload?: unknown }) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: init.ok,
    json: async () => init.payload,
  } as Response);

describe('repoSlug', () => {
  it('reads owner/repo out of a github url', () => {
    expect(repoSlug('https://github.com/StaticMania/tween-ui')).toBe('StaticMania/tween-ui');
    expect(repoSlug('https://github.com/StaticMania/tween-ui/')).toBe('StaticMania/tween-ui');
    expect(repoSlug('https://github.com/StaticMania/tween-ui.git')).toBe('StaticMania/tween-ui');
  });

  it('rejects anything that is not a repo url', () => {
    expect(repoSlug(undefined)).toBeNull();
    expect(repoSlug('https://github.com/StaticMania')).toBeNull();
    expect(repoSlug('https://gitlab.com/StaticMania/tween-ui')).toBeNull();
  });
});

describe('fetchStarCount', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads stargazers_count from a good response', async () => {
    mockGithub({ ok: true, payload: { stargazers_count: 1540 } });
    await expect(fetchStarCount(REPO)).resolves.toBe(1540);
  });

  it('returns null when GitHub rate limits or errors', async () => {
    mockGithub({ ok: false, payload: { message: 'API rate limit exceeded' } });
    await expect(fetchStarCount(REPO)).resolves.toBeNull();
  });

  it('returns null when the payload is not shaped as expected', async () => {
    mockGithub({ ok: true, payload: { stargazers_count: 'lots' } });
    await expect(fetchStarCount(REPO)).resolves.toBeNull();
  });

  it('returns null when the network throws, without bubbling up', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(fetchStarCount(REPO)).resolves.toBeNull();
  });

  it('never calls GitHub for a url that is not a repo', async () => {
    const fetchSpy = mockGithub({ ok: true, payload: { stargazers_count: 1 } });
    await expect(fetchStarCount('https://gitlab.com/a/b')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('formatStarCount', () => {
  it('leaves counts under a thousand alone', () => {
    expect(formatStarCount(0)).toBe('0');
    expect(formatStarCount(999)).toBe('999');
  });

  it('abbreviates thousands and drops a trailing zero', () => {
    expect(formatStarCount(1000)).toBe('1k');
    expect(formatStarCount(1540)).toBe('1.5k');
    expect(formatStarCount(12300)).toBe('12.3k');
  });
});
