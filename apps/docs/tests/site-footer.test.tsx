import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SiteFooter } from '@/components/layout/site-footer';

vi.mock('docora', () => ({
  useDocsConfig: () => ({
    site: { name: 'Tween UI', description: 'Animated components.' },
    header: { logo: { light: '/logo.svg', alt: 'Tween UI' } },
    footer: {
      columns: [{ title: 'Community', links: [{ label: 'GitHub', href: 'https://github.com' }] }],
    },
  }),
}));

describe('SiteFooter', () => {
  it('credits Docora with a link to its docs', () => {
    render(<SiteFooter />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${year} Tween UI\\. Built with`))).toBeInTheDocument();
    const docora = screen.getByRole('link', { name: 'Docora' });
    expect(docora).toHaveAttribute('href', 'https://docora-docs.vercel.app/');
    expect(docora).toHaveAttribute('target', '_blank');
    expect(screen.queryByText(/Docus/)).toBeNull();
  });

  it('renders the configured footer columns', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com'
    );
  });
});
