/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/services/price-analysis/PriceAnalysisService.ts
import { getCoinHistoricalData } from "@/lib/api/coingecko";
import { PriceIndicators } from "@/types";
import { prisma } from "@/lib/db";

export class PriceAnalysisService {
  async getIndicators(symbol: string): Promise<PriceIndicators> {
    try {
      // Znajdź coin ID dla podanego symbolu
      const coin = await prisma.memCoin.findFirst({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!coin) {
        throw new Error(`Coin with symbol ${symbol} not found`);
      }

      // Pobierz dane historyczne z CoinGecko lub z bazy danych
      let priceData: number[] = [];
      let volumeData: number[] = [];

      // Próbujemy najpierw pobrać z bazy danych
      const historicalData = await prisma.priceHistory.findMany({
        where: { memCoinId: coin.id },
        orderBy: { timestamp: "asc" },
      });

      if (historicalData.length > 14) {
        // Wystarczająco danych do analizy
        priceData = historicalData.map((d) => d.price);
        volumeData = historicalData.map((d) => d.volume);
      } else {
        // Pobierz z CoinGecko, jeśli nie mamy lokalnych danych
        // Uwaga: potrzebne jest mapowanie symbolCoinGeckoId
        const geckoData = await this.getCoinGeckoHistoricalData(symbol);

        if (geckoData) {
          priceData = geckoData.prices.map((p: any) => p[1]);
          volumeData = geckoData.volumes.map((v: any) => v[1]);

          // Zapisz dane do bazy dla przyszłych analiz
          await this.savePriceHistoryToDB(coin.id, geckoData);
        }
      }

      // Jeśli nadal brak danych, zwróć domyślne wartości
      if (priceData.length < 14) {
        return this.getDefaultIndicators();
      }

      // Oblicz wskaźniki techniczne
      const rsi = this.calculateRSI(priceData);
      const macd = this.calculateMACD(priceData);
      const ema20 = this.calculateEMA(priceData, 20);
      const ema50 = this.calculateEMA(priceData, 50);

      // Oblicz zmianę wolumenu (24h)
      const volumeChange24h = this.calculateVolumeChange(volumeData);

      return {
        rsi,
        macd,
        ema20,
        ema50,
        volumeChange24h,
      };
    } catch (error) {
      console.error(
        `Error calculating technical indicators for ${symbol}:`,
        error
      );
      return this.getDefaultIndicators();
    }
  }

  private getDefaultIndicators(): PriceIndicators {
    return {
      rsi: 50,
      macd: {
        value: 0,
        signal: 0,
        histogram: 0,
      },
      ema20: 0,
      ema50: 0,
      volumeChange24h: 0,
    };
  }

  private async getCoinGeckoHistoricalData(symbol: string): Promise<any> {
    try {
      // W rzeczywistej implementacji potrzebne jest mapowanie symbolu na coinGeckoId
      // To jest uproszczone podejście
      const coinGeckoId = symbol.toLowerCase(); // W praktyce potrzebne mapowanie lub wyszukiwanie
      return await getCoinHistoricalData(coinGeckoId, 30);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return null;
    }
  }

  private async savePriceHistoryToDB(
    coinId: string,
    geckoData: any
  ): Promise<void> {
    try {
      const priceEntries = geckoData.prices.map((entry: [number, number]) => {
        const timestamp = new Date(entry[0]);
        const price = entry[1];
        const volumeEntry = geckoData.volumes.find(
          (v: [number, number]) => v[0] === entry[0]
        );
        const volume = volumeEntry ? volumeEntry[1] : 0;

        return {
          memCoinId: coinId,
          price,
          volume,
          timestamp,
        };
      });

      // Używamy transakcji do zapisania wszystkich danych jednocześnie
      await prisma.$transaction(
        priceEntries.map((entry: any) =>
          prisma.priceHistory.create({ data: entry })
        )
      );
    } catch (error) {
      console.error(`Error saving price history to DB:`, error);
    }
  }

  // Implementacja wskaźników technicznych

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) {
      return 50; // Domyślna wartość, jeśli nie ma wystarczającej ilości danych
    }

    let gains = 0;
    let losses = 0;

    // Oblicz pierwszą średnią gain/loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Oblicz kolejne wartości
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];

      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      return prices[prices.length - 1] || 0;
    }

    const multiplier = 2 / (period + 1);

    // Używamy SMA jako pierwszej wartości EMA
    let ema =
      prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    // Obliczamy EMA dla pozostałych punktów
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  private calculateMACD(prices: number[]): {
    value: number;
    signal: number;
    histogram: number;
  } {
    if (prices.length < 26) {
      return { value: 0, signal: 0, histogram: 0 };
    }

    // MACD jest różnicą między EMA12 a EMA26
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdValue = ema12 - ema26;

    // Linia sygnałowa to EMA9 z wartości MACD
    // W uproszczeniu używamy wartości MACD jako sygnał
    const signal = macdValue * 0.9; // Uproszczenie

    // Histogram to różnica między MACD a linią sygnałową
    const histogram = macdValue - signal;

    return { value: macdValue, signal, histogram };
  }

  private calculateVolumeChange(volumes: number[]): number {
    if (volumes.length < 2) {
      return 0;
    }

    const lastVolume = volumes[volumes.length - 1];
    const prevVolume = volumes[volumes.length - 2];

    if (prevVolume === 0) {
      return lastVolume > 0 ? 100 : 0;
    }

    return ((lastVolume - prevVolume) / prevVolume) * 100;
  }

  async getTechnicalBreakdown(symbol: string): Promise<any> {
    try {
      const indicators = await this.getIndicators(symbol);

      // Interpretacja RSI
      let rsiInterpretation;
      if (indicators.rsi > 70) {
        rsiInterpretation = "Wykupienie (bearish)";
      } else if (indicators.rsi < 30) {
        rsiInterpretation = "Wyprzedanie (bullish)";
      } else {
        rsiInterpretation = "Neutralny";
      }

      // Interpretacja MACD
      let macdInterpretation;
      if (indicators.macd.histogram > 0) {
        macdInterpretation = "Bullish (rosnący trend)";
      } else if (indicators.macd.histogram < 0) {
        macdInterpretation = "Bearish (spadkowy trend)";
      } else {
        macdInterpretation = "Neutralny";
      }

      // Interpretacja wolumenu
      let volumeInterpretation;
      if (indicators.volumeChange24h > 50) {
        volumeInterpretation = "Znaczny wzrost (bullish)";
      } else if (indicators.volumeChange24h > 20) {
        volumeInterpretation = "Umiarkowany wzrost (lekko bullish)";
      } else if (indicators.volumeChange24h < -50) {
        volumeInterpretation = "Znaczny spadek (bearish)";
      } else if (indicators.volumeChange24h < -20) {
        volumeInterpretation = "Umiarkowany spadek (lekko bearish)";
      } else {
        volumeInterpretation = "Stabilny (neutralny)";
      }

      // Ogólna ocena techniczna (skala 0-100)
      let technicalScore = 50; // Neutralna początkowa wartość

      // Dodaj wpływ RSI (waga 25%)
      if (indicators.rsi < 30) technicalScore += 15; // Wyprzedanie jest bullish
      else if (indicators.rsi > 70)
        technicalScore -= 15; // Wykupienie jest bearish
      else technicalScore += (indicators.rsi - 50) * 0.3; // Liniowa zależność w strefie neutralnej

      // Dodaj wpływ MACD (waga 25%)
      technicalScore += indicators.macd.histogram * 5; // Pozytywny histogram dodaje punkty

      // Dodaj wpływ wolumenu (waga 20%)
      if (indicators.volumeChange24h > 0) {
        technicalScore += Math.min(indicators.volumeChange24h * 0.1, 10);
      } else {
        technicalScore += Math.max(indicators.volumeChange24h * 0.1, -10);
      }

      // Upewnij się, że wynik jest w zakresie 0-100
      technicalScore = Math.min(Math.max(technicalScore, 0), 100);

      return {
        indicators,
        interpretations: {
          rsi: rsiInterpretation,
          macd: macdInterpretation,
          volume: volumeInterpretation,
        },
        technicalScore: Math.round(technicalScore),
      };
    } catch (error) {
      console.error(`Error getting technical breakdown for ${symbol}:`, error);
      return {
        indicators: this.getDefaultIndicators(),
        interpretations: {
          rsi: "Brak danych",
          macd: "Brak danych",
          volume: "Brak danych",
        },
        technicalScore: 50,
      };
    }
  }
}
