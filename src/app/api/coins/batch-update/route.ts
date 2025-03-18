/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/coins/batch-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Pobierz dane z requestu
    const coinsData = await request.json();

    // Sprawdź, czy dane są tablicą
    if (!Array.isArray(coinsData)) {
      return NextResponse.json(
        { error: "Expected an array of coin data" },
        { status: 400 }
      );
    }

    // Liczniki dla monitorowania aktualizacji
    let updated = 0;
    let created = 0;
    let failed = 0;
    const errors: any[] | undefined = [];

    // Przetwarzaj dane wsadowo dla lepszej wydajności
    const batchSize = 50;

    for (let i = 0; i < coinsData.length; i += batchSize) {
      const batch = coinsData.slice(i, i + batchSize);

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
