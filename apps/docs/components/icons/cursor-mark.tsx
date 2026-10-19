import type { SVGProps } from 'react';

export const CursorMark = (props: SVGProps<SVGSVGElement>) => {
  // Isometric cube silhouette.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2 21 7 21 17 12 22 3 17 3 7 Z" />
      <path d="M12 12 21 7M12 12v10M12 12 3 7" />
    </svg>
  );
};
