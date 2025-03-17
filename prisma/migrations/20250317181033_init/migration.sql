-- CreateTable
CREATE TABLE "MemCoin" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "priceChange24h" DOUBLE PRECISION NOT NULL,
    "priceChangePercentage24h" DOUBLE PRECISION NOT NULL,
    "marketCap" DOUBLE PRECISION NOT NULL,
    "volume24h" DOUBLE PRECISION NOT NULL,
    "circulatingSupply" DOUBLE PRECISION,
    "totalSupply" DOUBLE PRECISION,
    "ath" DOUBLE PRECISION NOT NULL,
    "athDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER,
    "exchanges" TEXT[],
    "socialScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "communityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liquidityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "developmentActivity" DOUBLE PRECISION,
    "successProbability" DOUBLE PRECISION,

    CONSTRAINT "MemCoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "memCoinId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMention" (
    "id" TEXT NOT NULL,
    "memCoinId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentiment" DOUBLE PRECISION NOT NULL,
    "engagement" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "url" TEXT,

    CONSTRAINT "SocialMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "memCoinId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "memCoinId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "targetPrice" DOUBLE PRECISION,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settings" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parameters" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PredictionModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemCoin_symbol_key" ON "MemCoin"("symbol");

-- CreateIndex
CREATE INDEX "PriceHistory_memCoinId_timestamp_idx" ON "PriceHistory"("memCoinId", "timestamp");

-- CreateIndex
CREATE INDEX "SocialMention_memCoinId_timestamp_idx" ON "SocialMention"("memCoinId", "timestamp");

-- CreateIndex
CREATE INDEX "SocialMention_platform_timestamp_idx" ON "SocialMention"("platform", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_userId_isRead_idx" ON "Alert"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Alert_memCoinId_createdAt_idx" ON "Alert"("memCoinId", "createdAt");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_watchlistId_memCoinId_key" ON "WatchlistItem"("watchlistId", "memCoinId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_memCoinId_fkey" FOREIGN KEY ("memCoinId") REFERENCES "MemCoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMention" ADD CONSTRAINT "SocialMention_memCoinId_fkey" FOREIGN KEY ("memCoinId") REFERENCES "MemCoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_memCoinId_fkey" FOREIGN KEY ("memCoinId") REFERENCES "MemCoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_memCoinId_fkey" FOREIGN KEY ("memCoinId") REFERENCES "MemCoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
