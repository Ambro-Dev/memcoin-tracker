import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Oznacz wszystkie alerty użytkownika jako przeczytane
    await prisma.alert.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All alerts marked as read",
    });
  } catch (error) {
    console.error("Error marking alerts as read:", error);
    return NextResponse.json(
      { error: "Failed to mark alerts as read" },
      { status: 500 }
    );
  }
}
