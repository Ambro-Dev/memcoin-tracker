import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Ten endpoint jest używany przez n8n, więc możesz dodać dodatkowe zabezpieczenia,
    // np. API key w nagłówkach

    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.N8N_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array of alerts" },
        { status: 400 }
      );
    }

    // Pobierz wszystkich użytkowników, którzy powinni otrzymać alerty
    // W rzeczywistej implementacji możesz dodać filtrowanie na podstawie ustawień alertów
    const users = await prisma.user.findMany();

    if (!users.length) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    const createdAlerts = [];

    // Dla każdego alertu i każdego użytkownika, utwórz wpis
    for (const alertData of body) {
      const { symbol, type, message, priority = 1 } = alertData;

      // Znajdź memcoin
      const memCoin = await prisma.memCoin.findFirst({
        where: {
          symbol: symbol.toUpperCase(),
        },
      });

      if (!memCoin) {
        console.warn(`Memcoin with symbol ${symbol} not found`);
        continue;
      }

      // Utwórz alerty dla wszystkich użytkowników
      for (const user of users) {
        // Sprawdź czy użytkownik ma tę monetę w jakiejkolwiek watchliście
        const watchlistItems = await prisma.watchlistItem.findMany({
          where: {
            memCoinId: memCoin.id,
            watchlist: {
              userId: user.id,
            },
          },
        });

        // Jeśli użytkownik nie obserwuje tej monety, pomiń
        // (opcjonalnie, możesz to wyłączyć, aby wszyscy użytkownicy otrzymywali wszystkie alerty)
        if (!watchlistItems.length) {
          continue;
        }

        const alert = await prisma.alert.create({
          data: {
            memCoinId: memCoin.id,
            type,
            message,
            priority,
            userId: user.id,
          },
        });

        createdAlerts.push(alert);
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: createdAlerts.length,
    });
  } catch (error) {
    console.error("Error creating batch alerts:", error);
    return NextResponse.json(
      { error: "Failed to create batch alerts" },
      { status: 500 }
    );
  }
}
