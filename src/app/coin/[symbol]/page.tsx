// src/app/coin/[symbol]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MemCoin,
  SuccessPrediction,
  PriceHistory,
  SocialMention,
} from "@/types";
import { PriceChart } from "@/components/charts/PriceChart";
import { SentimentAnalysis } from "@/components/analysis/SentimentAnalysis";
import { TechnicalIndicators } from "@/components/analysis/TechnicalIndicators";
import { SocialFeed } from "@/components/social/SocialFeed";

export default function CoinDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  const [coin, setCoin] = useState<MemCoin | null>(null);
  const [prediction, setPrediction] = useState<SuccessPrediction | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [socialMentions, setSocialMentions] = useState<SocialMention[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "technical" | "social" | "prediction"
  >("overview");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Pobierz dane o monecie
        const coinResponse = await fetch("/api/coins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol }),
        });

        if (!coinResponse.ok) {
          if (coinResponse.status === 404) {
            throw new Error("Coin not found");
          }
          throw new Error("Failed to fetch coin data");
        }

        const coinData = await coinResponse.json();
        setCoin(coinData);
        setPriceHistory(coinData.priceHistory || []);
        setSocialMentions(coinData.socialMentions || []);

        // Pobierz predykcję
        const predictionResponse = await fetch(
          `/api/predictions?symbol=${symbol}`
        );

        if (predictionResponse.ok) {
          const predictionData = await predictionResponse.json();
          setPrediction(predictionData);
        }
      } catch (error) {
        console.error("Error fetching coin details:", error);
        setError("Wystąpił błąd podczas ładowania danych o monecie");
      } finally {
        setIsLoading(false);
      }
    }

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const refreshData = async () => {
    try {
      setIsLoading(true);

      // Odśwież dane o monecie z zewnętrznych źródeł
      const refreshResponse = await fetch(
        `/api/coins/refresh?symbol=${symbol}`
      );

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh coin data");
      }

      // Pobierz zaktualizowane dane
      const coinResponse = await fetch("/api/coins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });

      if (!coinResponse.ok) {
        throw new Error("Failed to fetch updated coin data");
      }

      const coinData = await coinResponse.json();
      setCoin(coinData);
      setPriceHistory(coinData.priceHistory || []);
      setSocialMentions(coinData.socialMentions || []);

      // Pobierz świeżą predykcję
      const predictionResponse = await fetch(
        `/api/predictions?symbol=${symbol}&refresh=true`
      );

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        setPrediction(predictionData);
      }

      alert("Dane zostały pomyślnie odświeżone!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Wystąpił błąd podczas odświeżania danych");
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  const formatPercentage = (percentage: number) => {
    return percentage.toFixed(2);
  };

  const getSuccessProbabilityColor = () => {
    if (!prediction || !prediction.successProbability) return "text-gray-400";
    if (prediction.successProbability >= 70) return "text-green-500";
    if (prediction.successProbability >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProbabilityLabel = () => {
    if (!prediction || !prediction.successProbability) return "Brak danych";
    if (prediction.successProbability >= 70) return "Wysokie";
    if (prediction.successProbability >= 40) return "Średnie";
    return "Niskie";
  };

  if (isLoading && !coin) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Nie znaleziono monety"}
        </div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Wróć do dashboardu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="text-blue-500 hover:underline mr-4"
          >
            &larr; Wróć do dashboardu
          </Link>
          <h1 className="text-2xl font-bold">
            {coin.name} ({coin.symbol})
          </h1>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "Ładowanie..." : "Odśwież dane"}
        </button>
      </div>

      {/* Ogólne informacje o monecie */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            {coin.logo ? (
              <Image
                src={coin.logo}
                alt={coin.name}
                width={64}
                height={64}
                className="rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full mr-4">
                <span className="text-2xl font-bold">
                  {coin.symbol.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{coin.name}</h2>
              <p className="text-gray-500">{coin.symbol}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:flex md:space-x-6">
            <div>
              <p className="text-sm text-gray-500">Cena</p>
              <p className="text-lg font-bold">
                ${formatPrice(coin.currentPrice)}
              </p>
              <p
                className={`text-sm ${
                  coin.priceChangePercentage24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {coin.priceChangePercentage24h >= 0 ? "+" : ""}
                {formatPercentage(coin.priceChangePercentage24h)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Kapitalizacja</p>
              <p className="text-lg font-bold">
                {formatMarketCap(coin.marketCap)}
              </p>
              <p className="text-sm text-gray-500">
                Rank: #{coin.rank || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Wolumen 24h</p>
              <p className="text-lg font-bold">
                ${formatMarketCap(coin.volume24h)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Szansa sukcesu</p>
              <p
                className={`text-lg font-bold ${getSuccessProbabilityColor()}`}
              >
                {prediction?.successProbability.toFixed(1) || "N/A"}%
              </p>
              <p className={`text-sm ${getSuccessProbabilityColor()}`}>
                {getProbabilityLabel()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zakładki */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Przegląd
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "technical"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analiza techniczna
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "social"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Sentyment społeczności
            </button>
            <button
              onClick={() => setActiveTab("prediction")}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === "prediction"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Predykcja sukcesu
            </button>
          </nav>
        </div>
      </div>

      {/* Zawartość zakładek */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {activeTab === "overview" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Wykres ceny</h3>
            <div className="h-80">
              <PriceChart priceHistory={priceHistory} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Informacje o monecie
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Najwyższa cena (ATH)</span>
                    <span className="font-medium">
                      ${formatPrice(coin.ath)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data ATH</span>
                    <span className="font-medium">
                      {new Date(coin.athDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cyrkulująca podaż</span>
                    <span className="font-medium">
                      {coin.circulatingSupply
                        ? coin.circulatingSupply.toLocaleString()
                        : "Brak danych"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Maksymalna podaż</span>
                    <span className="font-medium">
                      {coin.totalSupply
                        ? coin.totalSupply.toLocaleString()
                        : "Brak danych"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data dodania</span>
                    <span className="font-medium">
                      {new Date(coin.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Giełdy</h3>
                {coin.exchanges && coin.exchanges.length > 0 ? (
                  <ul className="space-y-1">
                    {coin.exchanges.map((exchange, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {exchange}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Brak danych o giełdach</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "technical" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Wskaźniki techniczne</h3>
            {prediction && prediction.factors.technicalAnalysis ? (
              <TechnicalIndicators
                indicators={prediction.factors.technicalAnalysis}
                priceHistory={priceHistory}
              />
            ) : (
              <p className="text-gray-500">Brak danych analizy technicznej</p>
            )}
          </div>
        )}

        {activeTab === "social" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Analiza sentymentu społeczności
            </h3>
            {prediction && prediction.factors.socialSentiment ? (
              <SentimentAnalysis
                sentiment={prediction.factors.socialSentiment}
                mentions={socialMentions}
                communityGrowth={coin.communityGrowth}
              />
            ) : (
              <p className="text-gray-500">
                Brak danych o sentymencie społeczności
              </p>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Ostatnie wzmianki</h3>
              <SocialFeed mentions={socialMentions} symbol={coin.symbol} />
            </div>
          </div>
        )}

        {activeTab === "prediction" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Predykcja sukcesu</h3>
            {prediction ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <div className="flex flex-col items-center">
                    <h4 className="text-lg font-medium mb-2">Szansa sukcesu</h4>
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Tło */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        {/* Wypełnienie */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={
                            prediction.successProbability >= 70
                              ? "#10b981"
                              : prediction.successProbability >= 40
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          strokeWidth="10"
                          strokeDasharray={`${
                            prediction.successProbability * 2.83
                          } 283`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`text-3xl font-bold ${getSuccessProbabilityColor()}`}
                        >
                          {prediction.successProbability.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          {getProbabilityLabel()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Rozkład czynników</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">
                            Sentyment społeczności (30%)
                          </span>
                          <span className="text-sm font-medium">
                            {prediction.factors.socialSentiment.total.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.socialSentiment.total}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">
                            Analiza techniczna (25%)
                          </span>
                          <span className="text-sm font-medium">
                            {(
                              (prediction.factors.technicalAnalysis.rsi / 100) *
                                50 +
                              50
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (prediction.factors.technicalAnalysis.rsi /
                                  100) *
                                  50 +
                                50
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">
                            Wzrost społeczności (20%)
                          </span>
                          <span className="text-sm font-medium">
                            {prediction.factors.communityGrowth.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.communityGrowth}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Płynność (15%)</span>
                          <span className="text-sm font-medium">
                            {prediction.factors.liquidityScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.liquidityScore}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Uzasadnienie predykcji</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nasza ocena prawdopodobieństwa sukcesu {coin.name} (
                    {coin.symbol}) opiera się na złożonej analizie różnych
                    czynników.{" "}
                    {prediction.successProbability >= 70
                      ? "Moneta wykazuje silne oznaki potencjalnego wzrostu, z pozytywnym sentymentem społeczności i zdrowymi wskaźnikami technicznymi."
                      : prediction.successProbability >= 40
                      ? "Moneta pokazuje mieszane sygnały, z pewnymi pozytywnymi i negatywnymi czynnikami, które należy monitorować."
                      : "Moneta wykazuje kilka sygnałów ostrzegawczych, które mogą wskazywać na podwyższone ryzyko. Zalecana jest ostrożność."}
                  </p>

                  <div className="mt-4">
                    <h5 className="font-medium">
                      Główne czynniki wpływające na predykcję:
                    </h5>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                      <li>
                        Sentyment społeczności jest{" "}
                        {prediction.factors.socialSentiment.total >= 70
                          ? "bardzo pozytywny"
                          : prediction.factors.socialSentiment.total >= 55
                          ? "pozytywny"
                          : prediction.factors.socialSentiment.total >= 45
                          ? "neutralny"
                          : prediction.factors.socialSentiment.total >= 30
                          ? "negatywny"
                          : "bardzo negatywny"}
                      </li>
                      <li>
                        Wskaźniki techniczne wskazują na{" "}
                        {prediction.factors.technicalAnalysis.rsi > 70
                          ? "wykupienie (bearish)"
                          : prediction.factors.technicalAnalysis.rsi < 30
                          ? "wyprzedanie (bullish)"
                          : "neutralny trend"}
                      </li>
                      <li>
                        Wzrost społeczności jest{" "}
                        {prediction.factors.communityGrowth >= 70
                          ? "bardzo wysoki"
                          : prediction.factors.communityGrowth >= 40
                          ? "umiarkowany"
                          : "niski"}
                      </li>
                      <li>
                        Płynność jest{" "}
                        {prediction.factors.liquidityScore >= 70
                          ? "bardzo dobra"
                          : prediction.factors.liquidityScore >= 40
                          ? "umiarkowana"
                          : "niska"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Brak danych predykcji</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
