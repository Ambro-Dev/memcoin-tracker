// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Generuje endpointy uwierzytelniania - /api/auth/*
const handler = NextAuth(authOptions);

// Eksportuje handlery dla różnych metod HTTP
export { handler as GET, handler as POST };
