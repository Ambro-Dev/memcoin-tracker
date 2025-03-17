// src/components/analysis/PredictedSuccessTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { SuccessPrediction } from "@/types";

interface PredictedSuccessTableProps {
  coins: SuccessPrediction[];
}

export const PredictedSuccessTable: React.FC<PredictedSuccessTableProps> = ({
  coins,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (symbol: string) => {
    if (expandedRow === symbol) {
      setExpandedRow(null);
    } else {
      setExpandedRow(symbol);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "bg-green-100 text-green-800";
    if (probability >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 70) return "Bardzo pozytywny";
    if (sentiment >= 55) return "Pozytywny";
    if (sentiment >= 45) return "Neutralny";
    if (sentiment >= 30) return "Negatywny";
    return "Bardzo negatywny";
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "text-green-600";
    if (sentiment >= 55) return "text-green-500";
    if (sentiment >= 45) return "text-gray-500";
    if (sentiment >= 30) return "text-red-500";
    return "text-red-600";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Nazwa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Szansa sukcesu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Szczegóły
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {coins.map((coin) => (
            <>
              <tr
                key={coin.symbol}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleRow(coin.symbol)}
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <Link
                    href={`/coin/${coin.symbol}`}
                    className="text-blue-500 hover:underline"
                  >
                    {coin.symbol}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{coin.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getProbabilityColor(
                      coin.successProbability
                    )}`}
                  >
                    {coin.successProbability.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(coin.symbol);
                    }}
                  >
                    {expandedRow === coin.symbol ? "Ukryj" : "Pokaż"}
                  </button>
                </td>
              </tr>
              {expandedRow === coin.symbol && (
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={4} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">
                          Sentyment społeczności
                        </h4>
                        <p
                          className={`${getSentimentColor(
                            coin.factors.socialSentiment.total
                          )}`}
                        >
                          {getSentimentLabel(
                            coin.factors.socialSentiment.total
                          )}
                          ({coin.factors.socialSentiment.total.toFixed(1)})
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            Pozytywne: {coin.factors.socialSentiment.positive}
                          </span>
                          <span className="text-xs text-gray-500 mr-2">
                            Negatywne: {coin.factors.socialSentiment.negative}
                          </span>
                          <span className="text-xs text-gray-500">
                            Neutralne: {coin.factors.socialSentiment.neutral}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Analiza techniczna</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm">
                              RSI:
                              <span
                                className={`ml-1 ${
                                  coin.factors.technicalAnalysis.rsi > 70
                                    ? "text-red-500"
                                    : coin.factors.technicalAnalysis.rsi < 30
                                    ? "text-green-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {coin.factors.technicalAnalysis.rsi.toFixed(1)}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              Wolumen 24h:
                              <span
                                className={`ml-1 ${
                                  coin.factors.technicalAnalysis
                                    .volumeChange24h > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {coin.factors.technicalAnalysis
                                  .volumeChange24h > 0
                                  ? "+"
                                  : ""}
                                {coin.factors.technicalAnalysis.volumeChange24h.toFixed(
                                  1
                                )}
                                %
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">
                          Wskaźniki społeczności
                        </h4>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${coin.factors.communityGrowth}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {coin.factors.communityGrowth.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Płynność</h4>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-purple-600 h-2.5 rounded-full"
                              style={{
                                width: `${coin.factors.liquidityScore}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {coin.factors.liquidityScore.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={`/coin/${coin.symbol}`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Zobacz pełną analizę
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
