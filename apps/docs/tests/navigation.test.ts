import type { NavItem } from 'docora';
import { describe, expect, it } from 'vitest';
import { flattenSections } from '@/lib/navigation';

const page = (label: string, href: string): NavItem => ({ label, href });

describe('flattenSections', () => {
  it('keeps guide pages in their authored order', () => {
    const [installation] = flattenSections([
      {
        label: 'Installation',
        children: [
          page('Setup Guide', '/installation/setup-guide'),
          page('MCP', '/installation/mcp'),
        ],
      },
    ]);

    expect(installation?.label).toBe('Installation');
    expect(installation?.children?.map((child) => child.label)).toEqual(['Setup Guide', 'MCP']);
  });

  it('sorts catalog pages by name and counts them', () => {
    const [components] = flattenSections([
      {
        label: 'Components',
        children: [
          { label: 'Buttons', children: [page('Shiny Button', '/component/shiny-button')] },
          { label: 'Cards', children: [page('Flip Card', '/component/flip-card')] },
        ],
      },
    ]);

    expect(components?.label).toBe('Components (2)');
    expect(components?.children?.map((child) => child.label)).toEqual([
      'Flip Card',
      'Shiny Button',
    ]);
  });
});
