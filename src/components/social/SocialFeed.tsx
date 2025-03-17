// src/components/social/SocialFeed.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { SocialMention } from "@/types";

interface SocialFeedProps {
  mentions: SocialMention[];
  symbol: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ mentions, symbol }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "engagement">("latest");

  // Pobierz unikalne platformy
  const platforms = [
    "all",
    ...new Set(mentions.map((mention) => mention.platform)),
  ];

  // Filtruj i sortuj wzmianki
  const filteredMentions = mentions
    .filter(
      (mention) =>
        selectedPlatform === "all" || mention.platform === selectedPlatform
    )
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } else {
        return b.engagement - a.engagement;
      }
    });

  // Formatowanie daty
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Określanie koloru sentymentu
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0) return "bg-green-100 text-green-800";
    if (sentiment < 0) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Formatowanie treści - dodanie podświetlenia dla symbolu
  const formatContent = (content: string) => {
    // Prosta implementacja - można rozszerzyć o bardziej zaawansowane formatowanie
    const regex = new RegExp(
      `\\b${symbol}\\b|\\$${symbol}\\b|#${symbol}\\b`,
      "gi"
    );
    const formattedContent = content.replace(
      regex,
      (match) =>
        `<span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1 rounded">${match}</span>`
    );

    return { __html: formattedContent };
  };

  // Pomocnicze obrazki platform
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "/icons/twitter.svg";
      case "reddit":
        return "/icons/reddit.svg";
      case "telegram":
        return "/icons/telegram.svg";
      case "discord":
        return "/icons/discord.svg";
      default:
        return "/icons/social-generic.svg";
    }
  };

  // Formatuj URL platformy
  const formatPlatformName = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  // Formatuj wskaźnik zaangażowania
  const formatEngagement = (engagement: number) => {
    if (engagement >= 1000) {
      return `${(engagement / 1000).toFixed(1)}K`;
    }
    return engagement.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
        <h3 className="text-lg font-medium">
          Ostatnie wzmianki w mediach społecznościowych
        </h3>
        <div className="flex space-x-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === "all"
                  ? "Wszystkie platformy"
                  : formatPlatformName(platform)}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "latest" | "engagement")
            }
            className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">Najnowsze</option>
            <option value="engagement">Popularne</option>
          </select>
        </div>
      </div>

      {filteredMentions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-2">Brak wzmianek spełniających kryteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMentions.map((mention) => (
            <div
              key={mention.id}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 relative mt-1">
                    <Image
                      src={getPlatformIcon(mention.platform)}
                      alt={mention.platform}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">
                        {formatPlatformName(mention.platform)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(mention.timestamp.toString())}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(
                          mention.sentiment
                        )}`}
                      >
                        {mention.sentiment > 0
                          ? "Pozytywny"
                          : mention.sentiment < 0
                          ? "Negatywny"
                          : "Neutralny"}
                      </span>
                    </div>
                    <div
                      className="text-sm text-gray-700 dark:text-gray-300 mb-2"
                      dangerouslySetInnerHTML={formatContent(mention.content)}
                    />
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="flex items-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {formatEngagement(mention.engagement)} zaangażowań
                      </span>
                      {mention.url && (
                        <a
                          href={mention.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Zobacz źródło
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMentions.length > 0 && (
        <div className="text-center mt-6">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
            Załaduj więcej
          </button>
        </div>
      )}
    </div>
  );
};
