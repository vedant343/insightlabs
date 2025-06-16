"use client";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend
);

export default function PriceChart({ prices }: { prices: [number, number][] }) {
  const data = {
    labels: prices.map((p) => new Date(p[0])),
    datasets: [
      {
        label: "Price (USD)",
        data: prices.map((p) => p[1]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "7-Day Price Chart",
        font: {
          size: 16,
        },
      },
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM d",
          },
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Price (USD)",
        },
        ticks: {
          callback: function (tickValue: number | string) {
            if (typeof tickValue === "number") {
              return "$" + tickValue.toLocaleString();
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}
