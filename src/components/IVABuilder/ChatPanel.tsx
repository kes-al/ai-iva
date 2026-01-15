'use client';

import { useRef, useEffect } from 'react';
import { Message, ConversationPhase } from '@/lib/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LayoutSelector } from './LayoutSelector';
import { SLIDE_TEMPLATES } from '@/lib/templates';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationPhase: ConversationPhase;
  currentSlideIndex: number;
  onSendMessage: (message: string) => void;
  onLayoutSelect: (slideIndex: number, layoutId: string) => void;
  onBack: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  conversationPhase,
  currentSlideIndex,
  onSendMessage,
  onLayoutSelect,
  onBack,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showLayoutSelector = conversationPhase === 'layout_selection';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-sm text-gray-500">
          {conversationPhase !== 'initial' && (
            <span className="capitalize">{conversationPhase.replace('_', ' ')}</span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>Start a conversation to build your IVA</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Layout Selector */}
        {showLayoutSelector && (
          <div className="mt-4">
            <LayoutSelector
              templates={SLIDE_TEMPLATES}
              onSelect={(layoutId) => onLayoutSelect(currentSlideIndex, layoutId)}
            />
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
              <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
              <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200">
        <ChatInput
          onSubmit={onSendMessage}
          disabled={isLoading}
          placeholder="Message..."
        />
      </div>
    </div>
  );
}
