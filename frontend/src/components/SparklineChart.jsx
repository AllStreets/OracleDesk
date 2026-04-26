import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

export default function SparklineChart({ data, positive }) {
  if (!data || data.length < 2) return null;
  const color = positive ? "#10b981" : "#ef4444";
  const colorDim = positive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${positive ? "pos" : "neg"}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="yes_price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${positive ? "pos" : "neg"})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              return (
                <div className="bg-panel border border-border rounded px-2 py-1 text-[10px] font-mono text-white">
                  {Math.round(payload[0].value * 100)}c
                </div>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
