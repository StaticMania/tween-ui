import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';

describe('Icon Trail Button', () => {
  it('renders its children and mounts without error', () => {
    render(<IconTrailButton>Get started</IconTrailButton>);
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-btn-icon-slide');
    expect(button).toHaveAttribute('data-icon-state', 'idle');
  });

  it('forwards native button props', () => {
    render(<IconTrailButton disabled>Save</IconTrailButton>);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
