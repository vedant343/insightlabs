// src/app/components/ChatBubble.tsx
import React from "react";

type ChatBubbleProps = {
  role: "user" | "bot";
  message: string;
};

export default function ChatBubble({ role, message }: ChatBubbleProps) {
  return (
    <div
      className={`flex mb-4 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg ${
          role === "user"
            ? "bg-blue-500 text-gray-100"
            : "bg-gray-200 text-gray-900"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
