// src/components/ui/CoinCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MemCoin } from "@/types";

interface CoinCardProps {
  coin: MemCoin;
}

export const CoinCard: React.FC<CoinCardProps> = ({ coin }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Formatowanie numeryczne
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

  // Określanie kolorów na podstawie wartości
  const getPriceChangeColor = () => {
    if (coin.priceChangePercentage24h > 0) return "text-green-500";
    if (coin.priceChangePercentage24h < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getSuccessProbabilityColor = () => {
    if (!coin.successProbability) return "text-gray-400";
    if (coin.successProbability >= 70) return "text-green-500";
    if (coin.successProbability >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProbabilityLabel = () => {
    if (!coin.successProbability) return "Brak danych";
    if (coin.successProbability >= 70) return "Wysokie";
    if (coin.successProbability >= 40) return "Średnie";
    return "Niskie";
  };

  const getDefaultLogo = () => {
    return "/icons/default-coin.svg";
  };

  return (
    <Link href={`/coin/${coin.symbol}`}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-200 ${
          isHovered ? "shadow-lg transform scale-[1.02]" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 mr-3 overflow-hidden rounded-full bg-gray-100">
            {coin.logo ? (
              <Image
                src={coin.logo}
                alt={coin.name}
                width={40}
                height={40}
                onError={(e) => (e.currentTarget.src = getDefaultLogo())}
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                <span className="text-lg font-bold">
                  {coin.symbol.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{coin.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {coin.symbol}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-lg font-bold">
              ${formatPrice(coin.currentPrice)}
            </p>
            <p className={`text-sm ${getPriceChangeColor()}`}>
              {coin.priceChangePercentage24h > 0 ? "▲" : "▼"}
              {formatPercentage(Math.abs(coin.priceChangePercentage24h))}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">MCap:</p>
            <p className="font-medium">{formatMarketCap(coin.marketCap)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Szansa sukcesu:
            </p>
            <div className="flex items-center">
              <div
                className={`h-2 w-16 bg-gray-200 rounded-full overflow-hidden mr-2`}
              >
                <div
                  className={`h-full ${
                    coin.successProbability && coin.successProbability >= 70
                      ? "bg-green-500"
                      : coin.successProbability && coin.successProbability >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${coin.successProbability || 0}%` }}
                ></div>
              </div>
              <p
                className={`text-sm font-medium ${getSuccessProbabilityColor()}`}
              >
                {getProbabilityLabel()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
