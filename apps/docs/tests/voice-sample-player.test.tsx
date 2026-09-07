import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VoiceSamplePlayer from '@/registry/tweenui/media/voice-sample-player';

describe('Voice Sample Player', () => {
  it('renders the name and a play button', () => {
    render(<VoiceSamplePlayer name="Ada Lovelace" description="warm & precise" />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play ada lovelace/i })).toBeInTheDocument();
  });

  it('toggles play/pause when uncontrolled', () => {
    render(<VoiceSamplePlayer name="Ada Lovelace" />);
    const btn = screen.getByRole('button', { name: /play ada lovelace/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /pause ada lovelace/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('calls onPlayingChange with the next state', () => {
    const onPlayingChange = vi.fn();
    render(<VoiceSamplePlayer name="Ada Lovelace" onPlayingChange={onPlayingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
  });

  it('falls back to name initials when no avatar is given', () => {
    render(<VoiceSamplePlayer name="Ada Lovelace" />);
    expect(screen.getByText('AD')).toBeInTheDocument();
  });
});
