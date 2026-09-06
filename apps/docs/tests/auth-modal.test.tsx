import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AuthModal from '@/registry/tweenui/modal/auth-modal';

describe('Auth Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<AuthModal open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open', () => {
    render(<AuthModal open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close auth modal/i })).toBeInTheDocument();
  });
});
