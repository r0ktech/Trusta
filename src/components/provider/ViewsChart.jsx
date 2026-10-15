import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Single series, so no legend: the card title names it. #4E9F70 was checked
// for contrast against both the light and dark chart surfaces.
const SERIES = '#4E9F70';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="text-muted">Week of {label}</p>
      <p className="mt-0.5 font-semibold text-ink">{payload[0].value} views (illustrative)</p>
    </div>
  );
}

export function ViewsChart({ data }) {
  return (
    <div className="h-48 w-full" role="img" aria-label={`Illustrative weekly profile views: ${data.map((d) => `${d.week} ${d.views}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES} stopOpacity={0.22} />
              <stop offset="100%" stopColor={SERIES} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" strokeDasharray="3 3" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--subtle))', fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--subtle))', fontSize: 11 }} allowDecimals={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(var(--subtle))', strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="views"
            stroke={SERIES}
            strokeWidth={2}
            fill="url(#viewsFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgb(var(--surface))', fill: SERIES }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
