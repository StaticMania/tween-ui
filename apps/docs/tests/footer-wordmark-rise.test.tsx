import { render, screen, within } from '@testing-library/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FooterWordmarkRise from '@/registry/tweenui/footer-wordmark-rise';

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe('Footer Wordmark Rise', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('renders a footer landmark with a labelled footer nav', () => {
    render(<FooterWordmarkRise />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('labels each link column by its heading', () => {
    render(
      <FooterWordmarkRise
        columns={[
          {
            heading: 'Shop',
            links: [
              { label: 'Jackets', href: '/jackets' },
              { label: 'Packs', href: '/packs' },
            ],
          },
        ]}
      />
    );

    const shop = screen.getByRole('list', { name: 'Shop' });
    expect(
      within(shop)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual(['/jackets', '/packs']);
  });

  it('reads rolling labels as one word instead of letter by letter', () => {
    render(<FooterWordmarkRise />);

    const tabs = screen.getByRole('link', { name: 'Sliding Tabs' });
    const letters = tabs.querySelector('[aria-hidden="true"]');
    expect(letters?.children).toHaveLength(12);
  });

  it('names social links after the brand and opens them in a new tab', () => {
    render(
      <FooterWordmarkRise
        brand="Northwind"
        socials={[{ label: 'Instagram', href: 'https://instagram.com/nw', icon: 'instagram' }]}
      />
    );

    const instagram = screen.getByRole('link', { name: 'Northwind on Instagram' });
    expect(instagram).toHaveAttribute('target', '_blank');
    expect(instagram).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('defaults to the Tween UI brand, mark and repository links', () => {
    render(<FooterWordmarkRise />);

    expect(screen.getByRole('link', { name: 'Tween UI' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Tween UI on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/StaticMania/tween-ui'
    );
    expect(screen.getByRole('link', { name: 'MIT License' })).toHaveAttribute('target', '_blank');
  });

  it('opens external column links in a new tab and keeps site links in place', () => {
    render(<FooterWordmarkRise />);

    expect(screen.getByRole('link', { name: 'Report an issue' })).toHaveAttribute(
      'target',
      '_blank'
    );
    expect(screen.getByRole('link', { name: 'All components' })).not.toHaveAttribute('target');
  });

  it('drops the social row when there are no socials', () => {
    render(<FooterWordmarkRise socials={[]} />);

    expect(screen.queryByRole('list', { name: 'Social links' })).toBeNull();
  });

  it('keeps the giant wordmark out of the accessibility tree', () => {
    const { container } = render(<FooterWordmarkRise brand="Northwind" />);

    const wordmark = container.querySelector('p.whitespace-nowrap[aria-hidden="true"]');
    expect(wordmark).toHaveTextContent('Northwind');
    expect(screen.getAllByRole('link', { name: 'Northwind' })).toHaveLength(1);
  });

  it('writes the copyright from the brand unless one is given', () => {
    const { rerender } = render(<FooterWordmarkRise brand="Northwind" />);
    expect(screen.getByText(`© ${new Date().getFullYear()} Northwind`)).toBeInTheDocument();

    rerender(<FooterWordmarkRise copyright="© Northwind Ltd" />);
    expect(screen.getByText('© Northwind Ltd')).toBeInTheDocument();
  });

  it('never splits the wordmark or builds the entrance under reduced motion', async () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const split = vi.spyOn(SplitText, 'create');
    render(<FooterWordmarkRise />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(timeline).not.toHaveBeenCalled();
    expect(split).not.toHaveBeenCalled();
  });

  it('builds the entrance and splits the wordmark when motion is allowed', async () => {
    setReducedMotion(false);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const timeline = vi.spyOn(gsap, 'timeline');
    const split = vi.spyOn(SplitText, 'create');
    const { container } = render(<FooterWordmarkRise />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(timeline).toHaveBeenCalledTimes(1);
    expect(split).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-split]')).not.toBeNull();
  });
});
