"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import PriceChart from "../components/PriceChart";
import {
  fetchTrendingCoins,
  getPrice,
  getMarketCap,
  get24hChange,
  getSparkline,
  get24hVolume,
  listTrending,
  fetchCurrentPrice,
  getCoinDescription,
  getCoinStats,
  fetch7DayChart,
} from "../lib/coinGecko";

type ChatMessage = { role: "user" | "bot"; message: string; timestamp: string };

function speak(text: string) {
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      message: "Hi! Ask me about crypto prices or holdings...",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartPrices, setChartPrices] = useState<[number, number][] | null>(
    null
  );
  const [holdings, setHoldings] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("holdings") || "{}");
    }
    return {};
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const symbolToId: Record<string, string> = {
    btc: "bitcoin",
    eth: "ethereum",
    usdt: "tether",
    sol: "solana",
    bnb: "binancecoin",
    xrp: "ripple",
    ada: "cardano",
    doge: "dogecoin",
    ton: "the-open-network",
    avax: "avalanche-2",
  };

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        message: input,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setIsThinking(true);
    setError(null);

    let botResponse = "";

    try {
      if (/i have (\d+(?:\.\d+)?) ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/i have (\d+(?:\.\d+)?) ([a-zA-Z]+)/i);
        const qty = parseFloat(match![1]);
        const coin = match![2].toLowerCase();

        const newHoldings = {
          ...holdings,
          [coin]: (holdings[coin] || 0) + qty,
        };

        setHoldings(newHoldings);
        localStorage.setItem("holdings", JSON.stringify(newHoldings));

        botResponse = `Got it. You now have ${
          newHoldings[coin]
        } ${coin.toUpperCase()}.`;
      } else if (/portfolio value/i.test(input)) {
        let total = 0;
        for (const [coin, amount] of Object.entries(holdings)) {
          const id = symbolToId[coin.toLowerCase()];
          if (!id) continue;
          const price = await fetchCurrentPrice(id);
          if (price) {
            total += price * amount;
          }
        }
        botResponse = `Your portfolio is worth $${total.toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
      } else if (/7[- ]day chart of ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/7[- ]day chart of ([a-zA-Z]+)/i);
        const coinId = match![1].toLowerCase();
        const prices = await fetch7DayChart(coinId);
        if (prices) {
          setChartPrices(prices);
          botResponse = `Here is the 7-day chart of ${coinId.toUpperCase()}.`;
        } else {
          botResponse = `Sorry, couldn't load the chart for ${coinId}`;
        }
      } else if (/price of ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/price of ([a-zA-Z]+)/i);
        const symbol = match![1];
        const trendingData = await fetchTrendingCoins();
        let price = getPrice(trendingData, symbol);
        if (!price) {
          // Try fallback using symbolToId and fetchCurrentPrice
          const id = symbolToId[symbol.toLowerCase()];
          if (id) {
            price = await fetchCurrentPrice(id);
          }
        }
        botResponse = price
          ? `${symbol.toUpperCase()} is trading at $${price.toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`
          : `Sorry, couldn't find price for ${symbol.toUpperCase()}`;
      } else if (/market cap of ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/market cap of ([a-zA-Z]+)/i);
        const symbol = match![1];
        const trendingData = await fetchTrendingCoins();
        const cap = getMarketCap(trendingData, symbol);
        botResponse = cap
          ? `${symbol.toUpperCase()} market cap is ${cap.toLocaleString()}`
          : `Sorry, couldn't find market cap for ${symbol.toUpperCase()}`;
      } else if (/24h change of ([a-zA-Z]+) in ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/24h change of ([a-zA-Z]+) in ([a-zA-Z]+)/i);
        const symbol = match![1];
        const currency = match![2];
        const change = get24hChange();
        botResponse =
          change !== null
            ? `${symbol.toUpperCase()} changed ${change.toFixed(
                2
              )}% in ${currency.toUpperCase()} last 24h`
            : `Sorry, couldn't find 24h change data for ${symbol.toUpperCase()}`;
      } else if (/sparkline of ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/sparkline of ([a-zA-Z]+)/i);
        const symbol = match![1];
        const trendingData = await fetchTrendingCoins();
        const url = getSparkline(trendingData, symbol);
        botResponse = url
          ? `Here is the sparkline for ${symbol.toUpperCase()}: ${url}`
          : `Sorry, couldn't find sparkline for ${symbol.toUpperCase()}`;
      } else if (/24h volume of ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/24h volume of ([a-zA-Z]+)/i);
        const symbol = match![1];
        const trendingData = await fetchTrendingCoins();
        const vol = get24hVolume(trendingData, symbol);
        botResponse = vol
          ? `${symbol.toUpperCase()} 24h volume is ${vol.toLocaleString()}`
          : `Sorry, couldn't find 24h volume for ${symbol.toUpperCase()}`;
      } else if (/list trending/i.test(input)) {
        const trendingData = await fetchTrendingCoins();
        const trending = listTrending(trendingData);
        botResponse =
          trending.length > 0
            ? trending
                .map(
                  (t: { name: string; symbol: string; rank: number }) =>
                    `${t.name} (${t.symbol}) rank ${t.rank}`
                )
                .join("\n")
            : "Sorry, couldn't fetch trending coins";
      } else if (/get coin description/i.test(input)) {
        const match = input.match(/get coin description/i);
        const coinId = match![1];
        const description = await getCoinDescription(coinId);
        botResponse = description
          ? `Here is the description for ${coinId.toUpperCase()}: ${description}`
          : `Sorry, couldn't find description for ${coinId}`;
      } else if (/get coin stats ([a-zA-Z]+)/i.test(input)) {
        const match = input.match(/get coin stats ([a-zA-Z]+)/i);
        const coinId = match![1];
        const stats = await getCoinStats(coinId);
        botResponse = `Here are the stats for ${coinId.toUpperCase()}:
        - Market Cap: $${stats.marketCap.toLocaleString()}
        - Market Cap Rank: ${stats.marketCapRank}
        - Total Volume: $${stats.totalVolume.toLocaleString()}
        - Sparkline: ${stats.sparkline}
        - Score: ${stats.score}
        - Coin ID: ${stats.coinId}`;
      } else {
        botResponse = `Try commands: "I have 2 ETH", "portfolio value", "price of BTC", "market cap of ethereum", "sparkline of AURA", "list trending", "get coin stats ethereum"`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message: botResponse,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      speak(botResponse);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setError("Oops! Failed to fetch data. Please try again.");
    } finally {
      setIsThinking(false);
      setInput("");
    }
  }

  return (
    <div className="flex flex-col max-w-md m-auto h-screen bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
      <div className="bg-[#075E54] text-white p-3 rounded-t-lg flex items-center">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
          <span className="text-[#075E54] font-bold">CB</span>
        </div>
        <div>
          <h1 className="font-semibold text-lg">Crypto Bot</h1>
          <p className="text-xs text-gray-200">Online</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            role={msg.role}
            message={msg.message}
            timestamp={msg.timestamp}
          />
        ))}
        {isThinking && (
          <div className="flex mb-2 justify-start">
            <div className="bg-gray-200 p-2 text-gray-900 rounded-lg animate-pulse">
              thinking...
            </div>
          </div>
        )}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {chartPrices && (
          <div className="mt-2 p-2 bg-white rounded-lg shadow border border-gray-200">
            <PriceChart prices={chartPrices} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex gap-2 p-2 border-t border-gray-200 bg-white rounded-b-lg"
      >
        <input
          className="flex-1 p-2 text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={isThinking}
          className="p-2 bg-[#075E54] text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
