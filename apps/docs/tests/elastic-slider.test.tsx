import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ElasticSlider from '@/registry/tweenui/elastic-slider';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

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

const Budget = (props: { onValueChange?: (value: number) => void; defaultValue?: number }) => (
  <ElasticSlider
    label="Monthly budget"
    min={0}
    max={20000}
    step={100}
    buttonStep={100}
    defaultValue={7500}
    prefix="$"
    {...props}
  />
);

describe('Elastic Slider', () => {
  beforeEach(() => setReducedMotion(false));

  it('renders a labelled native range input', () => {
    render(<Budget />);
    const slider = screen.getByRole('slider', { name: 'Monthly budget' });
    expect(slider).toHaveValue('7500');
    expect(slider).toHaveAttribute('aria-valuetext', '$7,500');
  });

  it('steps up and down by 100 with the buttons', () => {
    const onValueChange = vi.fn();
    render(<Budget onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase Monthly budget by $100' }));
    expect(onValueChange).toHaveBeenLastCalledWith(7600);
    expect(screen.getByRole('slider')).toHaveValue('7600');
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Monthly budget by $100' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Monthly budget by $100' }));
    expect(onValueChange).toHaveBeenLastCalledWith(7400);
  });

  it('stops at the limits', () => {
    const onValueChange = vi.fn();
    render(<Budget defaultValue={20000} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Increase/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('slider')).toHaveValue('20000');
  });

  it('snaps typed changes to the step', () => {
    const onValueChange = vi.fn();
    render(<Budget onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1260' } });
    expect(onValueChange).toHaveBeenCalledWith(1300);
  });

  it('follows the controlled value', () => {
    const { rerender } = render(<ElasticSlider label="Volume" value={10} />);
    rerender(<ElasticSlider label="Volume" value={90} />);
    expect(screen.getByRole('slider')).toHaveValue('90');
  });

  it('hides the buttons without a buttonStep', () => {
    render(<ElasticSlider label="Volume" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('works under reduced motion', () => {
    setReducedMotion(true);
    render(<Budget />);
    fireEvent.click(screen.getByRole('button', { name: /Increase/ }));
    expect(screen.getByRole('slider')).toHaveValue('7600');
  });
});
