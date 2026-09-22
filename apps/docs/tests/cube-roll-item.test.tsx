import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CubeRollItem from '@/registry/tweenui/cube-roll-item';

const ITEMS = [
  { title: 'Concept', label: 'Why we built it', href: '#concept' },
  { title: 'Features', label: 'What it does', href: '#features' },
];

const setMedia = ({ reduce = false, hover = true } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : query.includes('hover') ? hover : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe('Cube Roll Item', () => {
  // restoreAllMocks also resets the matchMedia stub, so rebuild it per test.
  beforeEach(() => setMedia());
  afterEach(() => vi.restoreAllMocks());

  it('renders a labelled nav with one numbered link per item', () => {
    render(<CubeRollItem items={ITEMS} aria-label="On this page" />);

    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '#concept');
    expect(links[0]).toHaveAccessibleName(/001\s*Concept\s*Why we built it/);
    expect(links[1]).toHaveAccessibleName(/002\s*Features/);
  });

  it('hides the extra drum faces from assistive tech', () => {
    const { container } = render(<CubeRollItem items={ITEMS} />);
    const drum = container.querySelector('[data-roll-drum]')!;

    expect(drum.children).toHaveLength(4);
    expect(drum.querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(3);
  });

  it('draws a rule above every row plus one closing rule under the last', () => {
    const { container } = render(<CubeRollItem items={ITEMS} />);
    expect(container.querySelectorAll('[data-roll-rule]')).toHaveLength(ITEMS.length + 1);
  });

  it('rolls a row onto its filled face on hover and back on leave', () => {
    const { container } = render(<CubeRollItem items={ITEMS} />);
    const row = container.querySelector('[data-roll-row]')!;
    const link = screen.getAllByRole('link')[0];

    fireEvent.mouseEnter(link);
    expect(row).toHaveAttribute('data-active', 'true');

    fireEvent.mouseLeave(link);
    expect(row).toHaveAttribute('data-active', 'false');
  });

  it('ignores hover on touch devices', () => {
    setMedia({ hover: false });
    const { container } = render(<CubeRollItem items={ITEMS} />);

    fireEvent.mouseEnter(screen.getAllByRole('link')[0]);
    expect(container.querySelector('[data-roll-row]')).toHaveAttribute('data-active', 'false');
  });

  it('skips the intro and snaps to the filled face under reduced motion', () => {
    setMedia({ reduce: true });
    const timeline = vi.spyOn(gsap, 'timeline');
    const to = vi.spyOn(gsap, 'to');
    const { container } = render(<CubeRollItem items={ITEMS} />);

    expect(timeline).not.toHaveBeenCalled();

    fireEvent.mouseEnter(screen.getAllByRole('link')[0]);
    expect(to).not.toHaveBeenCalled();
    expect(container.querySelector('[data-roll-row]')).toHaveAttribute('data-active', 'true');
  });

  it('merges a custom className onto the nav', () => {
    const { container } = render(<CubeRollItem items={ITEMS} className="mt-10" />);
    expect(container.querySelector('[data-cube-roll-item]')).toHaveClass('mt-10');
  });
});
