import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useFormat } from '@/lib/format';
import { useSettings } from '@/providers/SettingsProvider';
import { sum } from '@/lib/utils';

export interface DonutSlice {
  category: string;
  amount: number;
  percent: number;
}

export function ExpenseDonut({ data, totalLabel = 'Total spend' }: { data: DonutSlice[]; totalLabel?: string }) {
  const { chart } = useSettings();
  const f = useFormat();
  const total = sum(data.map((d) => d.amount));
  const summary = data.map((d) => `${d.category} ${d.percent}%`).join(', ');

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto h-[176px] w-[176px]" role="img" aria-label={`${totalLabel}: ${summary}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={58}
              outerRadius={84}
              startAngle={90}
              endAngle={-270}
              paddingAngle={1.5}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={d.category} fill={chart.palette[i % chart.palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{f.compact(total)}</span>
          <span className="text-xs text-muted">{totalLabel}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.category} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: chart.palette[i % chart.palette.length] }} />
            <span className="flex-1">{d.category}</span>
            <span className="w-10 text-right text-muted">{d.percent}%</span>
            <span className="w-[92px] text-right font-semibold">{f.moneyShort(d.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
