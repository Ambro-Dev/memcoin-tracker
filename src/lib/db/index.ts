// src/lib/db/index.ts
import { PrismaClient } from '@prisma/client';

// Unikamy tworzenia wielu instancji Prisma Client w środowisku deweloperskim
// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}