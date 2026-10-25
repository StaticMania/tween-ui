import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectHoverReveal from '@/registry/tweenui/project-hover-reveal';

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

const item = (title: string, role: string, href: string, image: string) => ({
  title,
  role,
  timeline: '6 Months',
  year: '2025',
  team: 'In-House Studio',
  image,
  href,
});

const ITEMS = [
  item('Northwind', 'Branding', '/work/a', '/a.jpg'),
  item('Kairo', 'Web', '/work/b', '/b.jpg'),
  item('Atlas', 'Motion', '/work/c', '/c.jpg'),
];

const link = (name: string) => screen.getByRole('link', { name: new RegExp(`^${name}`) });
const row = (name: string) => link(name).closest('[data-project-row]') as HTMLElement;
const stageImage = (name: string) =>
  document.querySelector(`[data-project-image][alt="${name}"]`) as HTMLElement;
const roleValue = (role: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-project-value]')).find(
    (value) => value.textContent === role
  ) as HTMLElement;

describe('Project Hover Reveal', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('renders every project as a real link that names its role and year', () => {
    render(<ProjectHoverReveal items={ITEMS} />);

    for (const { title, role, href } of ITEMS) {
      expect(link(title).tagName).toBe('A');
      expect(link(title)).toHaveAttribute('href', href);
      expect(link(title)).toHaveAccessibleName(`${title} ${role}, 2025`);
    }
    expect(screen.getByText('03', { selector: 'p' })).toBeInTheDocument();
  });

  it('takes image alt text from each title', () => {
    render(<ProjectHoverReveal items={ITEMS} />);

    for (const { title } of ITEMS) {
      expect(screen.getAllByAltText(title).length).toBeGreaterThan(0);
    }
  });

  it('starts on the first project', () => {
    render(<ProjectHoverReveal items={ITEMS} />);

    expect(row('Northwind')).toHaveAttribute('data-active', 'true');
    expect(stageImage('Northwind').style.opacity).toBe('1');
    expect(roleValue('Branding').style.opacity).toBe('1');
    expect(roleValue('Web').style.visibility).toBe('hidden');
  });

  it('switches the image and details at once under reduced motion', () => {
    render(<ProjectHoverReveal items={ITEMS} />);

    fireEvent.pointerMove(link('Atlas'), { clientX: 40, clientY: 120 });

    expect(row('Atlas')).toHaveAttribute('data-active', 'true');
    expect(row('Northwind')).toHaveAttribute('data-active', 'false');
    expect(gsap.isTweening(stageImage('Atlas'))).toBe(false);
    expect(stageImage('Atlas').style.opacity).toBe('1');
    expect(stageImage('Northwind').style.visibility).toBe('hidden');
    expect(roleValue('Motion').style.opacity).toBe('1');
    expect(roleValue('Branding').style.visibility).toBe('hidden');
  });

  it('opens the new image as a circle over the old one', () => {
    setReducedMotion(false);
    render(<ProjectHoverReveal items={ITEMS} />);

    fireEvent.pointerMove(link('Kairo'), { clientX: 40, clientY: 80 });

    expect(gsap.getTweensOf(stageImage('Kairo'))).toHaveLength(1);
    expect(stageImage('Kairo').style.clipPath).toBe('circle(0% at 0% 50%)');
    expect(stageImage('Northwind').style.clipPath).toBe('inset(0% 0% 0% 0%)');
    expect(stageImage('Northwind').style.opacity).toBe('1');
    expect(Number(stageImage('Kairo').style.zIndex)).toBeGreaterThan(
      Number(stageImage('Northwind').style.zIndex)
    );
  });

  it('switches project on keyboard focus', () => {
    render(<ProjectHoverReveal items={ITEMS} />);

    act(() => link('Atlas').focus());

    expect(row('Atlas')).toHaveAttribute('data-active', 'true');
    expect(stageImage('Atlas').style.opacity).toBe('1');
  });
});
