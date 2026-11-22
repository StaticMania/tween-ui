import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PasswordStrength, { defaultRules } from '@/registry/tweenui/password-strength';

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

const type = (value: string) =>
  fireEvent.change(screen.getByLabelText('Password'), { target: { value } });

describe('Password Strength', () => {
  beforeEach(() => setReducedMotion(false));

  it('renders a labelled password input with the default rules', () => {
    render(<PasswordStrength />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getAllByRole('listitem')).toHaveLength(defaultRules.length);
    expect(screen.getAllByText('(not met)')).toHaveLength(4);
  });

  it('shows no strength while empty', () => {
    render(<PasswordStrength />);
    expect(screen.queryByText(/Strength/)).toBeNull();
  });

  it('rates the password as rules are met', () => {
    render(<PasswordStrength />);
    type('abc');
    expect(screen.getByText('Weak')).toBeInTheDocument();
    type('abcDEF');
    expect(screen.getByText('Weak')).toBeInTheDocument();
    type('abcDEF1');
    expect(screen.getByText('Fair')).toBeInTheDocument();
    type('abcDEF1!');
    expect(screen.getByText('Good')).toBeInTheDocument();
    type('abcDEF12!@');
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getAllByText('(met)')).toHaveLength(4);
  });

  it('reports the value and met count', () => {
    const onValueChange = vi.fn();
    render(<PasswordStrength onValueChange={onValueChange} />);
    type('abcDEF1');
    expect(onValueChange).toHaveBeenLastCalledWith('abcDEF1', 2);
  });

  it('toggles visibility with the eye button', () => {
    render(<PasswordStrength />);
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    const hide = screen.getByRole('button', { name: 'Hide password' });
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(hide);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('draws the password mask with the asterisk font', () => {
    render(<PasswordStrength />);
    const input = screen.getByLabelText('Password');
    expect(input.style.fontFamily).toMatch(/^tween-password-mask/);
    expect(document.head.innerHTML + document.body.innerHTML).toContain(
      'unicode-range:U+2022,U+25CF'
    );
  });

  it('accepts custom rules', () => {
    render(
      <PasswordStrength rules={[{ label: 'Has a dash', test: (value) => value.includes('-') }]} />
    );
    type('a-b');
    expect(screen.getByText('Has a dash').closest('li')).toHaveAttribute('data-met', 'true');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('follows the controlled value', () => {
    const { rerender } = render(<PasswordStrength value="" />);
    rerender(<PasswordStrength value="abcDEF12!@" />);
    expect(screen.getByLabelText('Password')).toHaveValue('abcDEF12!@');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('works under reduced motion', () => {
    setReducedMotion(true);
    render(<PasswordStrength />);
    type('abcDEF1');
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });
});
