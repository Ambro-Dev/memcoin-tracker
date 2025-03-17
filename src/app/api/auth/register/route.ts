// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Podstawowa walidacja
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Brakujące dane: imię, email lub hasło" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 8 znaków" },
        { status: 400 }
      );
    }

    // Sprawdź, czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik o podanym adresie email już istnieje" },
        { status: 409 }
      );
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Utwórz użytkownika w bazie danych
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Utwórz domyślną listę obserwowanych
    await prisma.watchlist.create({
      data: {
        name: "Moja lista",
        userId: user.id,
      },
    });

    // Usuń pole hasło z odpowiedzi
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Rejestracja zakończona pomyślnie",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji" },
      { status: 500 }
    );
  }
}
