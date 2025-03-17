// src/app/api/portfolio/watchlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Pobierz wszystkie watchlisty użytkownika
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Pobierz wszystkie watchlisty użytkownika wraz z ich elementami i danymi monety
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            memCoin: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ watchlists });
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlists" },
      { status: 500 }
    );
  }
}

// Utwórz nową watchlistę
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Utwórz nową watchlistę
    const watchlist = await prisma.watchlist.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error creating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 }
    );
  }
}

// Zaktualizuj istniejącą watchlistę
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    // Sprawdź, czy watchlista należy do użytkownika
    const existingWatchlist = await prisma.watchlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    // Zaktualizuj watchlistę
    const watchlist = await prisma.watchlist.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 }
    );
  }
}

// Usuń watchlistę
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Sprawdź, czy watchlista należy do użytkownika
    const existingWatchlist = await prisma.watchlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingWatchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 }
      );
    }

    // Sprawdź, czy to nie jest jedyna watchlista użytkownika
    const watchlistCount = await prisma.watchlist.count({
      where: { userId },
    });

    if (watchlistCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only watchlist" },
        { status: 400 }
      );
    }

    // Usuń watchlistę i jej elementy
    await prisma.watchlist.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Watchlist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist" },
      { status: 500 }
    );
  }
}
