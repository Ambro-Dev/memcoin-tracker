// src/app/api/portfolio/watchlist/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Dodaj monetę do watchlisty
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { watchlistId, coinSymbol, notes, targetPrice } =
      await request.json();

    if (!watchlistId || !coinSymbol) {
      return NextResponse.json(
        { error: "Watchlist ID and coin symbol are required" },
        { status: 400 }
      );
    }

    // Sprawdź, czy watchlista należy do użytkownika
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId,
      },
    });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    // Znajdź monetę na podstawie symbolu
    const coin = await prisma.memCoin.findFirst({
      where: {
        symbol: coinSymbol.toUpperCase(),
      },
    });

    if (!coin) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 });
    }

    // Sprawdź, czy moneta już istnieje w tej watchliście
    const existingItem = await prisma.watchlistItem.findFirst({
      where: {
        watchlistId,
        memCoinId: coin.id,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Coin already in watchlist" },
        { status: 409 }
      );
    }

    // Dodaj monetę do watchlisty
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        watchlistId,
        memCoinId: coin.id,
        notes,
        targetPrice,
      },
      include: {
        memCoin: true,
      },
    });

    return NextResponse.json({ watchlistItem });
  } catch (error) {
    console.error("Error adding coin to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add coin to watchlist" },
      { status: 500 }
    );
  }
}

// Aktualizuj element watchlisty
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { id, notes, targetPrice } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Sprawdź, czy element watchlisty należy do użytkownika
    const item = await prisma.watchlistItem.findUnique({
      where: { id },
      include: {
        watchlist: true,
      },
    });

    if (!item || item.watchlist.userId !== userId) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 }
      );
    }

    // Aktualizuj element watchlisty
    const updatedItem = await prisma.watchlistItem.update({
      where: { id },
      data: {
        notes,
        targetPrice,
      },
      include: {
        memCoin: true,
      },
    });

    return NextResponse.json({ watchlistItem: updatedItem });
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist item" },
      { status: 500 }
    );
  }
}

// Usuń element watchlisty
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Sprawdź, czy element watchlisty należy do użytkownika
    const item = await prisma.watchlistItem.findUnique({
      where: { id },
      include: {
        watchlist: true,
      },
    });

    if (!item || item.watchlist.userId !== userId) {
      return NextResponse.json(
        { error: "Watchlist item not found" },
        { status: 404 }
      );
    }

    // Usuń element watchlisty
    await prisma.watchlistItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Watchlist item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist item" },
      { status: 500 }
    );
  }
}
