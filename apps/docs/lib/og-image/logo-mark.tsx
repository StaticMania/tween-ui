import { colors } from '@/lib/og-image/og-theme';

export const LogoMark = ({ size }: { size: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill={colors.teal} />
      <path
        d="M5 19 C 9.5 8.9, 5 5, 19 5"
        fill="none"
        stroke={colors.lime}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19" cy="5" r="1.8" fill={colors.lime} />
    </svg>
  );
};
