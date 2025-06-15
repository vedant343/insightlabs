// src/app/components/ChatBubble.tsx
import React from "react";

type ChatBubbleProps = {
  role: "user" | "bot";
  message: string;
  timestamp: string;
};

export default function ChatBubble({
  role,
  message,
  timestamp,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex mb-4 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex flex-col">
        <div
          className={`max-w-xs p-3 rounded-lg ${
            role === "user"
              ? "bg-blue-500 text-gray-100 rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          {message}
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 ${
            role === "user" ? "text-right" : "text-left"
          }`}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}


