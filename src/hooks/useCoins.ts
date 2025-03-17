/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCoins.ts
import { useState, useEffect } from "react";
import { MemCoin } from "@/types";

interface UseCoinsOptions {
  limit?: number;
  page?: number;
  sort?: string;
  filter?: string;
  refreshInterval?: number;
}

interface UseCoinsResult {
  coins: MemCoin[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setSort: (sort: string) => void;
  setFilter: (filter: string) => void;
}

export function useCoins({
  limit = 20,
  page = 1,
  sort = "marketCap",
  filter = "",
  refreshInterval = 0,
}: UseCoinsOptions = {}): UseCoinsResult {
  const [coins, setCoins] = useState<MemCoin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page,
    limit,
    totalCount: 0,
    totalPages: 0,
  });

  const [currentPage, setCurrentPage] = useState(page);
  const [currentSort, setCurrentSort] = useState(sort);
  const [currentFilter, setCurrentFilter] = useState(filter);

  const fetchCoins = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort: currentSort,
        ...(currentFilter && { filter: currentFilter }),
        ...(forceRefresh && { refresh: "true" }),
      });

      const response = await fetch(`/api/coins?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch coins");
      }

      const data = await response.json();
      setCoins(data.coins);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching coins:", error);
      setError("Wystąpił błąd podczas pobierania danych");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();

    // Set up interval for refreshing data if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchCoins();
      }, refreshInterval);

      // Clean up interval
      return () => clearInterval(intervalId);
    }
  }, [currentPage, currentSort, currentFilter, refreshInterval]);

  const refresh = async () => {
    await fetchCoins(true);
  };

  return {
    coins,
    isLoading,
    error,
    pagination,
    refresh,
    setPage: setCurrentPage,
    setSort: setCurrentSort,
    setFilter: setCurrentFilter,
  };
}
