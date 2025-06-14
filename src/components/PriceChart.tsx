"use client";

import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip);

export default function PriceChart({ prices }: { prices: [number, number][] }) {
  const data = {
    labels: prices.map((p) => p[0]),
    datasets: [
      {
        label: "Price (USD)",
        data: prices.map((p) => p[1]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
