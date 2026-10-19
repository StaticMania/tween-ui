import { colors, MONO_FAMILY } from '@/lib/og-image/og-theme';

export const Badge = ({ label }: { label: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderRadius: 999,
        border: '1px solid rgba(159, 212, 214, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        color: colors.tealSoft,
        fontFamily: MONO_FAMILY,
        fontSize: 19,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: colors.lime }} />
      {label}
    </div>
  );
};
