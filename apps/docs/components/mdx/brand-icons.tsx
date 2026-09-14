import type { SVGProps } from 'react';

/**
 * Monochrome brand marks for the "Open in" menu. Rendered in currentColor so
 * they sit consistently in the dropdown. GitHub and OpenAI use their official
 * vector paths; Claude, Cursor and T3 use clean recognizable marks.
 *
 * GitHub's mark also appears in the site header and hero, so it lives in
 * `components/icons` and is re-exported here for the "Open in" menu.
 */

export { GithubMark } from '@/components/icons/github-mark';

export function OpenAIMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#10A37F" aria-hidden="true" {...props}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9a6.0651 6.0651 0 0 0-10.3096 2.9a5.9847 5.9847 0 0 0-3.9977 2.9a6.0462 6.0462 0 0 0 .7427 7.0966a5.98 5.98 0 0 0 .511 4.9107a6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058a5.9894 5.9894 0 0 0 3.9977-2.9001a6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.1419.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z" />
    </svg>
  );
}

export function ClaudeMark(props: SVGProps<SVGSVGElement>) {
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
}

export function CursorMark(props: SVGProps<SVGSVGElement>) {
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
}

export function ReactMark(props: SVGProps<SVGSVGElement>) {
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
}

export function T3Mark(props: SVGProps<SVGSVGElement>) {
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
}
