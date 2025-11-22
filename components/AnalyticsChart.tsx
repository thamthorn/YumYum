"use client";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { AnalyticsEventType } from "@/types/platform";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
  }[];
}

interface AnalyticsChartProps {
  data: AnalyticsChartData;
  type?: "line" | "bar";
  title?: string;
  height?: number;
}

export function AnalyticsChart({
  data,
  type = "line",
  title,
  height = 300,
}: AnalyticsChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const ChartComponent = type === "line" ? Line : Bar;

  return (
    <div style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={options} />
    </div>
  );
}

interface EventTypeStats {
  eventType: AnalyticsEventType;
  count: number;
  label: string;
}

interface EventTypeChartProps {
  events: EventTypeStats[];
}

export function EventTypeChart({ events }: EventTypeChartProps) {
  const data: AnalyticsChartData = {
    labels: events.map((e) => e.label),
    datasets: [
      {
        label: "Event Count",
        data: events.map((e) => e.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)", // blue
          "rgba(16, 185, 129, 0.5)", // green
          "rgba(168, 85, 247, 0.5)", // purple
          "rgba(251, 146, 60, 0.5)", // orange
          "rgba(239, 68, 68, 0.5)", // red
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(168, 85, 247)",
          "rgb(251, 146, 60)",
          "rgb(239, 68, 68)",
        ],
      },
    ],
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Engagement by Type
      </h3>
      <AnalyticsChart data={data} type="bar" height={300} />
    </div>
  );
}
