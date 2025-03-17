import { useState, useEffect } from "react";
import { SuccessPrediction } from "@/types";

interface UsePredictionsOptions {
  limit?: number;
  refreshInterval?: number;
}

interface UsePredictionsResult {
  predictions: SuccessPrediction[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePredictions({
  limit = 10,
  refreshInterval = 0,
}: UsePredictionsOptions = {}): UsePredictionsResult {
  const [predictions, setPredictions] = useState<SuccessPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = `/api/predictions?limit=${limit}`;
      if (forceRefresh) {
        // If we're forcing a refresh, we'll call updateAll endpoint first
        await fetch("/api/predictions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "updateAll" }),
        });
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setError("Wystąpił błąd podczas pobierania prognoz");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();

    // Set up interval for refreshing data if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchPredictions();
      }, refreshInterval);

      // Clean up interval
      return () => clearInterval(intervalId);
    }
  }, [limit, refreshInterval]);

  const refresh = async () => {
    await fetchPredictions(true);
  };

  return {
    predictions,
    isLoading,
    error,
    refresh,
  };
}
