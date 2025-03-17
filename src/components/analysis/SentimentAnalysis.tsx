// src/components/analysis/SentimentAnalysis.tsx
"use client";

import { useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import { SentimentScore, SocialMention } from "@/types";

// Rejestracja Chart.js
Chart.register(...registerables);

interface SentimentAnalysisProps {
  sentiment: SentimentScore;
  mentions: SocialMention[];
  communityGrowth: number;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  sentiment,
  mentions,
  communityGrowth,
}) => {
  const sentimentChartRef = useRef<HTMLCanvasElement | null>(null);
  const sentimentChart = useRef<Chart | null>(null);
  const platformChartRef = useRef<HTMLCanvasElement | null>(null);
  const platformChart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!sentimentChartRef.current || !platformChartRef.current) return;

    // Zniszcz poprzednie wykresy, jeśli istnieją
    if (sentimentChart.current) sentimentChart.current.destroy();
    if (platformChart.current) platformChart.current.destroy();

    const sentimentCtx = sentimentChartRef.current.getContext("2d");
    const platformCtx = platformChartRef.current.getContext("2d");

    if (!sentimentCtx || !platformCtx) return;

    // 1. Wykres podziału sentymentu
    sentimentChart.current = new Chart(sentimentCtx, {
      type: "doughnut",
      data: {
        labels: ["Pozytywny", "Negatywny", "Neutralny"],
        datasets: [
          {
            data: [sentiment.positive, sentiment.negative, sentiment.neutral],
            backgroundColor: ["#4ade80", "#f87171", "#94a3b8"],
            borderColor: ["#22c55e", "#ef4444", "#64748b"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                const total =
                  sentiment.positive + sentiment.negative + sentiment.neutral;
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    // 2. Wykres platformy/źródła wzmianek
    // Grupuj wzmianki według platformy
    const platformCounts: Record<string, number> = {};
    mentions.forEach((mention) => {
      if (!platformCounts[mention.platform]) {
        platformCounts[mention.platform] = 0;
      }
      platformCounts[mention.platform]++;
    });

    // Przygotuj dane do wykresu
    const platforms = Object.keys(platformCounts);
    const counts = platforms.map((platform) => platformCounts[platform]);
    const colors = platforms.map((_, index) => {
      const hue = index * (360 / platforms.length);
      return `hsl(${hue}, 70%, 60%)`;
    });

    platformChart.current = new Chart(platformCtx, {
      type: "pie",
      data: {
        labels: platforms,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("60%", "50%")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                const total = counts.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (sentimentChart.current) sentimentChart.current.destroy();
      if (platformChart.current) platformChart.current.destroy();
    };
  }, [sentiment, mentions]);

  // Funkcje pomocnicze
  const getSentimentLabel = (score: number) => {
    if (score >= 70) return "Bardzo pozytywny";
    if (score >= 55) return "Pozytywny";
    if (score >= 45) return "Neutralny";
    if (score >= 30) return "Negatywny";
    return "Bardzo negatywny";
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 55) return "text-green-500";
    if (score >= 45) return "text-gray-500";
    if (score >= 30) return "text-red-500";
    return "text-red-600";
  };

  const getCommunityGrowthLabel = (growth: number) => {
    if (growth >= 50) return "Bardzo szybki";
    if (growth >= 20) return "Szybki";
    if (growth >= 5) return "Umiarkowany";
    if (growth >= 0) return "Powolny";
    return "Spadkowy";
  };

  const getCommunityGrowthColor = (growth: number) => {
    if (growth >= 50) return "text-green-600";
    if (growth >= 20) return "text-green-500";
    if (growth >= 5) return "text-blue-500";
    if (growth >= 0) return "text-yellow-500";
    return "text-red-500";
  };

  const getEngagementLabel = (mentions: SocialMention[]) => {
    if (!mentions.length) return "Brak danych";

    const totalEngagement = mentions.reduce(
      (sum, mention) => sum + mention.engagement,
      0
    );
    const avgEngagement = totalEngagement / mentions.length;

    if (avgEngagement > 100) return "Bardzo wysokie";
    if (avgEngagement > 50) return "Wysokie";
    if (avgEngagement > 20) return "Umiarkowane";
    if (avgEngagement > 5) return "Niskie";
    return "Bardzo niskie";
  };

  const getEngagementColor = (mentions: SocialMention[]) => {
    if (!mentions.length) return "text-gray-500";

    const totalEngagement = mentions.reduce(
      (sum, mention) => sum + mention.engagement,
      0
    );
    const avgEngagement = totalEngagement / mentions.length;

    if (avgEngagement > 100) return "text-green-600";
    if (avgEngagement > 50) return "text-green-500";
    if (avgEngagement > 20) return "text-blue-500";
    if (avgEngagement > 5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Ogólna ocena sentymentu</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mr-4">
                <span
                  className={`text-2xl font-bold ${getSentimentColor(
                    sentiment.total
                  )}`}
                >
                  {Math.round(sentiment.total)}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-semibold">
                  <span className={getSentimentColor(sentiment.total)}>
                    {getSentimentLabel(sentiment.total)}
                  </span>
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bazując na analizie{" "}
                  {sentiment.positive + sentiment.negative + sentiment.neutral}{" "}
                  wzmianek
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Wzrost społeczności
              </p>
              <p
                className={`font-medium ${getCommunityGrowthColor(
                  communityGrowth
                )}`}
              >
                {getCommunityGrowthLabel(communityGrowth)} (
                {communityGrowth.toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Poziom zaangażowania
              </p>
              <p className={`font-medium ${getEngagementColor(mentions)}`}>
                {getEngagementLabel(mentions)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Podział sentymentu</h3>
          <div className="h-64">
            <canvas ref={sentimentChartRef} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-green-500 font-medium">Pozytywne</p>
              <p className="text-gray-500">{sentiment.positive}</p>
            </div>
            <div>
              <p className="text-red-500 font-medium">Negatywne</p>
              <p className="text-gray-500">{sentiment.negative}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Neutralne</p>
              <p className="text-gray-500">{sentiment.neutral}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Źródła wzmianek</h3>
          {mentions.length > 0 ? (
            <>
              <div className="h-64">
                <canvas ref={platformChartRef} />
              </div>
              <div className="mt-4 text-sm text-center text-gray-500">
                Łącznie przeanalizowano {mentions.length} wzmianek
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Brak danych o wzmiankach
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Trendy społecznościowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Najczęstsze tematy dyskusji</h4>
            <ul className="space-y-2">
              {mentions.length > 0 ? (
                // Tutaj możemy dodać analizę najczęstszych słów lub tematów
                // Na potrzeby przykładu dodaję fikcyjne dane
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Potencjał wzrostu ceny
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Nowe partnerstwa i współprace
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Aktualizacje projektu
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Spekulacje rynkowe
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Obawy inwestycyjne
                  </li>
                </>
              ) : (
                <li className="text-gray-500">Brak danych</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Kluczowe wnioski</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-600 rounded">
              {sentiment.total >= 70 ? (
                <p>
                  Społeczność jest wyjątkowo entuzjastyczna. Widoczny jest silny
                  pozytywny sentyment i duże zaangażowanie, co może wskazywać na
                  potencjał dalszego wzrostu, zwłaszcza jeśli projekt dostarczy
                  obiecane funkcje.
                </p>
              ) : sentiment.total >= 55 ? (
                <p>
                  Ogólny nastrój społeczności jest pozytywny. Inwestorzy wydają
                  się ufać projektowi i jego potencjałowi. Warto monitorować
                  kluczowe wydarzenia, które mogą wzmocnić te pozytywne
                  odczucia.
                </p>
              ) : sentiment.total >= 45 ? (
                <p>
                  Społeczność ma mieszane odczucia odnośnie projektu. Istnieje
                  zarówno entuzjazm jak i sceptycyzm. Zalecana jest ostrożność i
                  dokładniejsza analiza fundamentów projektu.
                </p>
              ) : sentiment.total >= 30 ? (
                <p>
                  Widoczny jest negatywny sentyment wśród społeczności.
                  Inwestorzy wyrażają obawy dotyczące projektu. Warto
                  zidentyfikować źródła tych obaw przed podjęciem decyzji
                  inwestycyjnych.
                </p>
              ) : (
                <p>
                  Społeczność wyraża bardzo negatywne opinie o projekcie.
                  Widoczny jest wysoki poziom nieufności i krytyki.
                  Rekomendowana jest szczególna ostrożność i dogłębna analiza.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
