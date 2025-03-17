// src/components/alerts/AlertPanel.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Alert } from "@/types";

export const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
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
        setError("Wystąpił błąd podczas ładowania alertów");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();

    // Odświeżaj co 10 minut
    const interval = setInterval(fetchAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

      // Aktualizuj stan
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
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
        return "bg-green-100 text-green-800";
      case "price_drop":
        return "bg-red-100 text-red-800";
      case "volume_spike":
        return "bg-blue-100 text-blue-800";
      case "social_trend":
        return "bg-purple-100 text-purple-800";
      case "new_listing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (isLoading && !alerts.length) {
    return (
      <div className="h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="h-64 flex justify-center items-center text-gray-500">
        Brak aktywnych alertów
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border-l-4 ${
            alert.isRead
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-blue-500 shadow"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex">
              <span className="mr-2">{getAlertTypeIcon(alert.type)}</span>
              <div>
                <div className="flex items-center space-x-2">
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
                    {alert.type.replace("_", " ")}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    alert.isRead ? "text-gray-500" : "text-gray-700"
                  }`}
                >
                  {alert.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(alert.createdAt.toString())}
                </p>
              </div>
            </div>
            {!alert.isRead && (
              <button
                onClick={() => markAsRead(alert.id)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Oznacz jako przeczytane
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="pt-2 text-center">
        <Link href="/alerts" className="text-sm text-blue-500 hover:underline">
          Zobacz wszystkie alerty
        </Link>
      </div>
    </div>
  );
};
