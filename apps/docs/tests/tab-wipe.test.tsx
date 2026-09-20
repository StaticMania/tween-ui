import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TabWipe, { type TabWipeSlide } from '@/registry/tweenui/tab-wipe';

const SLIDES: TabWipeSlide[] = [
  { image: '/a.jpg', alt: 'Workflow board' },
  { image: '/b.jpg', alt: 'Performance dashboard', tabImage: '/b-thumb.jpg' },
];

describe('Tab Wipe', () => {
  it('renders one stage slide per item', () => {
    const { container } = render(<TabWipe slides={SLIDES} />);

    expect(container.querySelectorAll('[data-tab-wipe-slide]')).toHaveLength(2);
    expect(screen.getByAltText('Workflow board')).toBeInTheDocument();
    expect(screen.getByAltText('Performance dashboard')).toBeInTheDocument();
  });

  it('builds one tab per slide, with the first selected', () => {
    render(<TabWipe slides={SLIDES} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('labels each tab with its slide, and hides the thumbnail from the a11y tree', () => {
    render(<TabWipe slides={SLIDES} />);

    expect(screen.getByRole('tab', { name: 'Workflow board' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Performance dashboard' })).toBeInTheDocument();
  });

  it('uses tabImage for the thumbnail when given, else the slide image', () => {
    const { container } = render(<TabWipe slides={SLIDES} />);
    const thumbs = container.querySelectorAll('[role="tab"] img');

    expect(thumbs[0]).toHaveAttribute('src', '/a.jpg');
    expect(thumbs[1]).toHaveAttribute('src', '/b-thumb.jpg');
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<TabWipe slides={SLIDES} className="mt-10" />);
    expect(container.querySelector('[data-tab-wipe]')).toHaveClass('mt-10');
  });
});
