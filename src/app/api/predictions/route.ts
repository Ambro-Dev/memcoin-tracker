/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PredictionService } from "@/lib/services/prediction/PredictionService";
import { prisma } from "@/lib/db";

const predictionService = new PredictionService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");

    if (symbol) {
      // Pobierz predykcję dla konkretnego symbolu
      const coin = await prisma.memCoin.findUnique({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!coin) {
        return NextResponse.json({ error: "Coin not found" }, { status: 404 });
      }

      // Pobierz lub oblicz prawdopodobieństwo sukcesu
      let successProbability = coin.successProbability;

      // Jeśli brak obliczonej wartości lub wymuszamy ponowne obliczenie
      if (
        successProbability === null ||
        searchParams.get("refresh") === "true"
      ) {
        successProbability = await predictionService.predictSuccess(
          coin as any
        );
      }

      // Pobierz dodatkowe czynniki
      const sentimentBreakdown = await predictionService.getSentimentBreakdown(
        symbol
      );
      const technicalBreakdown = await predictionService.getTechnicalBreakdown(
        symbol
      );

      return NextResponse.json({
        symbol: coin.symbol,
        name: coin.name,
        successProbability,
        factors: {
          socialSentiment: sentimentBreakdown,
          technicalAnalysis: technicalBreakdown,
          communityGrowth: coin.communityGrowth,
          liquidityScore: coin.liquidityScore,
        },
      });
    } else {
      // Pobierz najlepsze predykcje
      const limit = parseInt(searchParams.get("limit") || "10");
      const predictions = await predictionService.getTopPredictions(limit);

      return NextResponse.json(predictions);
    }
  } catch (error) {
    console.error("Error processing prediction request:", error);
    return NextResponse.json(
      { error: "Failed to process prediction" },
      { status: 500 }
    );
  }
}

// Endpoint do wywoływania aktualizacji wszystkich predykcji
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "updateAll") {
      // Sprawdź uprawnienia (w produkcji dodaj zabezpieczenia)
      // W rzeczywistej aplikacji, zabezpiecz to odpowiednim middlewarem autoryzacji

      // Rozpocznij proces aktualizacji
      // Dla długotrwałych operacji, lepiej zaimplementować zadanie w tle
      predictionService
        .updateAllPredictions()
        .then(() => console.log("All predictions updated successfully"))
        .catch((err) => console.error("Error updating predictions:", err));

      return NextResponse.json({
        success: true,
        message: "Prediction update process started",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing prediction action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}

// Endpoint dla topowych predykcji
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 10 } = body;

    const predictions = await predictionService.getTopPredictions(limit);

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching top predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch top predictions" },
      { status: 500 }
    );
  }
}
