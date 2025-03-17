// src/types/index.ts
export interface MemCoin {
  id: string;
  symbol: string;
  name: string;
  logo: string | null | undefined;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply?: number;
  totalSupply?: number;
  ath: number;
  athDate: Date;
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
  exchanges: string[];
  socialScore: number;
  communityGrowth: number;
  liquidityScore: number;
  developmentActivity?: number;
  successProbability?: number;
}

export interface PriceHistory {
  id: string;
  memCoinId: string;
  price: number;
  timestamp: Date;
  volume: number;
}

export interface SocialMention {
  id: string;
  memCoinId: string;
  platform: string;
  postId: string;
  content: string;
  sentiment: number;
  engagement: number;
  timestamp: Date;
  url?: string;
}

export interface Alert {
  id: string;
  memCoinId: string;
  type: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  priority: number;
  userId: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: Record<string, unknown>;
}

export interface Watchlist {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: WatchlistItem[];
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  memCoinId: string;
  addedAt: Date;
  notes?: string;
  targetPrice?: number;
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface PriceIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  volumeChange24h: number;
}

export interface SuccessPrediction {
  symbol: string;
  name: string;
  successProbability: number;
  factors: {
    socialSentiment: SentimentScore;
    technicalAnalysis: PriceIndicators;
    communityGrowth: number;
    liquidityScore: number;
  };
}
