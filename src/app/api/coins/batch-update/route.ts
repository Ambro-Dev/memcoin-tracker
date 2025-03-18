/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/coins/batch-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CoinRaw = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: number;
  last_updated: string;
  price_change_percentage_24h_in_currency: number;
};

export async function POST(request: NextRequest) {
  try {
    // Pobierz dane z requestu
    const coinsData = await request.json();

    console.log("coinsData", coinsData);

    // Sprawdź, czy dane są tablicą
    if (!Array.isArray(coinsData)) {
      return NextResponse.json(
        { error: "Expected an array of coin data" },
        { status: 400 }
      );
    }

    const transformedData = coinsData[0].json.map((coin: CoinRaw) => {
      return {
        json: {
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          logo: coin.image,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_24h || 0,
          priceChangePercentage24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap || 0,
          volume24h: coin.total_volume || 0,
          circulatingSupply: coin.circulating_supply,
          totalSupply: coin.total_supply,
          ath: coin.ath,
          athDate: coin.ath_date,
        },
      };
    });

    // Liczniki dla monitorowania aktualizacji
    let updated = 0;
    let created = 0;
    let failed = 0;
    const errors: any[] | undefined = [];

    // Przetwarzaj dane wsadowo dla lepszej wydajności
    const batchSize = 50;

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);

      // Przetwarzaj każdą monetę w partii
      await Promise.all(
        batch.map(async (transformedData: any) => {
          try {
            const {
              symbol,
              name,
              logo,
              currentPrice,
              priceChange24h,
              priceChangePercentage24h,
              marketCap,
              volume24h,
              circulatingSupply,
              totalSupply,
              exchanges = [],
            } = transformedData;

            // Podstawowa walidacja
            if (!symbol) {
              throw new Error("Symbol is required");
            }

            // Znormalizuj symbol do wielkich liter
            const normalizedSymbol = symbol.toUpperCase();

            // Sprawdź, czy moneta już istnieje
            const existingCoin = await prisma.memCoin.findUnique({
              where: { symbol: normalizedSymbol },
            });

            if (existingCoin) {
              // Aktualizuj istniejącą monetę
              await prisma.memCoin.update({
                where: { id: existingCoin.id },
                data: {
                  name: name || existingCoin.name,
                  logo: logo || existingCoin.logo,
                  currentPrice: currentPrice ?? existingCoin.currentPrice,
                  priceChange24h: priceChange24h ?? existingCoin.priceChange24h,
                  priceChangePercentage24h:
                    priceChangePercentage24h ??
                    existingCoin.priceChangePercentage24h,
                  marketCap: marketCap ?? existingCoin.marketCap,
                  volume24h: volume24h ?? existingCoin.volume24h,
                  circulatingSupply:
                    circulatingSupply ?? existingCoin.circulatingSupply,
                  totalSupply: totalSupply ?? existingCoin.totalSupply,
                  exchanges: exchanges.length
                    ? exchanges
                    : existingCoin.exchanges,
                  updatedAt: new Date(),
                },
              });

              updated++;
            } else {
              // Utwórz nową monetę
              await prisma.memCoin.create({
                data: {
                  symbol: normalizedSymbol,
                  name: name || normalizedSymbol,
                  logo: logo || null,
                  currentPrice: currentPrice || 0,
                  priceChange24h: priceChange24h || 0,
                  priceChangePercentage24h: priceChangePercentage24h || 0,
                  marketCap: marketCap || 0,
                  volume24h: volume24h || 0,
                  circulatingSupply: circulatingSupply || null,
                  totalSupply: totalSupply || null,
                  ath: currentPrice || 0, // Początkowa wartość ATH
                  athDate: new Date(),
                  exchanges: exchanges || [],
                  socialScore: 0,
                  communityGrowth: 0,
                  liquidityScore: 0,
                },
              });

              created++;
            }
          } catch (error) {
            failed++;
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            errors.push(
              `Error processing coin ${transformedData.symbol}: ${errorMessage}`
            );
          }
        })
      );
    }

    // Zwróć podsumowanie operacji
    return NextResponse.json({
      success: true,
      summary: {
        total: coinsData.length,
        updated,
        created,
        failed,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in batch update:", error);
    return NextResponse.json(
      {
        error: "Failed to process batch update",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
