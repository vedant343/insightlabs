"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";

type ChatMessage = { role: "user" | "bot"; message: string };

interface CoinItem {
  item: {
    name: string;
    symbol: string;
  };
}

// API functions
async function fetchCurrentPrice(coinId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}

async function fetchTrendingCoins(): Promise<Array<{
  name: string;
  symbol: string;
}> | null> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/search/trending"
    );
    const data = await response.json();
    return data.coins.map((coin: CoinItem) => ({
      name: coin.item.name,
      symbol: coin.item.symbol,
    }));
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    return null;
  }
}

async function fetchBasicStats(coinId: string): Promise<{
  marketCap: number;
  change24h: number;
  description: string;
} | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    const data = await response.json();
    return {
      marketCap: data.market_data.market_cap.usd,
      change24h: data.market_data.price_change_percentage_24h,
      description: data.description.en,
    };
  } catch (error) {
    console.error("Error fetching basic stats:", error);
    return null;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", message: "Hi! Ask me about crypto prices or holdings..." },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", message: input }]);

    setIsThinking(true);
    setError(null);

    let botResponse = "";

    try {
      // Determine what the user wants
      if (/current price of ([a-zA-Z ]+)/i.test(input)) {
        const match = input.match(/current price of ([a-zA-Z ]+)/i);
        const coinId = match?.[1]?.trim().toLowerCase();
        if (coinId) {
          const price = await fetchCurrentPrice(coinId);
          if (price) {
            botResponse = `The current price of ${coinId} is $${price}`;
          } else {
            botResponse = `Sorry, I couldn't find the price for ${coinId}`;
          }
        }
      } else if (/trending coins/i.test(input)) {
        const trending = await fetchTrendingCoins();
        if (trending && trending.length) {
          botResponse =
            `Trending now:\n` +
            trending
              .slice(0, 5)
              .map((c, i) => `${i + 1}. ${c.name} (${c.symbol})`)
              .join("\n");
        } else {
          botResponse = `Sorry, I couldn't fetch trending coins.`;
        }
      } else if (/basic stats of ([a-zA-Z ]+)/i.test(input)) {
        const match = input.match(/basic stats of ([a-zA-Z ]+)/i);
        const coinId = match?.[1]?.trim().toLowerCase();
        if (coinId) {
          const stats = await fetchBasicStats(coinId);
          if (stats) {
            botResponse = `${coinId.toUpperCase()} Market Cap: $${
              stats.marketCap
            }\n24h Change: ${stats.change24h?.toFixed(2)}%\nAbout: ${
              stats.description
            }`;
          } else {
            botResponse = `Sorry, I couldn't find information for ${coinId}`;
          }
        }
      } else {
        botResponse = `I didn't get that. Try:\n- "current price of bitcoin"\n- "trending coins"\n- "basic stats of ethereum"`;
      }

      setMessages((prev) => [...prev, { role: "bot", message: botResponse }]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setError("Oops! Failed to fetch data.");
    } finally {
      setIsThinking(false);
      setInput("");
    }
  }

  return (
    <div className="flex flex-col p-4 max-w-md m-auto h-screen">
      <div className="flex-1 overflow-y-auto mb-4 p-2">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} message={msg.message} />
        ))}
        {isThinking && (
          <div className="flex mb-4 justify-start">
            <div className="bg-gray-200 p-3 rounded-lg animate-pulse">
              thinking...
            </div>
          </div>
        )}

        {error && <div className="text-red-500">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex">
        <input
          className="flex-1 p-2 mr-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={isThinking}
          className="p-2 bg-blue-500 text-gray-100 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
