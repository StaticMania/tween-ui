import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CtaContactMorph from '@/registry/tweenui/cta-contact-morph';

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

const trigger = () => screen.getByRole('button', { name: /write us a message|message sent/i });
const panel = () => screen.getByRole('dialog', { hidden: true });
const field = (name: string) => screen.getByRole('textbox', { name, hidden: true });
const send = () => screen.getByRole('button', { name: 'Send message', hidden: true });

const fill = (name: string, email: string) => {
  fireEvent.change(field('Your name'), { target: { value: name } });
  fireEvent.change(field('Your email'), { target: { value: email } });
};

describe('CTA Contact Morph', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('renders a button that controls a hidden dialog', () => {
    render(<CtaContactMorph />);

    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-controls', panel().id);
    expect(panel().style.visibility).toBe('hidden');
  });

  it('opens on click and focuses the name field', () => {
    render(<CtaContactMorph />);

    fireEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(panel().style.visibility).toBe('inherit');
    expect(field('Your name')).toHaveFocus();
  });

  it('says what is missing and moves focus to it', () => {
    const onSend = vi.fn();
    render(<CtaContactMorph onSend={onSend} />);
    fireEvent.click(trigger());

    fireEvent.click(send());
    expect(screen.getByRole('alert', { hidden: true })).toHaveTextContent('Add your name');
    expect(field('Your name')).toHaveAttribute('aria-invalid', 'true');

    fill('Ana', 'not-an-email');
    fireEvent.click(send());
    expect(screen.getByRole('alert', { hidden: true })).toHaveTextContent('Add an email');
    expect(field('Your email')).toHaveFocus();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends the message and folds into a sent confirmation', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<CtaContactMorph onSend={onSend} />);
    fireEvent.click(trigger());

    fill(' Ana ', 'ana@studio.com');
    fireEvent.click(screen.getByRole('radio', { name: 'an app', hidden: true }));
    fireEvent.change(field('Anything we should know first? It’s optional.'), {
      target: { value: 'Launch in March' },
    });
    await act(async () => fireEvent.click(send()));

    expect(onSend).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@studio.com',
      topic: 'an app',
      details: 'Launch in March',
    });
    expect(trigger()).toHaveTextContent('Message sent');
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
    expect(trigger()).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Message sent');

    fireEvent.click(trigger());
    expect(panel().style.visibility).toBe('hidden');
  });

  it('keeps the panel open with a retry message when sending fails', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('offline'));
    render(<CtaContactMorph onSend={onSend} />);
    fireEvent.click(trigger());

    fill('Ana', 'ana@studio.com');
    await act(async () => fireEvent.click(send()));

    expect(screen.getByRole('alert')).toHaveTextContent('didn’t send');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(field('Your name')).toHaveValue('Ana');
  });

  it('closes on Escape, returns focus and keeps what was typed', () => {
    render(<CtaContactMorph />);
    fireEvent.click(trigger());
    fill('Ana', '');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();

    fireEvent.click(trigger());
    expect(field('Your name')).toHaveValue('Ana');
  });

  it('ignores Escape pressed outside the panel', () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <CtaContactMorph />
      </>
    );
    fireEvent.click(trigger());
    screen.getByRole('textbox', { name: 'Elsewhere' }).focus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('reopens to show the error when a send fails after closing', async () => {
    let reject: (error: Error) => void = () => {};
    const onSend = vi.fn(() => new Promise<void>((_, fail) => (reject = fail)));
    render(<CtaContactMorph onSend={onSend} />);
    fireEvent.click(trigger());
    fill('Ana', 'ana@studio.com');
    fireEvent.click(send());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');

    await act(async () => reject(new Error('offline')));
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('didn’t send');
  });

  it('keeps a valid topic when the topics change', async () => {
    const onSend = vi.fn();
    const { rerender } = render(<CtaContactMorph topics={['a website']} onSend={onSend} />);
    rerender(<CtaContactMorph topics={['a shop', 'a brand']} onSend={onSend} />);
    fireEvent.click(trigger());
    fill('Ana', 'ana@studio.com');

    await act(async () => fireEvent.click(send()));
    expect(onSend).toHaveBeenCalledWith(expect.objectContaining({ topic: 'a shop' }));
  });

  it('springs open when motion is allowed', () => {
    setReducedMotion(false);
    render(<CtaContactMorph />);

    fireEvent.click(trigger());
    expect(panel().style.visibility).toBe('inherit');
  });
});
