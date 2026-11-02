import { fireEvent, render, screen, within } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MorphingSearch, { type MorphingSearchProps } from '@/registry/tweenui/morphing-search';

const suggestions = ['dashboards', 'data tables', 'dark mode', 'onboarding', 'settings'];

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
  }));
};

const setup = (props: MorphingSearchProps = {}) => {
  const utils = render(
    <MorphingSearch
      label="Search inspiration"
      placeholder="Search inspiration"
      defaultRecents={['dashboards', 'empty states']}
      suggestions={suggestions}
      {...props}
    />
  );
  const field = screen.getByRole('combobox', { name: 'Search inspiration' });
  return { ...utils, field };
};

const options = () => within(screen.getByRole('listbox')).getAllByRole('option');
const labels = () => options().map((option) => option.textContent);
const chipButtons = () => screen.queryAllByRole('button', { name: /^Remove filter / });

describe('Morphing Search', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a closed combobox with the keyboard hint attached', () => {
    const { field } = setup();
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    const hint = document.getElementById(field.getAttribute('aria-describedby') ?? '');
    expect(hint).toHaveTextContent('Press Enter to add a filter');
  });

  it('opens on focus and lists recent searches', () => {
    const { field } = setup();
    fireEvent.focus(field);
    expect(field).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Recent searches' })).toBeInTheDocument();
    expect(labels()).toEqual(['dashboards', 'empty states']);
    expect(options()[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('lists the typed text first, then matches with the match in bold', () => {
    const { field } = setup({ maxSuggestions: 3 });
    fireEvent.change(field, { target: { value: 'da' } });
    expect(screen.getByRole('listbox', { name: 'Suggestions' })).toBeInTheDocument();
    expect(labels()).toEqual(['da', 'dashboards', 'data tables', 'dark mode']);
    expect(options()[1]?.querySelector('strong')).toHaveTextContent('da');
  });

  it('moves through the rows with the arrow keys and wraps', () => {
    const { field } = setup();
    fireEvent.focus(field);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(options()[1]).toHaveAttribute('aria-selected', 'true');
    expect(field).toHaveAttribute('aria-activedescendant', options()[1]?.id);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(options()[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('adds the highlighted row as a chip on Enter and clears the field', () => {
    const onChipsChange = vi.fn();
    const { field } = setup({ onChipsChange });
    fireEvent.change(field, { target: { value: 'set' } });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onChipsChange).toHaveBeenLastCalledWith(['settings']);
    expect(screen.getByRole('button', { name: 'Remove filter settings' })).toBeInTheDocument();
    expect(field).toHaveValue('');
    expect(labels()).not.toContain('settings');
  });

  it('adds a chip when a row is clicked', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'tab' } });
    const row = options()[1];
    if (row) fireEvent.click(row);
    expect(screen.getByRole('button', { name: 'Remove filter data tables' })).toBeInTheDocument();
  });

  it('marks the last chip on Backspace and removes it on the second press', () => {
    const { field } = setup({ defaultChips: ['onboarding', 'settings'] });
    fireEvent.focus(field);
    fireEvent.keyDown(field, { key: 'Backspace' });
    expect(chipButtons()).toHaveLength(2);
    expect(
      screen.getByText('settings selected. Press Backspace again to remove it.')
    ).toBeInTheDocument();
    fireEvent.keyDown(field, { key: 'Backspace' });
    expect(chipButtons()).toHaveLength(1);
    expect(screen.getByText('Removed filter settings')).toBeInTheDocument();
  });

  it('removes a chip from its button', () => {
    setup({ defaultChips: ['onboarding'] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter onboarding' }));
    expect(chipButtons()).toHaveLength(0);
  });

  it('stops at maxChips and says so', () => {
    const { field } = setup({ defaultChips: ['onboarding'], maxChips: 1 });
    fireEvent.change(field, { target: { value: 'settings' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(chipButtons()).toHaveLength(1);
    expect(screen.getByText('You can add up to 1 filters')).toBeInTheDocument();
  });

  it('clears the text on the first Escape and closes on the second', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'da' } });
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveValue('');
    expect(field).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a pointer down outside', () => {
    const { field } = setup();
    fireEvent.focus(field);
    fireEvent.pointerDown(document.body);
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  it('forgets the highlighted recent with Delete and clears them all', () => {
    const { field } = setup();
    fireEvent.focus(field);
    fireEvent.keyDown(field, { key: 'Delete' });
    expect(labels()).toEqual(['empty states']);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('hides recents that are already chips and brings them back when removed', () => {
    const { field } = setup({ defaultChips: ['dashboards'] });
    fireEvent.focus(field);
    expect(labels()).toEqual(['empty states']);

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove filter dashboards' }));
    expect(labels()).toEqual(['dashboards']);
  });

  it('submits each chip under name', () => {
    const { container } = setup({ defaultChips: ['onboarding', 'settings'], name: 'tags' });
    const hidden = container.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="tags"]'
    );
    expect(Array.from(hidden, (input) => input.value)).toEqual(['onboarding', 'settings']);
  });

  it('blooms the panel and flies the typed word into a hidden chip', () => {
    setReducedMotion(false);
    const { container, field } = setup();
    fireEvent.focus(field);
    const blob = container.querySelector<HTMLElement>('[data-goo] > span:last-child');
    expect(blob && gsap.getTweensOf(blob).length).toBe(1);

    fireEvent.change(field, { target: { value: 'settings' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    const chip = container.querySelector<HTMLElement>('[data-chip="settings"]');
    expect(chip).toHaveClass('opacity-0');
    const ghost = container.querySelector<HTMLElement>('span.w-max');
    expect(ghost).toHaveTextContent('settings');
    expect(ghost && gsap.getTweensOf(ghost).length).toBeGreaterThan(0);
  });

  it('flies a removed chip back to the top of the recent list', () => {
    setReducedMotion(false);
    const { container } = setup({ defaultChips: ['onboarding'] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter onboarding' }));

    expect(labels()[0]).toBe('onboarding');
    expect(options()[0]?.querySelector('[data-term]')).toHaveClass('opacity-0');
    const ghost = container.querySelector<HTMLElement>('span.w-max');
    expect(ghost).toHaveTextContent('onboarding');
    expect(ghost && gsap.getTweensOf(ghost).length).toBeGreaterThan(0);
    const chip = container.querySelector<HTMLElement>('[data-chip="onboarding"]');
    expect(chip && gsap.getTweensOf(chip).length).toBe(1);
  });

  it('puts a removed chip back in the recent list without motion', () => {
    const { field } = setup({ defaultChips: ['onboarding'] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter onboarding' }));
    fireEvent.focus(field);
    expect(labels()).toEqual(['onboarding', 'dashboards', 'empty states']);
  });
});
