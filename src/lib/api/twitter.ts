// src/lib/api/twitter.ts
import axios from "axios";

// Konfiguracja klucza API dla Twitter/X
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const API_URL = "https://api.twitter.com/2";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
  },
});

export interface TwitterSearchParams {
  query: string;
  maxResults?: number;
  startTime?: string;
  endTime?: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  author_id: string;
}

async function searchTweets(
  params: TwitterSearchParams
): Promise<TwitterTweet[]> {
  try {
    const response = await axiosInstance.get("/tweets/search/recent", {
      params: {
        query: params.query,
        max_results: params.maxResults || 10,
        start_time: params.startTime,
        end_time: params.endTime,
        "tweet.fields": "created_at,public_metrics,author_id", // Fixed with quotes
        expansions: "author_id",
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("Error searching Twitter:", error);
    return [];
  }
}

export async function getMemeCoinMentions(
  symbol: string,
  timeframe: "hour" | "day" | "week" = "day"
): Promise<TwitterTweet[]> {
  // Przygotowanie czasu rozpoczęcia na podstawie timeframe
  const now = new Date();
  const startTime = new Date();

  switch (timeframe) {
    case "hour":
      startTime.setHours(now.getHours() - 1);
      break;
    case "day":
      startTime.setDate(now.getDate() - 1);
      break;
    case "week":
      startTime.setDate(now.getDate() - 7);
      break;
  }

  // Format ISO dla Twitter API
  const formattedStartTime = startTime.toISOString();

  // Przygotowujemy zapytanie (z filtrami zaawansowanymi)
  // Szukamy zarówno po symbolu jak i hashtagu
  const query = `(${symbol} OR #${symbol.toLowerCase()}) -is:retweet lang:en`;

  return searchTweets({
    query,
    startTime: formattedStartTime,
    maxResults: 100,
  });
}

export function calculateEngagementScore(tweet: TwitterTweet): number {
  const { retweet_count, reply_count, like_count, quote_count } =
    tweet.public_metrics;

  // Prosty algorytm wagi zaangażowania (można dostosować)
  return (
    retweet_count * 2 + // Retweety są ważniejsze
    reply_count * 1.5 + // Odpowiedzi wykazują zaangażowanie
    like_count * 1 + // Polubienia są podstawowe
    quote_count * 2.5 // Cytaty pokazują wysokie zaangażowanie
  );
}

export async function getTwitterSentimentData(symbol: string): Promise<{
  tweetCount: number;
  totalEngagement: number;
  averageEngagement: number;
  topTweets: TwitterTweet[];
}> {
  try {
    // Pobierz tweety za ostatni dzień
    const tweets = await getMemeCoinMentions(symbol, "day");

    if (!tweets.length) {
      return {
        tweetCount: 0,
        totalEngagement: 0,
        averageEngagement: 0,
        topTweets: [],
      };
    }

    // Oblicz zaangażowanie dla każdego tweeta
    const tweetsWithEngagement = tweets.map((tweet) => ({
      ...tweet,
      engagementScore: calculateEngagementScore(tweet),
    }));

    // Sortuj tweety według zaangażowania i wybierz top 5
    const sortedTweets = [...tweetsWithEngagement].sort(
      (a, b) => b.engagementScore - a.engagementScore
    );

    const topTweets = sortedTweets.slice(0, 5);

    // Oblicz statystyki
    const totalEngagement = tweetsWithEngagement.reduce(
      (sum, tweet) => sum + tweet.engagementScore,
      0
    );

    return {
      tweetCount: tweets.length,
      totalEngagement,
      averageEngagement: totalEngagement / tweets.length,
      topTweets,
    };
  } catch (error) {
    console.error(`Error getting Twitter sentiment for ${symbol}:`, error);
    return {
      tweetCount: 0,
      totalEngagement: 0,
      averageEngagement: 0,
      topTweets: [],
    };
  }
}
