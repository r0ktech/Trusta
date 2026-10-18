import { TONES } from '../ui/tones';

// A Nigerian street at the foot of the hero: shopfronts with painted signs,
// electricity poles and sagging wires, a keke and a danfo passing through.
// Decorative only — hidden from assistive tech, frozen by the pause control
// and for reduced-motion users (see .loop-anim in index.css).

const GROUND = 120;

// x, width, height, sign tone, awning tone
const SHOPS = [
  [0, 120, 70, 'ochre', 'forest'],
  [128, 90, 92, 'indigo', 'kola'],
  [226, 140, 60, 'kola', 'ochre'],
  [374, 100, 84, 'forest', 'indigo'],
  [482, 76, 54, 'cream', 'leaf'],
  [566, 150, 96, 'charcoal', 'ochre'],
  [724, 104, 66, 'ochre', 'kola'],
  [836, 88, 88, 'leaf', 'charcoal'],
  [932, 132, 58, 'indigo', 'forest'],
  [1072, 96, 80, 'kola', 'ochre'],
  [1176, 120, 64, 'forest', 'indigo'],
  [1304, 136, 90, 'ochre', 'leaf'],
];

const POLES = [60, 420, 780, 1140, 1440];

function Shop({ x, w, h, sign, awning }) {
  const top = GROUND - h;
  const s = TONES[sign];
  const a = TONES[awning];
  const doorW = Math.min(26, w * 0.28);
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} rx="2" className="fill-[rgb(var(--line))]" />
      {/* painted sign across the top */}
      <rect x={x + 8} y={top + 8} width={w - 16} height={14} rx="1.5" fill={s.board} />
      <rect x={x + 14} y={top + 13} width={(w - 28) * 0.6} height={4} rx="1" fill={s.ink} opacity="0.75" />
      {/* upper windows on taller buildings */}
      {h > 75 &&
        Array.from({ length: Math.floor((w - 16) / 22) }, (_, i) => (
          <rect key={i} x={x + 10 + i * 22} y={top + 30} width={12} height={12} rx="1" className="fill-[rgb(var(--surface-2))]" />
        ))}
      {/* striped awning */}
      <path d={`M${x + 4} ${GROUND - 34} h${w - 8} l6 10 h${-(w + 4)} z`} fill={a.board} />
      <path d={`M${x + 4} ${GROUND - 34} h${w - 8} l6 10 h${-(w + 4)} z`} fill={`url(#awning-stripes)`} opacity="0.35" />
      {/* door */}
      <rect x={x + w / 2 - doorW / 2} y={GROUND - 22} width={doorW} height={22} className="fill-[rgb(var(--subtle))]" opacity="0.55" />
    </g>
  );
}

function Wheel({ cx, r }) {
  return (
    <g>
      <circle cx={cx} cy={0} r={r} fill="#1F2523" />
      <g className="anim-wheel">
        <circle cx={cx} cy={0} r={r * 0.45} fill="#A9B1AD" />
        <path d={`M${cx - r * 0.7} 0 H${cx + r * 0.7} M${cx} ${-r * 0.7} V${r * 0.7}`} stroke="#1F2523" strokeWidth="1.2" />
      </g>
    </g>
  );
}

// Facing right. Local origin is the road surface at the rear.
function Keke() {
  return (
    <g className="anim-bump">
      <circle cx="-4" cy="-6" r="3" className="anim-exhaust fill-[rgb(var(--subtle))]" />
      <circle cx="-4" cy="-6" r="3" className="anim-exhaust fill-[rgb(var(--subtle))]" style={{ animationDelay: '0.55s' }} />
      <rect x="6" y="-42" width="48" height="5" rx="2" fill="#1F2523" />
      <path d="M10 -37 V-20 M50 -37 V-20" stroke="#1F2523" strokeWidth="2" />
      <path d="M50 -37 L60 -21 H51 Z" fill="#9CC7D9" opacity="0.85" />
      <path d="M3 -20 H54 Q64 -20 66 -9 V-5 H1 V-16 Q1 -20 3 -20 Z" fill="#F2B705" />
      <rect x="1" y="-13" width="65" height="3" fill="#2E7D4F" />
      <circle cx="30" cy="-28" r="4" fill="#3A2A20" />
      <Wheel cx={14} r={6} />
      <Wheel cx={56} r={6} />
    </g>
  );
}

// Facing left: the yellow-and-black Lagos danfo.
function Danfo() {
  return (
    <g className="anim-bump" style={{ animationDuration: '0.5s' }}>
      <circle cx="122" cy="-7" r="3.5" className="anim-exhaust fill-[rgb(var(--subtle))]" style={{ animationName: 'exhaust-right' }} />
      <rect x="0" y="-48" width="118" height="40" rx="7" fill="#F2B705" />
      <path d="M0 -38 Q2 -48 12 -48 H16 V-30 H0 Z" fill="#2B3A67" opacity="0.85" />
      {[22, 42, 62, 82].map((x) => (
        <rect key={x} x={x} y="-43" width="16" height="13" rx="2" fill="#2B3A67" opacity="0.85" />
      ))}
      <rect x="0" y="-24" width="118" height="4" fill="#1F2523" />
      <rect x="0" y="-16" width="118" height="2.5" fill="#1F2523" />
      <rect x="102" y="-43" width="12" height="18" rx="2" fill="#2B3A67" opacity="0.6" />
      <Wheel cx={24} r={8} />
      <Wheel cx={94} r={8} />
    </g>
  );
}

export function StreetScene({ className }) {
  return (
    <svg
      viewBox="0 0 1440 150"
      preserveAspectRatio="xMidYMax slice"
      className={`loop-anim pointer-events-none block h-[110px] w-full sm:h-[130px] ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="awning-stripes" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="6" height="12" fill="#fff" />
        </pattern>
      </defs>

      <g opacity="0.9">
        {SHOPS.map(([x, w, h, sign, awning]) => (
          <Shop key={x} x={x} w={w} h={h} sign={sign} awning={awning} />
        ))}
      </g>

      {/* poles and sagging wires */}
      <g className="stroke-[rgb(var(--subtle))]" fill="none" opacity="0.55">
        {POLES.map((x) => (
          <g key={x}>
            <path d={`M${x} ${GROUND} V8`} strokeWidth="3" />
            <path d={`M${x - 12} 16 H${x + 12}`} strokeWidth="2.5" />
          </g>
        ))}
        <g className="anim-wire">
          {POLES.slice(0, -1).map((x, i) => (
            <g key={x} strokeWidth="1.2">
              <path d={`M${x - 10} 16 Q${(x + POLES[i + 1]) / 2} 40 ${POLES[i + 1] - 10} 16`} />
              <path d={`M${x + 10} 16 Q${(x + POLES[i + 1]) / 2} 34 ${POLES[i + 1] + 10} 16`} />
            </g>
          ))}
        </g>
      </g>

      {/* road */}
      <rect x="0" y={GROUND} width="1440" height="30" className="fill-[rgb(var(--surface-2))]" />
      <path d={`M0 ${GROUND + 15} H1440`} strokeDasharray="22 18" strokeWidth="2" className="stroke-[rgb(var(--line))]" />

      {/* traffic: the keke in the far lane, the danfo in front */}
      <g transform={`translate(0 ${GROUND + 11})`}>
        <g className="anim-drive-right" style={{ animationDelay: '-4s' }}>
          <g transform="scale(1.25)">
            <Keke />
          </g>
        </g>
      </g>
      <g transform={`translate(0 ${GROUND + 20})`}>
        <g className="anim-drive-left" style={{ animationDelay: '-11s' }}>
          <g transform="scale(1.15)">
            <Danfo />
          </g>
        </g>
      </g>
    </svg>
  );
}
