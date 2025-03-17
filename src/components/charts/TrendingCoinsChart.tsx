// src/components/charts/TrendingCoinsChart.tsx
"use client";

import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { MemCoin } from "@/types";

// Rejestracja modułów Chart.js
Chart.register(...registerables);

interface TrendingCoinsChartProps {
  coins: MemCoin[];
}

export const TrendingCoinsChart: React.FC<TrendingCoinsChartProps> = ({
  coins,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !coins.length) return;

    // Zniszcz poprzedni wykres, jeśli istnieje
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Przygotuj dane
    const sortedCoins = [...coins].sort(
      (a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h
    );

    const labels = sortedCoins.map((coin) => coin.symbol);
    const data = sortedCoins.map((coin) => coin.priceChangePercentage24h);

    // Ustal kolory słupków (zielony dla dodatnich, czerwony dla ujemnych)
    const backgroundColors = data.map((value) =>
      value >= 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
    );
    const borderColors = data.map((value) =>
      value >= 0 ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)"
    );

    // Utwórz wykres
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Zmiana ceny 24h (%)",
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return sortedCoins[index].name;
              },
              label: (context) => {
                const value = context.raw as number;
                return `${value.toFixed(2)}%`;
              },
              afterLabel: (context) => {
                const index = context.dataIndex;
                const coin = sortedCoins[index];
                return `Cena: $${formatPrice(coin.currentPrice)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Zmiana ceny 24h (%)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Symbol",
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
  }, [coins]);

  // Funkcja do formatowania ceny
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

  return (
    <div className="h-64 w-full">
      {coins.length > 0 ? (
        <canvas ref={chartRef} height="256" />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Brak danych do wyświetlenia</p>
        </div>
      )}
    </div>
  );
};
