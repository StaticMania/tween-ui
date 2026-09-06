import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CounterNumberOnScroll from '@/registry/tweenui/scroll-based/counter-number-on-scroll';

describe('Counter Number On Scroll', () => {
  it('renders a trigger and mounts without error', () => {
    const { container } = render(<CounterNumberOnScroll value={150} instant />);
    expect(container.querySelector('[data-counter-trigger]')).toBeInTheDocument();
  });

  it('accepts a custom format', () => {
    const { container } = render(
      <CounterNumberOnScroll
        value={9.2}
        instant
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      />
    );
    expect(container.querySelector('[data-counter-trigger]')).toBeInTheDocument();
  });
});
