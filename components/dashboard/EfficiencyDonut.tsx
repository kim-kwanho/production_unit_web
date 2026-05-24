"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatEnergy, formatPercent } from "@/lib/format";

interface EfficiencyDonutProps {
  percent: number;
  finished: number;
  plant: number;
  energyAtLimit: boolean;
}

export default function EfficiencyDonut({
  percent,
  finished,
  plant,
  energyAtLimit,
}: EfficiencyDonutProps) {
  const filled = Math.min(100, Math.max(0, percent));
  const data =
    filled <= 0
      ? [{ name: "remainder", value: 100 }]
      : [
          { name: "efficiency", value: filled },
          { name: "remainder", value: Math.max(0.001, 100 - filled) },
        ];

  const fillColor = energyAtLimit ? "#ef4444" : "#22c55e";

  return (
    <div
      className={`rounded-xl border p-4 ${
        energyAtLimit
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
      }`}
    >
      <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        공장 효율
      </h2>
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={fillColor} />
              <Cell fill="#cbd5e1" className="dark:fill-slate-700" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-bold ${
              energyAtLimit
                ? "text-red-600 dark:text-red-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {formatPercent(percent)}
          </span>
          <span
            className={`text-xs ${
              energyAtLimit
                ? "text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            완제품 {finished} / 에너지 {formatEnergy(plant)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        min(100, (완제품/에너지)×1000) · 라인 상 검사기 합산
      </p>
    </div>
  );
}
