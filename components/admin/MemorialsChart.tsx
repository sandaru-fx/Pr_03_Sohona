"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

type MemorialsChartProps = {
  data: { month: string; count: number }[];
};

export function MemorialsChart({ data }: MemorialsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CBA258" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#CBA258" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2E33" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#181C20", 
              border: "1px solid #2A2E33",
              borderRadius: "8px",
              color: "#F5F1E8"
            }}
            itemStyle={{ color: "#CBA258" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="New Memorials"
            stroke="#CBA258"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
