"use client";

import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatEnergy, formatPercent } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

interface EfficiencyDonutProps {
  percent: number;
  finished: number;
  plant: number;
  energyAtLimit: boolean;
  compact?: boolean;
}

function EfficiencyDonut({
  percent,
  finished,
  plant,
  energyAtLimit,
  compact = false,
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
    <Card
      className={
        energyAtLimit
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          : undefined
      }
    >
      <CardContent className={compact ? "p-3" : "p-4"}>
        <h2
          className={`font-semibold text-slate-800 dark:text-slate-100 ${
            compact ? "mb-1 text-xs" : "mb-2 text-sm"
          }`}
        >
          공장 효율
        </h2>
        <div className={`relative ${compact ? "h-32" : "h-48"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={compact ? 42 : 55}
                outerRadius={compact ? 58 : 75}
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
              className={`font-bold ${compact ? "text-xl" : "text-2xl"} ${
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
        <p
          className={`text-center text-slate-500 dark:text-slate-400 ${
            compact ? "mt-1 text-[10px]" : "mt-2 text-xs"
          }`}
        >
          min(100, (완제품/에너지)×1000) · 라인 상 검사기 합산
        </p>
      </CardContent>
    </Card>
  );
}

export default memo(EfficiencyDonut);
