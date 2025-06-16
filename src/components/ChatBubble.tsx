import React from "react";
import { Check, } from "lucide-react";

type ChatBubbleProps = {
  role: "user" | "bot";
  message: string;
  timestamp: string;
};

export default function ChatBubble({ role, message, timestamp }: ChatBubbleProps) {
  return (
    <div
      className={`flex mb-4 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex flex-col max-w-xs">
        {/* Bubble */}
        <div
          className={`p-3 rounded-2xl shadow-md relative ${
            role === "user"
              ? "bg-[#dcf8c6] text-gray-900 rounded-br-none"
              : "bg-[#ffffff] text-gray-900 rounded-bl-none"
          }`}
        >
          {message}

          {/* Delivery Indicator (for User messages) */}
          {role === "user" && (
            <span className="absolute bottom-1 right-2 text-gray-500 flex items-center space-x-1">
              {/* double check for delivery/read */}
              {/* <CheckAll size={14} color="#34B7F1" /> */}
            </span>
          )}

        </div>
        <span
          className={`text-xs mt-1 ${
            role === "user" ? "text-right" : "text-left"
          } text-gray-900 flex items-center space-x-1`}
        >
          {/* single check for delivery for bot messages, for style */}
          {role === "bot" && <Check size={14} color="#34B7F1" />}
          {timestamp}
        </span>
      </div>
    </div>
  );
}
