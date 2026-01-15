'use client';

import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`animate-message-in flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl
          ${
            isUser
              ? 'bg-bms-blue text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span
          className={`
            text-xs mt-1 block
            ${isUser ? 'text-blue-200' : 'text-gray-400'}
          `}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
