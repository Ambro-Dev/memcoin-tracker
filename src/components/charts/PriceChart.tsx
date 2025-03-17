// src/components/charts/PriceChart.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { PriceHistory } from "@/types";

// Rejestracja niezbędnych komponentów Chart.js
Chart.register(...registerables);

interface PriceChartProps {
  priceHistory: PriceHistory[];
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceHistory }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d" | "24h">(
    "all"
  );

  useEffect(() => {
    if (!chartRef.current || !priceHistory.length) return;

    // Zniszcz poprzedni wykres, jeśli istnieje
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filtruj dane na podstawie wybranego przedziału czasu
    const filteredData = filterDataByTimeframe(priceHistory, timeframe);

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Przygotuj dane do wykresu
    const labels = filteredData.map((item) =>
      new Date(item.timestamp).toLocaleDateString("pl-PL", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    );

    const prices = filteredData.map((item) => item.price);
    const volumes = filteredData.map((item) => item.volume);

    // Określenie koloru linii (zielony jeśli cena wzrosła, czerwony jeśli spadła)
    const firstPrice = prices[0] || 0;
    const lastPrice = prices[prices.length - 1] || 0;
    const priceColor =
      lastPrice >= firstPrice ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)";

    // Utwórz wykres
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Cena",
            data: prices,
            borderColor: priceColor,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: priceColor,
            tension: 0.1,
            yAxisID: "y",
          },
          {
            label: "Wolumen",
            data: volumes,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            type: "bar",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }

                if (context.datasetIndex === 0) {
                  // Formatowanie ceny
                  label += "$" + formatPrice(context.parsed.y);
                } else {
                  // Formatowanie wolumenu
                  label += "$" + formatVolume(context.parsed.y);
                }

                return label;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Cena (USD)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: "Wolumen (USD)",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [priceHistory, timeframe]);

  // Funkcja do filtrowania danych na podstawie przedziału czasu
  const filterDataByTimeframe = (
    data: PriceHistory[],
    tf: string
  ): PriceHistory[] => {
    if (tf === "all" || data.length === 0) return data;

    const now = new Date();
    const filterDate = new Date();

    if (tf === "30d") {
      filterDate.setDate(now.getDate() - 30);
    } else if (tf === "7d") {
      filterDate.setDate(now.getDate() - 7);
    } else if (tf === "24h") {
      filterDate.setDate(now.getDate() - 1);
    }

    return data.filter((item) => new Date(item.timestamp) >= filterDate);
  };

  // Funkcje pomocnicze do formatowania danych
  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return price.toExponential(2);
    }
    return price < 0.01
      ? price.toFixed(8)
      : price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(2) + "B";
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + "M";
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + "K";
    }
    return volume.toFixed(2);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end mb-2 space-x-2">
        <button
          onClick={() => setTimeframe("24h")}
          className={`px-3 py-1 text-sm rounded ${
            timeframe === "24h"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          24h
        </button>
        <button
          onClick={() => setTimeframe("7d")}
          className={`px-3 py-1 text-sm rounded ${
            timeframe === "7d"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          7d
        </button>
        <button
          onClick={() => setTimeframe("30d")}
          className={`px-3 py-1 text-sm rounded ${
            timeframe === "30d"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          30d
        </button>
        <button
          onClick={() => setTimeframe("all")}
          className={`px-3 py-1 text-sm rounded ${
            timeframe === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
      </div>

      {priceHistory.length > 0 ? (
        <div className="flex-1">
          <canvas ref={chartRef} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Brak danych historycznych</p>
        </div>
      )}
    </div>
  );
};
