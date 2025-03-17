/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api/coingecko.ts
import axios from "axios";
import { MemCoin } from "@/types";

const API_URL = "https://api.coingecko.com/api/v3";
// Pro API key (opcjonalnie)
const API_KEY = process.env.COINGECKO_API_KEY;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: API_KEY ? { "x-cg-pro-api-key": API_KEY } : {},
});

export async function getMemCoins(
  page = 1,
  perPage = 100,
  category = "meme-token"
): Promise<any[]> {
  try {
    const response = await axiosInstance.get("/coins/markets", {
      params: {
        vs_currency: "usd",
        category,
        order: "market_cap_desc",
        per_page: perPage,
        page,
        sparkline: false,
        price_change_percentage: "24h",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching meme coins from CoinGecko:", error);
    throw error;
  }
}

export async function getCoinDetails(coinId: string): Promise<any> {
  try {
    const response = await axiosInstance.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: true,
        market_data: true,
        community_data: true,
        developer_data: true,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching details for coin ${coinId}:`, error);
    throw error;
  }
}

export async function getCoinHistoricalData(
  coinId: string,
  days: number | "max" = 30
): Promise<any> {
  try {
    const response = await axiosInstance.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: "usd",
        days,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for coin ${coinId}:`, error);
    throw error;
  }
}

export async function getTrendingCoins(): Promise<any[]> {
  try {
    const response = await axiosInstance.get("/search/trending");
    return response.data.coins;
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    throw error;
  }
}

export function mapCoinGeckoToMemCoin(coinData: any): Partial<MemCoin> {
  return {
    symbol: coinData.symbol.toUpperCase(),
    name: coinData.name,
    logo: coinData.image,
    currentPrice: coinData.current_price,
    priceChange24h: coinData.price_change_24h || 0,
    priceChangePercentage24h: coinData.price_change_percentage_24h || 0,
    marketCap: coinData.market_cap || 0,
    volume24h: coinData.total_volume || 0,
    circulatingSupply: coinData.circulating_supply,
    totalSupply: coinData.total_supply,
    ath: coinData.ath,
    athDate: new Date(coinData.ath_date),
    rank: coinData.market_cap_rank,
    // Te wartości będą aktualizowane przez inne serwisy
    socialScore: 0,
    communityGrowth: 0,
    liquidityScore: 0,
    exchanges: [],
  };
}
