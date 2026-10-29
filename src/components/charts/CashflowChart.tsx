import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeriesPoint } from '@/data/selectors';
import type { Granularity } from '@/lib/date';
import { useFormat } from '@/lib/format';
import { useSettings } from '@/providers/SettingsProvider';

interface TooltipEntry {
  dataKey?: string | number;
  value?: number;
  color?: string;
}

export function CashflowChart({ points, granularity }: { points: SeriesPoint[]; granularity: Granularity }) {
  const { chart } = useSettings();
  const f = useFormat();
  const label = (k: string) =>
    granularity === 'month' ? (points.length > 12 ? f.monthYear(k) : f.month(k)) : f.shortDate(k);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={3} barCategoryGap={points.length > 20 ? '20%' : '28%'}>
          <CartesianGrid vertical={false} stroke={chart.grid} />
          <XAxis
            dataKey="key"
            tickFormatter={label}
            tick={{ fill: chart.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chart.grid }}
            minTickGap={12}
          />
          <YAxis
            tickFormatter={(v: number) => f.compact(v)}
            tick={{ fill: chart.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ fill: chart.grid, opacity: 0.6 }}
            content={({ active, payload, label: key }) => {
              if (!active || !payload?.length) return null;
              const rows = payload as unknown as TooltipEntry[];
              return (
                <div className="card min-w-[180px] p-3 text-sm shadow-pop">
                  <p className="mb-2 font-semibold">
                    {granularity === 'week' ? `Week of ${f.shortDate(String(key))}` : granularity === 'month' ? f.monthYear(String(key)) : f.date(String(key))}
                  </p>
                  {rows.map((p) => (
                    <p key={String(p.dataKey)} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-muted">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
                        {p.dataKey === 'revenue' ? 'Revenue' : 'Expenses'}
                      </span>
                      <span className="font-semibold">{f.money(Number(p.value ?? 0))}</span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Bar dataKey="revenue" name="Revenue" fill={chart.primary} radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expenses" name="Expenses" fill={chart.expense} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
