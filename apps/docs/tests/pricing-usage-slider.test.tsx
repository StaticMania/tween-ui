import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PricingUsageSlider, {
  type PricingUsageSliderPlan,
} from '@/registry/tweenui/pricing-usage-slider';

// NumberFlow ships a custom element jsdom never upgrades, so it throws on
// re-render. The price is plain text for the purposes of these tests.
vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

const PLANS: PricingUsageSliderPlan[] = [
  {
    name: 'Creator',
    description: 'Best for solo creators',
    price: 79,
    popular: true,
    features: ['600+ minutes monthly'],
    cta: 'Upgrade now',
  },
  {
    name: 'Scale',
    description: 'Pay for the volume you use',
    range: { min: 400, max: 1200, defaultValue: 750, label: 'Drag to set your volume' },
    features: ['Custom SLA'],
    cta: 'Contact sales',
  },
];

describe('Pricing Usage Slider', () => {
  it('renders the heading, both plans, and their actions', () => {
    render(
      <PricingUsageSlider title="Flexible pricing" description="Scale as you grow." plans={PLANS} />
    );

    expect(screen.getByText('Flexible pricing')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upgrade now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact sales' })).toBeInTheDocument();
  });

  it('badges only the popular plan', () => {
    render(<PricingUsageSlider plans={PLANS} popularLabel="Most popular" />);
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
  });

  it('gives a slider only to the plan that declares a range', () => {
    render(<PricingUsageSlider plans={PLANS} />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(1);
    expect(sliders[0]).toHaveValue('750');
    expect(sliders[0]).toHaveAttribute('min', '400');
    expect(sliders[0]).toHaveAttribute('max', '1200');
  });

  it('labels the slider for screen readers', () => {
    render(<PricingUsageSlider plans={PLANS} />);
    expect(screen.getByLabelText('Drag to set your volume')).toBeInTheDocument();
  });

  it('updates the price when the slider moves', () => {
    render(<PricingUsageSlider plans={PLANS} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '1100' } });

    expect(slider).toHaveValue('1100');
    expect(screen.getByText('1100')).toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<PricingUsageSlider plans={PLANS} className="mt-10" />);
    expect(container.querySelector('[data-pricing-usage-slider]')).toHaveClass('mt-10');
  });
});
