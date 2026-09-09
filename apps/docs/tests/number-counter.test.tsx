import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NumberCounter from '@/registry/tweenui/number-counter';

describe('Number Counter', () => {
  it('renders a trigger and mounts without error', () => {
    const { container } = render(<NumberCounter value={150} instant />);
    expect(container.querySelector('[data-counter-trigger]')).toBeInTheDocument();
  });

  it('accepts a custom format', () => {
    const { container } = render(
      <NumberCounter
        value={9.2}
        instant
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      />
    );
    expect(container.querySelector('[data-counter-trigger]')).toBeInTheDocument();
  });
});
