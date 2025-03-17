// src/app/alerts/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Alert } from "@/types";

export default function AlertsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtry
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
      return;
    }

    fetchAlerts();
  }, [status]);

  // Efekt dla filtrowania alertów
  useEffect(() => {
    if (!alerts.length) {
      setFilteredAlerts([]);
      return;
    }

    let result = [...alerts];

    // Filtruj według typu
    if (filterType !== "all") {
      result = result.filter((alert) => alert.type === filterType);
    }

    // Filtruj według statusu (przeczytane/nieprzeczytane)
    if (filterStatus === "read") {
      result = result.filter((alert) => alert.isRead);
    } else if (filterStatus === "unread") {
      result = result.filter((alert) => !alert.isRead);
    }

    // Filtruj według wyszukiwania
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (alert) =>
          alert.message.toLowerCase().includes(term) ||
          alert.memCoinId.toLowerCase().includes(term)
      );
    }

    setFilteredAlerts(result);
  }, [alerts, filterType, filterStatus, searchTerm]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/alerts");

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Wystąpił błąd podczas pobierania alertów");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark alert as read");
      }

      // Aktualizuj stan lokalnie
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
      setError("Wystąpił błąd podczas oznaczania alertu jako przeczytany");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/alerts/mark-all-read", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all alerts as read");
      }

      // Aktualizuj stan lokalnie
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => ({ ...alert, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      setError(
        "Wystąpił błąd podczas oznaczania wszystkich alertów jako przeczytane"
      );
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      // Usuń alert z lokalnego stanu
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.id !== alertId)
      );
    } catch (error) {
      console.error("Error deleting alert:", error);
      setError("Wystąpił błąd podczas usuwania alertu");
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "price_surge":
        return "📈";
      case "price_drop":
        return "📉";
      case "volume_spike":
        return "📊";
      case "social_trend":
        return "🔥";
      case "new_listing":
        return "🆕";
      default:
        return "ℹ️";
    }
  };

  const getAlertTypeClass = (type: string) => {
    switch (type) {
      case "price_surge":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "price_drop":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "volume_spike":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "social_trend":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "new_listing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "price_surge":
        return "Wzrost ceny";
      case "price_drop":
        return "Spadek ceny";
      case "volume_spike":
        return "Skok wolumenu";
      case "social_trend":
        return "Trend społecznościowy";
      case "new_listing":
        return "Nowa moneta";
      default:
        return type.replace("_", " ");
    }
  };

  if (status === "loading" || (isLoading && !alerts.length)) {
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
      <h1 className="text-2xl font-bold mb-6">Alerty</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Wszystkie typy</option>
              <option value="price_surge">Wzrost ceny</option>
              <option value="price_drop">Spadek ceny</option>
              <option value="volume_spike">Skok wolumenu</option>
              <option value="social_trend">Trend społecznościowy</option>
              <option value="new_listing">Nowa moneta</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="read">Przeczytane</option>
              <option value="unread">Nieprzeczytane</option>
            </select>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj w alertach..."
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {alerts.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Brak alertów
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== "all" || filterStatus !== "all"
              ? "Brak alertów spełniających kryteria wyszukiwania"
              : "Nie masz jeszcze żadnych alertów. Otrzymasz powiadomienia o istotnych zmianach dla obserwowanych memcoinów."}
          </p>
          <div className="mt-6">
            <Link
              href="/portfolio"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Przejdź do portfolio
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${
                alert.isRead
                  ? "border-gray-300 dark:border-gray-600"
                  : "border-blue-500"
              }`}
            >
              <div className="flex justify-between">
                <div className="flex">
                  <span className="mr-3 text-2xl">
                    {getAlertTypeIcon(alert.type)}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        href={`/coin/${alert.memCoinId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {alert.memCoinId}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getAlertTypeClass(
                          alert.type
                        )}`}
                      >
                        {getAlertTypeLabel(alert.type)}
                      </span>
                      {alert.priority > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          {alert.priority === 3
                            ? "Wysoki priorytet"
                            : "Średni priorytet"}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.createdAt.toString())}
                      </span>
                    </div>
                    <p
                      className={`${
                        alert.isRead
                          ? "text-gray-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4 items-start">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
