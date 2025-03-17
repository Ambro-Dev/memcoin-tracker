/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/services/prediction/PredictionService.ts
import {
  MemCoin,
  SentimentScore,
  PriceIndicators,
  SuccessPrediction,
} from "@/types";
import { SocialSentimentService } from "../social-sentiment/SocialSentimentService";
import { PriceAnalysisService } from "../price-analysis/PriceAnalysisService";
import { prisma } from "@/lib/db";

export class PredictionService {
  private socialSentimentService: SocialSentimentService;
  private priceAnalysisService: PriceAnalysisService;

  constructor() {
    this.socialSentimentService = new SocialSentimentService();
    this.priceAnalysisService = new PriceAnalysisService();
  }

  async predictSuccess(coin: MemCoin): Promise<number> {
    try {
      // Pobranie danych z różnych serwisów
      const sentimentScore =
        await this.socialSentimentService.calculateSentimentScore(coin.symbol);
      const priceIndicators = await this.priceAnalysisService.getIndicators(
        coin.symbol
      );

      // Obliczenie prawdopodobieństwa sukcesu na podstawie różnych czynników
      let successProbability = 0;

      // 1. Analiza sentymentu społeczności (30% wagi)
      const sentimentFactor =
        this.calculateSentimentFactor(sentimentScore) * 0.3;

      // 2. Analiza techniczna (25% wagi)
      const technicalFactor =
        this.calculateTechnicalFactor(priceIndicators) * 0.25;

      // 3. Wzrost społeczności (20% wagi)
      const communityFactor = this.calculateCommunityFactor(coin) * 0.2;

      // 4. Płynność (15% wagi)
      const liquidityFactor = this.calculateLiquidityFactor(coin) * 0.15;

      // 5. Inne czynniki (10% wagi)
      const miscFactor = this.calculateMiscFactors(coin) * 0.1;

      // Sumowanie wszystkich czynników
      successProbability =
        sentimentFactor +
        technicalFactor +
        communityFactor +
        liquidityFactor +
        miscFactor;

      // Ograniczenie do zakresu 0-100%
      const finalProbability = Math.min(Math.max(successProbability, 0), 100);

      // Aktualizacja wartości w bazie danych
      await prisma.memCoin.update({
        where: { id: coin.id },
        data: { successProbability: finalProbability },
      });

      return finalProbability;
    } catch (error) {
      console.error(`Error predicting success for ${coin.symbol}:`, error);
      return 0;
    }
  }

  private calculateSentimentFactor(sentiment: SentimentScore): number {
    // Wartość sentymentu jest już w skali 0-100, gdzie powyżej 50 jest pozytywne
    return sentiment.total;
  }

  private calculateTechnicalFactor(indicators: PriceIndicators): number {
    let score = 50; // Neutralna początkowa wartość

    // RSI wpływ (30% wagi)
    if (indicators.rsi < 30) {
      // Wyprzedanie - potencjalne odbicie (bullish)
      score += 20;
    } else if (indicators.rsi > 70) {
      // Wykupienie - potencjalna korekta (bearish)
      score -= 20;
    } else {
      // Neutralny - małe odchylenie od 50
      score += (indicators.rsi - 50) * 0.4;
    }

    // MACD wpływ (40% wagi)
    if (indicators.macd.histogram > 0) {
      // Pozytywny histogram (bullish)
      score += 15 * Math.min(indicators.macd.histogram, 2);
    } else {
      // Negatywny histogram (bearish)
      score += 15 * Math.max(indicators.macd.histogram, -2);
    }

    // Wpływ wolumenu (30% wagi)
    if (indicators.volumeChange24h > 50) {
      // Znaczący wzrost wolumenu
      score += 15;
    } else if (indicators.volumeChange24h > 20) {
      // Umiarkowany wzrost
      score += 8;
    } else if (indicators.volumeChange24h < -50) {
      // Znaczący spadek
      score -= 15;
    } else if (indicators.volumeChange24h < -20) {
      // Umiarkowany spadek
      score -= 8;
    }

    // Upewnij się, że wynik jest w zakresie 0-100
    return Math.min(Math.max(score, 0), 100);
  }

  private calculateCommunityFactor(coin: MemCoin): number {
    // Wartość w zakresie 0-100
    return coin.communityGrowth;
  }

  private calculateLiquidityFactor(coin: MemCoin): number {
    // Wartość w zakresie 0-100
    return coin.liquidityScore;
  }

  private calculateMiscFactors(coin: MemCoin): number {
    let miscScore = 50;

    // 1. Liczba giełd
    const exchangeCount = coin.exchanges.length;
    if (exchangeCount >= 5) {
      miscScore += 15;
    } else if (exchangeCount >= 3) {
      miscScore += 10;
    } else if (exchangeCount >= 1) {
      miscScore += 5;
    }

    // 2. Czas istnienia (bazując na createdAt)
    const ageInDays =
      (new Date().getTime() - coin.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > 180) {
      // Ponad 6 miesięcy - stabilny projekt
      miscScore += 15;
    } else if (ageInDays > 30) {
      // Ponad miesiąc
      miscScore += 10;
    } else if (ageInDays < 7) {
      // Bardzo nowy - ryzykowny
      miscScore -= 10;
    }

    // 3. Kapitalizacja rynkowa
    if (coin.marketCap > 100000000) {
      // 100M+
      miscScore += 10;
    } else if (coin.marketCap > 10000000) {
      // 10M+
      miscScore += 5;
    } else if (coin.marketCap < 1000000) {
      // Poniżej 1M
      miscScore -= 5;
    }

    // 4. Aktywność deweloperska (jeśli dostępna)
    if (coin.developmentActivity && coin.developmentActivity > 70) {
      miscScore += 10;
    } else if (coin.developmentActivity && coin.developmentActivity > 30) {
      miscScore += 5;
    }

    // Upewnij się, że wynik jest w zakresie 0-100
    return Math.min(Math.max(miscScore, 0), 100);
  }

  async getSentimentBreakdown(symbol: string): Promise<SentimentScore> {
    return await this.socialSentimentService.calculateSentimentScore(symbol);
  }

  async getTechnicalBreakdown(symbol: string): Promise<any> {
    return await this.priceAnalysisService.getTechnicalBreakdown(symbol);
  }

  async getTopPredictions(limit = 10): Promise<SuccessPrediction[]> {
    try {
      // Pobierz monety z najwyższym prawdopodobieństwem sukcesu
      const topCoins = await prisma.memCoin.findMany({
        where: {
          successProbability: { not: null },
        },
        orderBy: {
          successProbability: "desc",
        },
        take: limit,
      });

      // Dla każdej monety pobierz dodatkowe dane
      const predictions: SuccessPrediction[] = [];

      for (const coin of topCoins) {
        // Dla uproszczenia można zastosować równoległe przetwarzanie
        const [sentiment, technical] = await Promise.all([
          this.socialSentimentService.calculateSentimentScore(coin.symbol),
          this.priceAnalysisService.getTechnicalBreakdown(coin.symbol),
        ]);

        predictions.push({
          symbol: coin.symbol,
          name: coin.name,
          successProbability: coin.successProbability || 0,
          factors: {
            socialSentiment: sentiment,
            technicalAnalysis: technical.indicators,
            communityGrowth: coin.communityGrowth,
            liquidityScore: coin.liquidityScore,
          },
        });
      }

      return predictions;
    } catch (error) {
      console.error("Error getting top predictions:", error);
      return [];
    }
  }

  async updateAllPredictions(): Promise<void> {
    try {
      // Pobierz wszystkie monety
      const allCoins = await prisma.memCoin.findMany();

      // Aktualizuj predykcje dla każdej monety
      for (const coin of allCoins) {
        await this.predictSuccess(coin as MemCoin);

        // Małe opóźnienie, aby nie przeciążyć API zewnętrznych
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(`Updated predictions for ${allCoins.length} coins`);
    } catch (error) {
      console.error("Error updating all predictions:", error);
    }
  }
}
