// src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";

type ChatMessage = { role: "user" | "bot"; message: string };

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

    // Update messages
    setMessages((prev) => [...prev, { role: "user", message: input }]);

    setIsThinking(true);
    setError(null);

    try {
      // Here you would normally call your API
      // Simulating a delay:
      await new Promise((r) => setTimeout(r, 1000));
      const botResponse = `You said: ${input}`;

      setMessages((prev) => [...prev, { role: "bot", message: botResponse }]);
    } catch (err) {
      setError("Oops! Failed to get a response.");
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
