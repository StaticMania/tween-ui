import type { SVGProps } from 'react';

export const T3Mark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="4" fill="#EC4899" opacity="0.18" />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#EC4899"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        T3
      </text>
    </svg>
  );
};
