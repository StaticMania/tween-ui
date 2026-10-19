import { colors, type Point } from '@/lib/og-image/og-theme';

const CURVE_POINTS = [
  { x: 0, y: 400 },
  { x: 128, y: 112 },
  { x: 0, y: 0 },
  { x: 400, y: 0 },
] as const satisfies readonly Point[];
const RIDERS = [
  { id: 'trail-b', at: 0.62, radius: 5, opacity: 0.35 },
  { id: 'trail-a', at: 0.7, radius: 5.5, opacity: 0.55 },
  { id: 'halo', at: 0.78, radius: 18, opacity: 0.25 },
  { id: 'head', at: 0.78, radius: 8.5, opacity: 1 },
] as const;

export const EaseCurve = () => {
  const [start, controlA, controlB, end] = CURVE_POINTS;
  const path = `M${start.x} ${start.y} C${controlA.x} ${controlA.y} ${controlB.x} ${controlB.y} ${end.x} ${end.y}`;

  return (
    <svg width={330} height={330} viewBox="-30 -30 460 460">
      <line x1="0" y1="400" x2="400" y2="400" stroke="rgba(159, 212, 214, 0.3)" strokeWidth="2" />
      <line x1="0" y1="400" x2="0" y2="0" stroke="rgba(159, 212, 214, 0.3)" strokeWidth="2" />
      <line
        x1="0"
        y1="400"
        x2="400"
        y2="0"
        stroke="rgba(159, 212, 214, 0.2)"
        strokeWidth="2"
        strokeDasharray="6 9"
      />
      <line
        x1={start.x}
        y1={start.y}
        x2={controlA.x}
        y2={controlA.y}
        stroke="rgba(159, 212, 214, 0.45)"
        strokeWidth="2"
        strokeDasharray="5 7"
      />
      <line
        x1={end.x}
        y1={end.y}
        x2={controlB.x}
        y2={controlB.y}
        stroke="rgba(159, 212, 214, 0.45)"
        strokeWidth="2"
        strokeDasharray="5 7"
      />
      <circle
        cx={controlA.x}
        cy={controlA.y}
        r="7"
        fill={colors.ink}
        stroke={colors.tealSoft}
        strokeWidth="2.5"
      />
      <circle
        cx={controlB.x}
        cy={controlB.y}
        r="7"
        fill={colors.ink}
        stroke={colors.tealSoft}
        strokeWidth="2.5"
      />
      <path d={path} fill="none" stroke={colors.tealSoft} strokeWidth="4" strokeLinecap="round" />
      {RIDERS.map((rider) => {
        const point = pointOnCurve(rider.at);
        return (
          <circle
            key={rider.id}
            cx={point.x}
            cy={point.y}
            r={rider.radius}
            fill={colors.lime}
            fillOpacity={rider.opacity}
          />
        );
      })}
    </svg>
  );
};

function pointOnCurve(at: number): Point {
  const [start, controlA, controlB, end] = CURVE_POINTS;
  const rest = 1 - at;
  const weights = [rest ** 3, 3 * rest ** 2 * at, 3 * rest * at ** 2, at ** 3] as const;

  return {
    x:
      weights[0] * start.x + weights[1] * controlA.x + weights[2] * controlB.x + weights[3] * end.x,
    y:
      weights[0] * start.y + weights[1] * controlA.y + weights[2] * controlB.y + weights[3] * end.y,
  };
}
