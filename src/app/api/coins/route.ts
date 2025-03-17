/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/coins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMemCoins, mapCoinGeckoToMemCoin } from "@/lib/api/coingecko";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sort = searchParams.get("sort") || "marketCap"; // Domyślne sortowanie
    const order = searchParams.get("order") || "desc"; // Domyślna kolejność
    const filter = searchParams.get("filter") || "";

    // Sprawdź, czy jest to żądanie świeżych danych
    const refresh = searchParams.get("refresh") === "true";

    if (refresh) {
      // Pobierz świeże dane z CoinGecko
      const coingeckoData = await getMemCoins();

      // Mapuj i zapisz dane do bazy
      for (const coinData of coingeckoData) {
        const mappedCoin = mapCoinGeckoToMemCoin(coinData);

        // Sprawdź, czy coin już istnieje w bazie
        const existingCoin = await prisma.memCoin.findUnique({
          where: { symbol: mappedCoin.symbol || "" },
        });

        if (existingCoin) {
          // Aktualizuj istniejący
          await prisma.memCoin.update({
            where: { id: existingCoin.id },
            data: {
              currentPrice: mappedCoin.currentPrice,
              priceChange24h: mappedCoin.priceChange24h,
              priceChangePercentage24h: mappedCoin.priceChangePercentage24h,
              marketCap: mappedCoin.marketCap,
              volume24h: mappedCoin.volume24h,
              rank: mappedCoin.rank,
              // Zachowaj istniejące wartości dla pól społecznościowych
            },
          });
        } else {
          // Dodaj nowy, jeśli nie istnieje
          await prisma.memCoin.create({
            data: {
              ...mappedCoin,
              symbol: mappedCoin.symbol || "",
              name: mappedCoin.name || "",
              currentPrice: mappedCoin.currentPrice || 0,
              priceChange24h: mappedCoin.priceChange24h || 0,
              priceChangePercentage24h:
                mappedCoin.priceChangePercentage24h || 0,
              marketCap: mappedCoin.marketCap || 0,
              volume24h: mappedCoin.volume24h || 0,
              ath: mappedCoin.ath || 0,
              athDate: mappedCoin.athDate || new Date(),
              socialScore: 0,
              communityGrowth: 0,
              liquidityScore: 0,
              exchanges: mappedCoin.exchanges || [],
            },
          });
        }
      }
    }

    // Oblicz parametry paginacji
    const skip = (page - 1) * limit;

    // Przygotuj odpowiednią klauzulę where dla filtrowania
    let whereClause = {};

    if (filter) {
      whereClause = {
        OR: [
          { symbol: { contains: filter, mode: "insensitive" } },
          { name: { contains: filter, mode: "insensitive" } },
        ],
      };
    }

    // Przygotuj klauzulę orderBy dla sortowania
    const orderByClause: any = {};
    orderByClause[sort] = order;

    // Pobierz dane z bazy
    const coins = await prisma.memCoin.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
    });

    // Pobierz całkowitą liczbę coinów dla paginacji
    const totalCount = await prisma.memCoin.count({
      where: whereClause,
    });

    // Zwróć dane z informacjami o paginacji
    return NextResponse.json({
      coins,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coins:", error);
    return NextResponse.json(
      { error: "Failed to fetch coins" },
      { status: 500 }
    );
  }
}

// Endpoint do pobierania szczegółów konkretnego coina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Pobierz dane z bazy
    const coin = await prisma.memCoin.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        priceHistory: {
          orderBy: { timestamp: "asc" },
          take: 30,
        },
        socialMentions: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!coin) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 });
    }

    return NextResponse.json(coin);
  } catch (error) {
    console.error("Error fetching coin details:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin details" },
      { status: 500 }
    );
  }
}
