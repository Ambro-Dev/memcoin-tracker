// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MemCoin, SuccessPrediction } from "@/types";
import { CoinCard } from "@/components/ui/CoinCard";
import { TrendingCoinsChart } from "@/components//charts/TrendingCoinsChart";
import { PredictedSuccessTable } from "@/components/analysis/PredictedSuccessTable";
import { AlertPanel } from "@/components/alerts/AlertPanel";

export default function Dashboard() {
  const [trendingCoins, setTrendingCoins] = useState<MemCoin[]>([]);
  const [predictedCoins, setPredictedCoins] = useState<SuccessPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Pobranie najlepszych memcoinów według różnych metryk
        const coinsResponse = await fetch("/api/coins?limit=20");
        if (!coinsResponse.ok) {
          throw new Error("Failed to fetch trending coins");
        }
        const coinsData = await coinsResponse.json();

        const predictionsResponse = await fetch("/api/predictions");
        if (!predictionsResponse.ok) {
          throw new Error("Failed to fetch predictions");
        }
        const predictionsData = await predictionsResponse.json();

        setTrendingCoins(coinsData.coins);
        setPredictedCoins(predictionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          "Wystąpił błąd podczas ładowania danych. Spróbuj odświeżyć stronę."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Odświeżanie danych co 5 minut
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wymuś odświeżenie danych z zewnętrznych źródeł
      const coinsResponse = await fetch("/api/coins?refresh=true&limit=20");
      if (!coinsResponse.ok) {
        throw new Error("Failed to refresh coin data");
      }
      const coinsData = await coinsResponse.json();

      // Wywołaj aktualizację predykcji
      await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "updateAll" }),
      });

      // Pobierz zaktualizowane predykcje
      const predictionsResponse = await fetch("/api/predictions");
      if (!predictionsResponse.ok) {
        throw new Error("Failed to fetch updated predictions");
      }
      const predictionsData = await predictionsResponse.json();

      setTrendingCoins(coinsData.coins);
      setPredictedCoins(predictionsData);

      // Powiadomienie o sukcesie
      alert("Dane zostały pomyślnie odświeżone!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Wystąpił błąd podczas odświeżania danych.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard śledzenia memcoinów</h1>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Ładowanie..." : "Odśwież dane"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading && !trendingCoins.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Trending Memcoiny</h2>
              {trendingCoins.length > 0 ? (
                <TrendingCoinsChart coins={trendingCoins.slice(0, 7)} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Brak danych do wyświetlenia
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Alerty</h2>
              <AlertPanel />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Najwyższe prawdopodobieństwo sukcesu
            </h2>
            {predictedCoins.length > 0 ? (
              <PredictedSuccessTable coins={predictedCoins} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Brak danych predykcji
              </p>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4">Popularne memcoiny</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingCoins.slice(0, 8).map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
