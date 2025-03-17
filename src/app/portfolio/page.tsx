/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/portfolio/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MemCoin } from "@/types";

interface WatchlistItem {
  id: string;
  watchlistId: string;
  memCoinId: string;
  addedAt: string;
  notes?: string;
  targetPrice?: number;
  memCoin: MemCoin;
}

interface Watchlist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
}

export default function PortfolioPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stan dla operacji na watchlistach
  const [newWatchlistName, setNewWatchlistName] = useState<string>("");
  const [isCreatingWatchlist, setIsCreatingWatchlist] =
    useState<boolean>(false);
  const [editingWatchlistId, setEditingWatchlistId] = useState<string | null>(
    null
  );
  const [editingWatchlistName, setEditingWatchlistName] = useState<string>("");

  // Stan dla notatek i targetPrice edycji
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>("");
  const [editingTargetPrice, setEditingTargetPrice] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
      return;
    }

    fetchWatchlists();
  }, [status]);

  const fetchWatchlists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/portfolio/watchlist");

      if (!response.ok) {
        throw new Error("Failed to fetch watchlists");
      }

      const data = await response.json();
      setWatchlists(data.watchlists);

      // Wybierz pierwszą watchlistę, jeśli istnieje
      if (data.watchlists.length > 0 && !selectedWatchlist) {
        setSelectedWatchlist(data.watchlists[0]);
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      setError("Wystąpił błąd podczas pobierania list obserwowanych");
    } finally {
      setIsLoading(false);
    }
  };

  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newWatchlistName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create watchlist");
      }

      // Odśwież listy obserwowanych
      await fetchWatchlists();

      // Resetuj formularz
      setNewWatchlistName("");
      setIsCreatingWatchlist(false);
    } catch (error) {
      console.error("Error creating watchlist:", error);
      setError("Wystąpił błąd podczas tworzenia listy obserwowanych");
    } finally {
      setIsLoading(false);
    }
  };

  const updateWatchlist = async (id: string) => {
    if (!editingWatchlistName.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/portfolio/watchlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name: editingWatchlistName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist");
      }

      // Odśwież listy obserwowanych
      await fetchWatchlists();

      // Resetuj formularz
      setEditingWatchlistId(null);
      setEditingWatchlistName("");
    } catch (error) {
      console.error("Error updating watchlist:", error);
      setError("Wystąpił błąd podczas aktualizacji listy obserwowanych");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWatchlist = async (id: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę listę obserwowanych?")) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/portfolio/watchlist?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete watchlist");
      }

      // Odśwież listy obserwowanych
      await fetchWatchlists();

      // Jeśli usunięto aktualnie wybraną listę, wybierz inną
      if (selectedWatchlist?.id === id) {
        setSelectedWatchlist(null);
      }
    } catch (error: any) {
      console.error("Error deleting watchlist:", error);
      setError(
        error.message || "Wystąpił błąd podczas usuwania listy obserwowanych"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateWatchlistItem = async (id: string) => {
    try {
      setIsLoading(true);

      const targetPrice = editingTargetPrice
        ? parseFloat(editingTargetPrice)
        : null;

      const response = await fetch("/api/portfolio/watchlist/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          notes: editingNotes,
          targetPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist item");
      }

      // Odśwież listy obserwowanych
      await fetchWatchlists();

      // Resetuj formularz
      setEditingItemId(null);
      setEditingNotes("");
      setEditingTargetPrice("");
    } catch (error) {
      console.error("Error updating watchlist item:", error);
      setError("Wystąpił błąd podczas aktualizacji elementu listy");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWatchlistItem = async (id: string) => {
    if (
      !window.confirm(
        "Czy na pewno chcesz usunąć tę monetę z listy obserwowanych?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/portfolio/watchlist/items?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete watchlist item");
      }

      // Odśwież listy obserwowanych
      await fetchWatchlists();
    } catch (error) {
      console.error("Error deleting watchlist item:", error);
      setError("Wystąpił błąd podczas usuwania elementu listy");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingItem = (item: WatchlistItem) => {
    setEditingItemId(item.id);
    setEditingNotes(item.notes || "");
    setEditingTargetPrice(item.targetPrice ? item.targetPrice.toString() : "");
  };

  // Formatowanie danych
  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return price.toExponential(2);
    }
    return price < 0.01
      ? price.toFixed(8)
      : price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
  };

  const formatPercentage = (percentage: number) => {
    return percentage.toFixed(2);
  };

  // Obliczenie różnicy między ceną docelową a aktualną
  const calculateTargetDifference = (
    currentPrice: number,
    targetPrice?: number
  ) => {
    if (!targetPrice) return null;

    const difference = ((targetPrice - currentPrice) / currentPrice) * 100;
    return difference;
  };

  if (status === "loading" || (isLoading && !watchlists.length)) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Panel boczny z listami */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Moje listy</h2>
              <button
                onClick={() => setIsCreatingWatchlist(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {isCreatingWatchlist && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <input
                  type="text"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="Nazwa listy"
                  className="w-full p-2 mb-2 border rounded"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={createWatchlist}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={() => setIsCreatingWatchlist(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {watchlists.map((watchlist) => (
                <li
                  key={watchlist.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedWatchlist?.id === watchlist.id
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {editingWatchlistId === watchlist.id ? (
                      <input
                        type="text"
                        value={editingWatchlistName}
                        onChange={(e) =>
                          setEditingWatchlistName(e.target.value)
                        }
                        className="flex-1 p-1 border rounded mr-2"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setSelectedWatchlist(watchlist)}
                        className="flex-1"
                      >
                        {watchlist.name}
                        <span className="ml-2 text-xs text-gray-500">
                          ({watchlist.items.length})
                        </span>
                      </span>
                    )}

                    <div className="flex space-x-1">
                      {editingWatchlistId === watchlist.id ? (
                        <>
                          <button
                            onClick={() => updateWatchlist(watchlist.id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingWatchlistId(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingWatchlistId(watchlist.id);
                              setEditingWatchlistName(watchlist.name);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteWatchlist(watchlist.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Główna zawartość */}
        <div className="md:col-span-3">
          {selectedWatchlist ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">
                {selectedWatchlist.name}
              </h2>

              {selectedWatchlist.items.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Nie dodano jeszcze żadnych monet do tej listy obserwowanych.
                  </p>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Przejdź do dashboardu, aby dodać monety
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="py-3 px-6 text-left">Moneta</th>
                        <th className="py-3 px-6 text-left">Cena</th>
                        <th className="py-3 px-6 text-left">Zmiana 24h</th>
                        <th className="py-3 px-6 text-left">Cel cenowy</th>
                        <th className="py-3 px-6 text-left">Notatki</th>
                        <th className="py-3 px-6 text-left">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {selectedWatchlist.items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {item.memCoin.logo ? (
                                <Image
                                  src={item.memCoin.logo}
                                  alt={item.memCoin.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full mr-2"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                                  <span className="text-xs">
                                    {item.memCoin.symbol.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <Link
                                href={`/coin/${item.memCoin.symbol}`}
                                className="hover:underline"
                              >
                                <span className="font-medium">
                                  {item.memCoin.symbol}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  {item.memCoin.name}
                                </span>
                              </Link>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            ${formatPrice(item.memCoin.currentPrice)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={
                                item.memCoin.priceChangePercentage24h >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {item.memCoin.priceChangePercentage24h >= 0
                                ? "+"
                                : ""}
                              {formatPercentage(
                                item.memCoin.priceChangePercentage24h
                              )}
                              %
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {editingItemId === item.id ? (
                              <input
                                type="number"
                                step="0.000001"
                                value={editingTargetPrice}
                                onChange={(e) =>
                                  setEditingTargetPrice(e.target.value)
                                }
                                className="w-full p-1 border rounded"
                                placeholder="Cel cenowy"
                              />
                            ) : (
                              <div>
                                {item.targetPrice ? (
                                  <>
                                    <div>${formatPrice(item.targetPrice)}</div>
                                    <div
                                      className={
                                        (calculateTargetDifference(
                                          item.memCoin.currentPrice,
                                          item.targetPrice
                                        ) as number) >= 0
                                          ? "text-green-500 text-xs"
                                          : "text-red-500 text-xs"
                                      }
                                    >
                                      {(calculateTargetDifference(
                                        item.memCoin.currentPrice,
                                        item.targetPrice
                                      ) as number) >= 0
                                        ? "+"
                                        : ""}
                                      {formatPercentage(
                                        calculateTargetDifference(
                                          item.memCoin.currentPrice,
                                          item.targetPrice
                                        ) as number
                                      )}
                                      %
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-400">
                                    Nie ustawiono
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {editingItemId === item.id ? (
                              <textarea
                                value={editingNotes}
                                onChange={(e) =>
                                  setEditingNotes(e.target.value)
                                }
                                className="w-full p-1 border rounded"
                                placeholder="Notatki..."
                                rows={2}
                              />
                            ) : (
                              <div className="max-w-xs truncate">
                                {item.notes || (
                                  <span className="text-gray-400">
                                    Brak notatek
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {editingItemId === item.id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => updateWatchlistItem(item.id)}
                                  className="text-green-500 hover:text-green-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditingItem(item)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteWatchlistItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Wybierz listę obserwowanych z panelu bocznego lub utwórz nową.
              </p>
              <button
                onClick={() => setIsCreatingWatchlist(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Utwórz nową listę
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
