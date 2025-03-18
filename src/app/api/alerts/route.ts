// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Pobierz wszystkie alerty dla użytkownika
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Pobierz alerty dla użytkownika, posortowane od najnowszych
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        memCoin: {
          select: {
            symbol: true,
            name: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// Utwórz nowy alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();
    const { memCoinId, type, message, priority = 1 } = body;

    // Walidacja
    if (!memCoinId || !type || !message) {
      return NextResponse.json(
        { error: "Missing required fields: memCoinId, type, message" },
        { status: 400 }
      );
    }

    // Sprawdź czy memcoin istnieje
    const memCoin = await prisma.memCoin.findUnique({
      where: { id: memCoinId },
    });

    if (!memCoin) {
      return NextResponse.json({ error: "Memcoin not found" }, { status: 404 });
    }

    // Utwórz alert
    const alert = await prisma.alert.create({
      data: {
        memCoinId,
        type,
        message,
        priority,
        userId,
      },
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// Aktualizuj alert (np. oznacz jako przeczytany)
export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required field: id" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    // Sprawdź czy alert istnieje i należy do użytkownika
    const alert = await prisma.alert.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Aktualizuj alert
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ alert: updatedAlert });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// Usuń alert
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required field: id" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Sprawdź czy alert istnieje i należy do użytkownika
    const alert = await prisma.alert.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Usuń alert
    await prisma.alert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
