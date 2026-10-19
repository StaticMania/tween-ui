import { GRID_STEP, OG_IMAGE_SIZE } from '@/lib/og-image/og-theme';

export const GridBackdrop = () => {
  const columns = Math.ceil(OG_IMAGE_SIZE.width / GRID_STEP);
  const rows = Math.ceil(OG_IMAGE_SIZE.height / GRID_STEP);

  return (
    <svg
      width={OG_IMAGE_SIZE.width}
      height={OG_IMAGE_SIZE.height}
      viewBox={`0 0 ${OG_IMAGE_SIZE.width} ${OG_IMAGE_SIZE.height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {Array.from({ length: columns }, (_, index) => (
        <line
          key={`column-${index}`}
          x1={index * GRID_STEP + 0.5}
          y1={0}
          x2={index * GRID_STEP + 0.5}
          y2={OG_IMAGE_SIZE.height}
          stroke="rgba(159, 212, 214, 0.06)"
        />
      ))}
      {Array.from({ length: rows }, (_, index) => (
        <line
          key={`row-${index}`}
          x1={0}
          y1={index * GRID_STEP + 0.5}
          x2={OG_IMAGE_SIZE.width}
          y2={index * GRID_STEP + 0.5}
          stroke="rgba(159, 212, 214, 0.045)"
        />
      ))}
    </svg>
  );
};
