import type { SVGProps } from 'react';

export const ReactMark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="-11.5 -10.23 23 20.46" fill="none" aria-hidden="true" {...props}>
      <circle r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
};
