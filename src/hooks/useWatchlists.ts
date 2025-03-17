/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Watchlist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
}

interface WatchlistItem {
  id: string;
  watchlistId: string;
  memCoinId: string;
  addedAt: string;
  notes?: string;
  targetPrice?: number;
  memCoin: any; // You can use your MemCoin type here
}

interface UseWatchlistsResult {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  isLoading: boolean;
  error: string | null;
  setSelectedWatchlist: (watchlist: Watchlist | null) => void;
  createWatchlist: (name: string) => Promise<void>;
  updateWatchlist: (id: string, name: string) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  addCoinToWatchlist: (
    watchlistId: string,
    coinSymbol: string,
    notes?: string,
    targetPrice?: number
  ) => Promise<void>;
  updateWatchlistItem: (
    id: string,
    notes?: string,
    targetPrice?: number
  ) => Promise<void>;
  removeFromWatchlist: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWatchlists(): UseWatchlistsResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = async () => {
    if (status !== "authenticated") {
      setWatchlists([]);
      setSelectedWatchlist(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/portfolio/watchlist");

      if (!response.ok) {
        throw new Error("Failed to fetch watchlists");
      }

      const data = await response.json();
      setWatchlists(data.watchlists);

      // If we have watchlists and no selected watchlist, select the first one
      if (data.watchlists.length > 0 && !selectedWatchlist) {
        setSelectedWatchlist(data.watchlists[0]);
      } else if (selectedWatchlist) {
        // Update selected watchlist with fresh data
        const updatedSelected = data.watchlists.find(
          (w: Watchlist) => w.id === selectedWatchlist.id
        );
        if (updatedSelected) {
          setSelectedWatchlist(updatedSelected);
        } else if (data.watchlists.length > 0) {
          // If the selected watchlist no longer exists, select the first one
          setSelectedWatchlist(data.watchlists[0]);
        } else {
          setSelectedWatchlist(null);
        }
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      setError("Wystąpił błąd podczas pobierania list obserwowanych");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchWatchlists();
    }
  }, [status]);

  const createWatchlist = async (name: string) => {
    if (!name.trim() || status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create watchlist");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error creating watchlist:", error);
      setError("Wystąpił błąd podczas tworzenia listy obserwowanych");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWatchlist = async (id: string, name: string) => {
    if (!name.trim() || status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error updating watchlist:", error);
      setError("Wystąpił błąd podczas aktualizacji listy obserwowanych");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWatchlist = async (id: string) => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/portfolio/watchlist?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete watchlist");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      setError("Wystąpił błąd podczas usuwania listy obserwowanych");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCoinToWatchlist = async (
    watchlistId: string,
    coinSymbol: string,
    notes?: string,
    targetPrice?: number
  ) => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          watchlistId,
          coinSymbol,
          notes,
          targetPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add coin to watchlist");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error adding coin to watchlist:", error);
      setError("Wystąpił błąd podczas dodawania monety do listy");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWatchlistItem = async (
    id: string,
    notes?: string,
    targetPrice?: number
  ) => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          notes,
          targetPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist item");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error updating watchlist item:", error);
      setError("Wystąpił błąd podczas aktualizacji elementu listy");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (itemId: string) => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/portfolio/watchlist/items?id=${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }

      await fetchWatchlists();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setError("Wystąpił błąd podczas usuwania z listy obserwowanych");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchWatchlists();
  };

  return {
    watchlists,
    selectedWatchlist,
    isLoading,
    error,
    setSelectedWatchlist,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addCoinToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    refresh,
  };
}
