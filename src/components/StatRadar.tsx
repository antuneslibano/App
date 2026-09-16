import type { Stats } from '../types';
import { STAT_LABELS } from '../types';

const ORDER: (keyof Stats)[] = ['str', 'per', 'agi', 'int', 'vit'];
const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 82;
const MAX_VALUE = 40;

function pointOn(index: number, total: number, value: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (Math.min(value, MAX_VALUE) / MAX_VALUE) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
}

function ringPoints(index: number, total: number, scale: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return [CENTER + RADIUS * scale * Math.cos(angle), CENTER + RADIUS * scale * Math.sin(angle)] as const;
}

export function StatRadar({ stats }: { stats: Stats }) {
  const total = ORDER.length;
  const dataPoints = ORDER.map((key, i) => pointOn(i, total, stats[key]));
  const dataPath = dataPoints.map((p) => p.join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[260px] mx-auto">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={ORDER.map((_, i) => ringPoints(i, total, scale).join(',')).join(' ')}
          fill="none"
          stroke="rgba(96,165,250,0.18)"
          strokeWidth={1}
        />
      ))}
      {ORDER.map((_, i) => {
        const [x, y] = ringPoints(i, total, 1);
        return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="rgba(96,165,250,0.15)" strokeWidth={1} />;
      })}
      <polygon points={dataPath} fill="rgba(59,130,246,0.35)" stroke="#60a5fa" strokeWidth={2} />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#93c5fd" />
      ))}
      {ORDER.map((key, i) => {
        const [x, y] = ringPoints(i, total, 1.32);
        return (
          <text
            key={key}
            x={x}
            y={y}
            fill="#9db4dd"
            fontSize={11}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-display"
          >
            {STAT_LABELS[key].slice(0, 3).toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}
