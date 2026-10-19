import type { SVGProps } from 'react';

export const ClaudeMark = (props: SVGProps<SVGSVGElement>) => {
  // Sunburst mark, drawn as radiating spokes.
  return (
    <svg viewBox="0 0 24 24" fill="#D97757" aria-hidden="true" {...props}>
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <rect
          key={a}
          x="11.1"
          y="2.5"
          width="1.8"
          height="19"
          rx="0.9"
          transform={`rotate(${a} 12 12)`}
        />
      ))}
    </svg>
  );
};
