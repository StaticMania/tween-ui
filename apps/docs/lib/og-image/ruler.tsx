import { TWEEN_EASE } from '@/lib/motion';
import { colors, MONO_FAMILY } from '@/lib/og-image/og-theme';

const RULER_TICKS = Array.from({ length: 25 }, (_, index) => index);
const RULER_KEYFRAMES = [0.08, 0.25, 0.5, 0.66] as const;
const PLAYHEAD_AT = 0.72;

export const Ruler = ({ siteHost }: { siteHost: string }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: MONO_FAMILY,
          fontSize: 18,
          color: 'rgba(159, 212, 214, 0.75)',
        }}
      >
        <span>{siteHost}</span>
        <span>{`cubic-bezier(${TWEEN_EASE})`}</span>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          height: 26,
          borderTop: '1px solid rgba(159, 212, 214, 0.25)',
        }}
      >
        {RULER_TICKS.map((tick) => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(tick / (RULER_TICKS.length - 1)) * 100}%`,
              width: 1,
              height: tick % 2 === 0 ? 12 : 6,
              backgroundColor: 'rgba(159, 212, 214, 0.45)',
            }}
          />
        ))}
        {RULER_KEYFRAMES.map((at) => (
          <div
            key={at}
            style={{
              position: 'absolute',
              top: -6,
              left: `${at * 100}%`,
              width: 11,
              height: 11,
              marginLeft: -5.5,
              borderRadius: 1.5,
              transform: 'rotate(45deg)',
              backgroundColor: at < PLAYHEAD_AT ? colors.lime : 'rgba(159, 212, 214, 0.35)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: -1,
            bottom: 0,
            left: `${PLAYHEAD_AT * 100}%`,
            width: 2,
            backgroundColor: colors.lime,
            boxShadow: `0 0 14px ${colors.lime}`,
          }}
        />
      </div>
    </div>
  );
};
