export type Point = Readonly<{ x: number; y: number }>;

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const colors = {
  ink: '#12161f',
  teal: '#045f64',
  tealSoft: '#9fd4d6',
  lime: '#c6f56f',
  white: '#ffffff',
} as const;

export const SANS_FAMILY = 'Outfit';
export const MONO_FAMILY = 'Geist Mono';
export const GRID_STEP = 48;
