import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullScreenPreview } from '@/components/preview/full-screen-preview';

const open = () => {
  render(<FullScreenPreview name="grid-cascade" title="Grid Cascade" />);
  fireEvent.click(screen.getByRole('button', { name: /Full screen/ }));
};

describe('Full screen preview', () => {
  it('opens a dialog framing the block preview route', () => {
    open();

    expect(screen.getByRole('dialog', { name: 'Grid Cascade, full screen' })).toBeInTheDocument();
    expect(screen.getByTitle('Grid Cascade preview')).toHaveAttribute(
      'src',
      '/preview/grid-cascade'
    );
  });

  it('closes from the close button', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Close full screen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape while focus is on the doc page', () => {
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape pressed inside the iframe', () => {
    open();
    const frame = screen.getByTitle('Grid Cascade preview') as HTMLIFrameElement;

    fireEvent.load(frame);
    fireEvent.keyDown(frame.contentWindow as Window, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ignores other keys inside the iframe', () => {
    open();
    const frame = screen.getByTitle('Grid Cascade preview') as HTMLIFrameElement;

    fireEvent.load(frame);
    fireEvent.keyDown(frame.contentWindow as Window, { key: 'Enter' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
