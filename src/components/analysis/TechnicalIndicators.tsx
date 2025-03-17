/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/analysis/TechnicalIndicators.tsx
"use client";

import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { PriceIndicators } from "@/types";
import { PriceHistory } from "@/types";

// Rejestracja Chart.js
Chart.register(...registerables);

interface TechnicalIndicatorsProps {
  indicators: PriceIndicators;
  priceHistory: PriceHistory[];
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  indicators,
  priceHistory,
}) => {
  const rsiChartRef = useRef<HTMLCanvasElement | null>(null);
  const macdChartRef = useRef<HTMLCanvasElement | null>(null);
  const volumeChartRef = useRef<HTMLCanvasElement | null>(null);

  const rsiChart = useRef<Chart | null>(null);
  const macdChart = useRef<Chart | null>(null);
  const volumeChart = useRef<Chart | null>(null);

  useEffect(() => {
    if (
      !rsiChartRef.current ||
      !macdChartRef.current ||
      !volumeChartRef.current
    )
      return;

    // Zniszcz poprzednie wykresy, jeśli istnieją
    if (rsiChart.current) rsiChart.current.destroy();
    if (macdChart.current) macdChart.current.destroy();
    if (volumeChart.current) volumeChart.current.destroy();

    const rsiCtx = rsiChartRef.current.getContext("2d");
    const macdCtx = macdChartRef.current.getContext("2d");
    const volumeCtx = volumeChartRef.current.getContext("2d");

    if (!rsiCtx || !macdCtx || !volumeCtx) return;

    // Przygotuj dane
    const dates = priceHistory.map((entry) =>
      new Date(entry.timestamp).toLocaleDateString("pl-PL", {
        month: "short",
        day: "numeric",
      })
    );

    // Oblicz symulowane dane dla wykresów (w prawdziwej aplikacji będą to rzeczywiste dane)
    const simulatedRSI = generateSimulatedRSIData(
      priceHistory.length,
      indicators.rsi
    );
    const simulatedMACD = generateSimulatedMACDData(
      priceHistory.length,
      indicators.macd
    );
    const volumes = priceHistory.map((entry) => entry.volume);

    // Wykres RSI
    rsiChart.current = new Chart(rsiCtx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "RSI",
            data: simulatedRSI,
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.2,
            fill: false,
          },
          {
            label: "Wykupienie (70)",
            data: Array(dates.length).fill(70),
            borderColor: "rgba(255, 99, 132, 0.5)",
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            label: "Wyprzedanie (30)",
            data: Array(dates.length).fill(30),
            borderColor: "rgba(54, 162, 235, 0.5)",
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: "RSI",
            },
          },
        },
      },
    });

    // Wykres MACD
    macdChart.current = new Chart(macdCtx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: "MACD Histogram",
            data: simulatedMACD.histogram,
            backgroundColor: simulatedMACD.histogram.map((val) =>
              val >= 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
            ),
            borderColor: simulatedMACD.histogram.map((val) =>
              val >= 0 ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)"
            ),
            borderWidth: 1,
            order: 1,
          },
          {
            label: "MACD Line",
            data: simulatedMACD.macdLine,
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 2,
            pointRadius: 0,
            type: "line",
            order: 0,
          },
          {
            label: "Signal Line",
            data: simulatedMACD.signalLine,
            borderColor: "rgb(255, 159, 64)",
            borderWidth: 2,
            pointRadius: 0,
            type: "line",
            order: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "MACD",
            },
          },
        },
      },
    });

    // Wykres wolumenu
    volumeChart.current = new Chart(volumeCtx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Wolumen",
            data: volumes,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgb(54, 162, 235)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                return "Wolumen: $" + formatVolume(value);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Wolumen (USD)",
            },
          },
        },
      },
    });

    return () => {
      if (rsiChart.current) rsiChart.current.destroy();
      if (macdChart.current) macdChart.current.destroy();
      if (volumeChart.current) volumeChart.current.destroy();
    };
  }, [indicators, priceHistory]);

  // Funkcje pomocnicze do generowania symulowanych danych
  const generateSimulatedRSIData = (
    length: number,
    currentRSI: number
  ): number[] => {
    // Symuluj historyczne dane RSI prowadzące do bieżącej wartości
    const result: number[] = [];
    let value = Math.random() * 30 + 35; // Rozpocznij od losowej wartości między 35-65

    for (let i = 0; i < length - 1; i++) {
      // Dodaj niewielkie losowe zmiany z pewnym dryftem w kierunku bieżącej wartości
      const drift = ((currentRSI - value) / (length - i)) * 0.5;
      const change = (Math.random() - 0.5) * 5 + drift;
      value = Math.max(0, Math.min(100, value + change));
      result.push(value);
    }

    // Ostatnia wartość to bieżący RSI
    result.push(currentRSI);

    return result;
  };

  const generateSimulatedMACDData = (length: number, macdData: any) => {
    // Symuluj historyczne dane MACD, Signal i Histogram
    const macdLine: number[] = [];
    const signalLine: number[] = [];
    const histogram: number[] = [];

    let macdValue = Math.random() * 2 - 1; // Rozpocznij od losowej wartości między -1 i 1
    let signalValue = macdValue - (Math.random() * 0.4 - 0.2); // Blisko, ale nie dokładnie przy MACD

    for (let i = 0; i < length - 1; i++) {
      // Losowe zmiany z dryftem w kierunku bieżącej wartości
      const macdDrift = ((macdData.value - macdValue) / (length - i)) * 0.5;
      const macdChange = (Math.random() - 0.5) * 0.3 + macdDrift;
      macdValue += macdChange;

      const signalDrift =
        ((macdData.signal - signalValue) / (length - i)) * 0.5;
      const signalChange = (Math.random() - 0.5) * 0.2 + signalDrift;
      signalValue += signalChange;

      macdLine.push(macdValue);
      signalLine.push(signalValue);
      histogram.push(macdValue - signalValue);
    }

    // Ostatnie wartości to bieżące wartości
    macdLine.push(macdData.value);
    signalLine.push(macdData.signal);
    histogram.push(macdData.histogram);

    return { macdLine, signalLine, histogram };
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

  // Interpretacje wskaźników
  const getRSIInterpretation = (rsi: number) => {
    if (rsi > 70)
      return { text: "Wykupienie (bearish)", color: "text-red-500" };
    if (rsi < 30)
      return { text: "Wyprzedanie (bullish)", color: "text-green-500" };
    return { text: "Neutralny", color: "text-gray-500" };
  };

  const getMACDInterpretation = (macd: any) => {
    if (macd.histogram > 0.2)
      return { text: "Silny bullish", color: "text-green-600" };
    if (macd.histogram > 0) return { text: "Bullish", color: "text-green-500" };
    if (macd.histogram < -0.2)
      return { text: "Silny bearish", color: "text-red-600" };
    if (macd.histogram < 0) return { text: "Bearish", color: "text-red-500" };
    return { text: "Neutralny", color: "text-gray-500" };
  };

  const getVolumeInterpretation = (volumeChange: number) => {
    if (volumeChange > 50)
      return { text: "Znaczny wzrost", color: "text-green-600" };
    if (volumeChange > 20)
      return { text: "Umiarkowany wzrost", color: "text-green-500" };
    if (volumeChange < -50)
      return { text: "Znaczny spadek", color: "text-red-600" };
    if (volumeChange < -20)
      return { text: "Umiarkowany spadek", color: "text-red-500" };
    return { text: "Stabilny", color: "text-gray-500" };
  };

  const rsiInterp = getRSIInterpretation(indicators.rsi);
  const macdInterp = getMACDInterpretation(indicators.macd);
  const volumeInterp = getVolumeInterpretation(indicators.volumeChange24h);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">RSI</h4>
          <div className="mb-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {indicators.rsi.toFixed(1)}
              </span>
              <span className={`text-sm ${rsiInterp.color}`}>
                {rsiInterp.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Relative Strength Index (RSI) mierzy szybkość i zmianę ruchów
              cenowych. Wartości powyżej 70 oznaczają że asset jest
              przewartościowany (wykupienie), a poniżej 30 że jest
              niedowartościowany (wyprzedanie).
            </p>
          </div>
          <div className="h-48">
            <canvas ref={rsiChartRef} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">MACD</h4>
          <div className="mb-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {indicators.macd.histogram.toFixed(3)}
              </span>
              <span className={`text-sm ${macdInterp.color}`}>
                {macdInterp.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Moving Average Convergence Divergence (MACD) to trend-following
              momentum indicator. Dodatni histogram (MACD `{">"}` Signal) jest
              bullish, a ujemny histogram (MACD `{"<"}` Signal) jest bearish.
            </p>
          </div>
          <div className="h-48">
            <canvas ref={macdChartRef} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">Wolumen</h4>
          <div className="mb-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {indicators.volumeChange24h > 0 ? "+" : ""}
                {indicators.volumeChange24h.toFixed(1)}%
              </span>
              <span className={`text-sm ${volumeInterp.color}`}>
                {volumeInterp.text}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Zmiana wolumenu wskazuje na poziom zainteresowania i aktywności
              handlowej. Znaczący wzrost wolumenu często potwierdza siłę
              aktualnego trendu.
            </p>
          </div>
          <div className="h-48">
            <canvas ref={volumeChartRef} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4">Dodatkowe wskaźniki</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium mb-2">Średnie kroczące</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">EMA (20)</span>
                  <span className="text-sm font-medium">
                    ${indicators.ema20.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-xs ${
                      indicators.ema20 > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {indicators.ema20 > 0
                      ? "Powyżej ceny (bearish)"
                      : "Poniżej ceny (bullish)"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">EMA (50)</span>
                  <span className="text-sm font-medium">
                    ${indicators.ema50.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-xs ${
                      indicators.ema50 > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {indicators.ema50 > 0
                      ? "Powyżej ceny (bearish)"
                      : "Poniżej ceny (bullish)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Ocena techniczna</h5>
            <p className="text-sm mb-3">
              Na podstawie analizy technicznej, obecny trend dla tego memcoina
              jest:
            </p>
            <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded">
              <p
                className={`font-medium ${
                  indicators.macd.histogram > 0 && indicators.rsi < 70
                    ? "text-green-600"
                    : indicators.macd.histogram < 0 && indicators.rsi > 30
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {indicators.macd.histogram > 0 && indicators.rsi < 70
                  ? "Bullish - potencjał wzrostowy"
                  : indicators.macd.histogram < 0 && indicators.rsi > 30
                  ? "Bearish - potencjał spadkowy"
                  : indicators.rsi > 70
                  ? "Wykupienie - możliwa korekta"
                  : indicators.rsi < 30
                  ? "Wyprzedanie - możliwe odbicie"
                  : "Neutralny - brak wyraźnego trendu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
