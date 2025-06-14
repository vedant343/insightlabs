"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import PriceChart from "../components/PriceChart";
import {
  fetchCurrentPrice,
  fetchTrendingCoins,
  fetchBasicStats,
  fetch7DayChart,
} from "../lib/coinGecko";

type ChatMessage = { role: "user" | "bot"; message: string };

function speak(text: string) {
  const msg = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(msg);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", message: "Hi! Ask me about crypto prices or holdings..." },
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
        for (const coin of Object.keys(holdings)) {
          const price = await fetchCurrentPrice(coin);
          if (price) total += price * holdings[coin];
        }
        botResponse = `Your portfolio is worth ~$${total.toFixed(2)}`;
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
      } else if (/current price of ([a-zA-Z ]+)/i.test(input)) {
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
              .map(
                (c: { name: string; symbol: string }, i: number) =>
                  `${i + 1}. ${c.name} (${c.symbol})`
              )
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
        botResponse = `Try commands: "I have 2 ETH", "portfolio value", "7-day chart of BTC", "current price of bitcoin", "trending coins", "basic stats of ethereum"`;
      }

      setMessages((prev) => [...prev, { role: "bot", message: botResponse }]);
      speak(botResponse);
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

        {chartPrices && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <PriceChart prices={chartPrices} />
          </div>
        )}

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
