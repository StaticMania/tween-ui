import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InkStrokeButton from '@/registry/tweenui/ink-stroke-button';

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

describe('Ink Stroke Button', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('renders a button named by its label', () => {
    render(<InkStrokeButton>Start a project</InkStrokeButton>);
    const button = screen.getByRole('button', { name: 'Start a project' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards the ref and native attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <InkStrokeButton ref={ref} onClick={vi.fn()} disabled>
        Start a project
      </InkStrokeButton>
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toBeDisabled();
  });

  it('hides the canvas from assistive tech and keeps the label readable', () => {
    render(<InkStrokeButton>Start a project</InkStrokeButton>);
    expect(document.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Start a project')).not.toHaveClass('text-transparent');
  });

  it('falls back to a plain colour swap without WebGL', () => {
    render(<InkStrokeButton>Start a project</InkStrokeButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-live', 'false');
  });

  it('marks the hover and keyboard focus state for the fallback', () => {
    render(<InkStrokeButton>Start a project</InkStrokeButton>);
    const button = screen.getByRole('button');

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'true');
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'false');

    act(() => button.focus());
    expect(button).toHaveAttribute('data-active', 'true');
    act(() => button.blur());
    expect(button).toHaveAttribute('data-active', 'false');
  });

  it('stays inactive on hover while disabled', () => {
    render(<InkStrokeButton disabled>Start a project</InkStrokeButton>);
    const button = screen.getByRole('button');
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'false');
  });
});
