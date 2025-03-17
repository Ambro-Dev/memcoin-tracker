// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Ścieżki wymagające uwierzytelnienia
const protectedPaths = [
  "/dashboard",
  "/portfolio",
  "/coin",
  "/alerts",
  "/analytics",
  "/settings",
];

// Ścieżki, które są dostępne tylko dla niezalogowanych użytkowników
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sprawdź, czy użytkownik próbuje uzyskać dostęp do chronionych zasobów bez uwierzytelnienia
  const isProtectedPath = protectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  // Sprawdź, czy użytkownik próbuje uzyskać dostęp do stron logowania/rejestracji będąc już zalogowanym
  const isAuthRoute = authRoutes.some((route) => path === route);

  // Jeśli ścieżka jest chroniona i użytkownik nie jest zalogowany, przekieruj do logowania
  if (isProtectedPath && !token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Jeśli użytkownik jest zalogowany i próbuje uzyskać dostęp do stron logowania/rejestracji,
  // przekieruj na dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // W przeciwnym razie kontynuuj normalnie
  return NextResponse.next();
}

// Określenie, które ścieżki mają być obsługiwane przez middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/coin/:path*",
    "/alerts/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
