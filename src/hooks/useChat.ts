'use client';

import { useState, useCallback } from 'react';
import { Message, ChatRequest, ChatResponse, ConversationPhase, IVA, AppState } from '@/lib/types';

interface UseChatOptions {
  currentState: AppState;
  currentIVA: Partial<IVA> | null;
  currentSlideIndex: number;
  conversationPhase: ConversationPhase;
}

export function useChat(options: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(
    async (content: string): Promise<ChatResponse | null> => {
      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const request: ChatRequest = {
          message: content,
          context: {
            currentState: options.currentState,
            currentIVA: options.currentIVA,
            currentSlideIndex: options.currentSlideIndex,
            conversationHistory: [...messages, userMessage],
            conversationPhase: options.conversationPhase,
          },
        };

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.statusText}`);
        }

        const data: ChatResponse = await response.json();

        // Add assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          uiAction: data.uiActions?.[0],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [messages, options]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: `msg-${Date.now()}-system`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
    setMessages,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
