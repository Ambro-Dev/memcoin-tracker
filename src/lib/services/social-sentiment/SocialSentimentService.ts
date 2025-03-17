/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/services/social-sentiment/SocialSentimentService.ts
import { getTwitterSentimentData } from "@/lib/api/twitter";
import { SentimentScore } from "@/types";
import { prisma } from "@/lib/db";

export class SocialSentimentService {
  // Słowa kluczowe pozytywne i negatywne specyficzne dla krypto
  private positiveKeywords = [
    "moon",
    "bullish",
    "gem",
    "lambo",
    "rocket",
    "pump",
    "hodl",
    "hold",
    "gains",
    "buy",
    "profit",
    "win",
    "winner",
    "x10",
    "x100",
    "to the moon",
    "millionaire",
    "breakout",
    "explosion",
    "mooning",
    "trending",
    "viral",
    "whale",
    "early",
  ];

  private negativeKeywords = [
    "dump",
    "scam",
    "rugpull",
    "rug",
    "ponzi",
    "crash",
    "bear",
    "bearish",
    "sell",
    "selling",
    "dump",
    "fall",
    "lost",
    "lose",
    "loser",
    "waste",
    "avoid",
    "shit",
    "shitcoin",
    "dead",
    "rekt",
    "fake",
    "fraud",
    "red",
    "dip",
  ];

  async calculateSentimentScore(symbol: string): Promise<SentimentScore> {
    try {
      // Pobierz dane sentymentu z Twittera
      const twitterData = await getTwitterSentimentData(symbol);

      // Pobierz przechowywane wzmianki z bazy danych (z ostatnich 7 dni)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const storedMentions = await prisma.socialMention.findMany({
        where: {
          memCoin: {
            symbol: symbol.toUpperCase(),
          },
          timestamp: {
            gte: weekAgo,
          },
        },
      });

      // Jeśli nie mamy danych, zwróć neutralny wynik
      if (twitterData.tweetCount === 0 && storedMentions.length === 0) {
        return {
          positive: 0,
          negative: 0,
          neutral: 0,
          total: 0,
        };
      }

      // Analizuj sentyment tweetów
      let positive = 0;
      let negative = 0;
      let neutral = 0;

      // Analizuj nowe tweety
      for (const tweet of twitterData.topTweets) {
        const text = tweet.text.toLowerCase();

        // Prosta analiza oparta na słowach kluczowych
        const posMatches = this.positiveKeywords.filter((word) =>
          text.includes(word)
        ).length;
        const negMatches = this.negativeKeywords.filter((word) =>
          text.includes(word)
        ).length;

        // Określ sentyment w oparciu o przeważający rodzaj słów
        if (posMatches > negMatches) {
          positive++;
        } else if (negMatches > posMatches) {
          negative++;
        } else {
          neutral++;
        }

        // Opcjonalnie: Zapisz nowy tweet do bazy danych dla późniejszej analizy
        const coin = await prisma.memCoin.findFirst({
          where: { symbol: symbol.toUpperCase() },
        });

        if (coin) {
          await prisma.socialMention.create({
            data: {
              memCoinId: coin.id,
              platform: "Twitter",
              postId: tweet.id,
              content: tweet.text,
              sentiment:
                posMatches > negMatches ? 1 : negMatches > posMatches ? -1 : 0,
              engagement: this.calculateEngagement(tweet),
              timestamp: new Date(tweet.created_at),
              url: `https://twitter.com/twitter/status/${tweet.id}`,
            },
          });
        }
      }

      // Dodaj sentyment przechowywanych wzmianek
      for (const mention of storedMentions) {
        if (mention.sentiment > 0) {
          positive++;
        } else if (mention.sentiment < 0) {
          negative++;
        } else {
          neutral++;
        }
      }

      // Oblicz całkowity sentyment
      const total = this.calculateTotalSentiment(
        positive,
        negative,
        neutral,
        twitterData.tweetCount
      );

      return {
        positive,
        negative,
        neutral,
        total,
      };
    } catch (error) {
      console.error(`Error calculating sentiment for ${symbol}:`, error);
      return {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
      };
    }
  }

  private calculateEngagement(tweet: any): number {
    const { retweet_count, reply_count, like_count, quote_count } =
      tweet.public_metrics;
    return (
      retweet_count * 2 + reply_count * 1.5 + like_count + quote_count * 2.5
    );
  }

  private calculateTotalSentiment(
    positive: number,
    negative: number,
    neutral: number,
    totalMentions: number
  ): number {
    // Jeśli brak wzmianek, zwróć neutralną wartość
    if (totalMentions === 0) return 50;

    // Oblicz procent pozytywnych wzmianek
    const positivePercentage = (positive / totalMentions) * 100;

    // Oblicz procent negatywnych wzmianek
    const negativePercentage = (negative / totalMentions) * 100;

    // Normalizuj do wartości 0-100, gdzie 50 jest neutralne,
    // powyżej 50 jest pozytywne, poniżej 50 jest negatywne
    return Math.min(
      Math.max(50 + (positivePercentage - negativePercentage) / 2, 0),
      100
    );
  }

  async getSentimentBreakdown(symbol: string): Promise<any> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Pobierz wzmianki z podziałem na platformy
      const mentions = await prisma.socialMention.findMany({
        where: {
          memCoin: {
            symbol: symbol.toUpperCase(),
          },
          timestamp: {
            gte: weekAgo,
          },
        },
      });

      // Grupuj wzmianki według platformy
      const platformGroups: Record<string, any[]> = {};

      mentions.forEach((mention) => {
        if (!platformGroups[mention.platform]) {
          platformGroups[mention.platform] = [];
        }
        platformGroups[mention.platform].push(mention);
      });

      // Analizuj sentyment dla każdej platformy
      const breakdown: Record<string, any> = {};

      Object.entries(platformGroups).forEach(([platform, platformMentions]) => {
        let positive = 0;
        let negative = 0;
        let neutral = 0;

        platformMentions.forEach((mention) => {
          if (mention.sentiment > 0) {
            positive++;
          } else if (mention.sentiment < 0) {
            negative++;
          } else {
            neutral++;
          }
        });

        const totalMentions = platformMentions.length;

        breakdown[platform] = {
          positive,
          negative,
          neutral,
          totalMentions,
          score: this.calculateTotalSentiment(
            positive,
            negative,
            neutral,
            totalMentions
          ),
        };
      });

      // Dodaj podsumowanie
      const score = await this.calculateSentimentScore(symbol);

      return {
        overall: score,
        platforms: breakdown,
        timeAnalysis: await this.getTimeBasedAnalysis(symbol),
      };
    } catch (error) {
      console.error(`Error getting sentiment breakdown for ${symbol}:`, error);
      return {
        overall: { positive: 0, negative: 0, neutral: 0, total: 50 },
        platforms: {},
        timeAnalysis: [],
      };
    }
  }

  private async getTimeBasedAnalysis(symbol: string): Promise<any[]> {
    // Grupuj wzmianki według dni, aby pokazać trend sentymentu
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const mentions = await prisma.socialMention.findMany({
      where: {
        memCoin: {
          symbol: symbol.toUpperCase(),
        },
        timestamp: {
          gte: weekAgo,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Grupuj według dni
    const dayGroups: Record<string, any[]> = {};

    mentions.forEach((mention) => {
      const day = mention.timestamp.toISOString().split("T")[0];

      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }

      dayGroups[day].push(mention);
    });

    // Oblicz sentyment dla każdego dnia
    return Object.entries(dayGroups).map(([day, dayMentions]) => {
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      let totalEngagement = 0;

      dayMentions.forEach((mention) => {
        if (mention.sentiment > 0) {
          positive++;
        } else if (mention.sentiment < 0) {
          negative++;
        } else {
          neutral++;
        }

        totalEngagement += mention.engagement;
      });

      const totalMentions = dayMentions.length;

      return {
        date: day,
        mentionCount: totalMentions,
        engagement: totalEngagement,
        sentiment: this.calculateTotalSentiment(
          positive,
          negative,
          neutral,
          totalMentions
        ),
      };
    });
  }
}
