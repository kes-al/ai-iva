'use client';

import { useEffect } from 'react';
import { useIVABuilder } from '@/hooks/useIVABuilder';
import { useChat } from '@/hooks/useChat';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LandingView } from './LandingView';
import { ExpandedView } from './ExpandedView';
import { IVA, Intent, ChatResponse } from '@/lib/types';
import { saveIVA } from '@/lib/storage';
import { createEmptySlideData } from '@/lib/templates';

export function IVABuilder() {
  const builder = useIVABuilder();
  const storage = useLocalStorage();

  const chat = useChat({
    currentState: builder.state.appState,
    currentIVA: builder.state.currentIVA,
    currentSlideIndex: builder.state.currentSlideIndex,
    conversationPhase: builder.state.conversationPhase,
  });

  // Handle intent from chat response
  const handleIntent = (response: ChatResponse) => {
    const { intent, nextPhase } = response;

    if (nextPhase) {
      builder.setConversationPhase(nextPhase);
    }

    switch (intent.type) {
      case 'create_iva':
        builder.startNewIVA();
        break;

      case 'set_brand':
        builder.updateIVAMetadata({ brand: intent.brand });
        break;

      case 'set_audience':
        builder.updateIVAMetadata({ targetAudience: intent.audience });
        break;

      case 'set_therapeutic_area':
        builder.updateIVAMetadata({ therapeuticArea: intent.area });
        break;

      case 'set_slide_count':
        builder.updateIVAMetadata({ slideCount: intent.count });
        // Initialize empty slides
        for (let i = 0; i < intent.count; i++) {
          builder.addSlide(createEmptySlideData('content-image-split'));
        }
        break;

      case 'set_iva_name':
        builder.updateIVAMetadata({ name: intent.name });
        break;

      case 'select_layout':
        const layoutSlide = createEmptySlideData(intent.layoutId);
        builder.setSlide(intent.slideIndex, layoutSlide);
        break;

      case 'set_content':
        if (builder.state.currentIVA?.slides?.[intent.slideIndex]) {
          const currentSlide = builder.state.currentIVA.slides[intent.slideIndex];
          const updatedSlide = {
            ...currentSlide,
            slots: {
              ...currentSlide.slots,
              [intent.field]: intent.value,
            },
          };
          builder.setSlide(intent.slideIndex, updatedSlide);
        }
        break;

      case 'select_slide':
        builder.setCurrentSlideIndex(intent.slideIndex);
        break;

      case 'next_slide':
        if (builder.state.currentIVA?.slides) {
          const nextIndex = Math.min(
            builder.state.currentSlideIndex + 1,
            builder.state.currentIVA.slides.length - 1
          );
          builder.setCurrentSlideIndex(nextIndex);
        }
        break;

      case 'prev_slide':
        const prevIndex = Math.max(builder.state.currentSlideIndex - 1, 0);
        builder.setCurrentSlideIndex(prevIndex);
        break;

      case 'show_archive':
        builder.goToArchive();
        break;

      case 'preview_iva':
        const previewIva = storage.getById(intent.ivaId);
        if (previewIva) {
          builder.loadIVAForPreview(previewIva);
        }
        break;

      case 'edit_iva':
        const editIva = storage.getById(intent.ivaId);
        if (editIva) {
          builder.loadIVAForEdit(editIva);
        }
        break;

      case 'save_iva':
        if (builder.state.currentIVA?.metadata && builder.state.currentIVA.slides) {
          saveIVA(builder.state.currentIVA as IVA);
          storage.refreshData();
        }
        break;

      case 'export_iva':
        // Export is handled separately
        break;

      case 'go_back':
        builder.goToLanding();
        break;
    }
  };

  // Handle initial prompt submission
  const handleInitialPrompt = async (prompt: string) => {
    // Start transition
    builder.setTransitioning(true);
    builder.setAppState('BUILD');

    // Wait for transition animation
    setTimeout(async () => {
      builder.setTransitioning(false);

      // Send the message
      const response = await chat.sendMessage(prompt);
      if (response) {
        handleIntent(response);
      }
    }, 400);
  };

  // Handle subsequent chat messages
  const handleChatMessage = async (message: string) => {
    const response = await chat.sendMessage(message);
    if (response) {
      handleIntent(response);
    }
  };

  // Handle IVA selection from recent/favorites
  const handleIVASelect = (iva: IVA, action: 'edit' | 'preview') => {
    builder.setTransitioning(true);

    setTimeout(() => {
      if (action === 'edit') {
        builder.loadIVAForEdit(iva);
        chat.addSystemMessage(
          `Loaded "${iva.metadata.name}" for editing. What would you like to change?`
        );
      } else {
        builder.loadIVAForPreview(iva);
      }
      builder.setTransitioning(false);
    }, 400);
  };

  // Handle layout selection
  const handleLayoutSelect = (slideIndex: number, layoutId: string) => {
    const layoutSlide = createEmptySlideData(layoutId);
    builder.setSlide(slideIndex, layoutSlide);
    builder.setConversationPhase('content_population');
  };

  // Handle content update in slide
  const handleContentUpdate = (slideIndex: number, slotId: string, value: string) => {
    if (builder.state.currentIVA?.slides?.[slideIndex]) {
      const currentSlide = builder.state.currentIVA.slides[slideIndex];
      const updatedSlide = {
        ...currentSlide,
        slots: {
          ...currentSlide.slots,
          [slotId]: value,
        },
      };
      builder.setSlide(slideIndex, updatedSlide);
    }
  };

  const isExpanded = builder.state.appState !== 'LANDING';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div
        data-testid="main-container"
        className={`
          bg-white rounded-2xl shadow-xl overflow-hidden
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-[80vw] h-[80vh]' : 'w-[60vw] h-[60vh]'}
          ${builder.state.isTransitioning ? 'transition-expand' : ''}
        `}
      >
        {!isExpanded ? (
          <LandingView
            recentIVAs={storage.recentIVAs}
            favoriteIVAs={storage.favoriteIVAs}
            onPromptSubmit={handleInitialPrompt}
            onIVASelect={handleIVASelect}
            isTransitioning={builder.state.isTransitioning}
          />
        ) : (
          <ExpandedView
            builder={builder}
            chat={chat}
            storage={storage}
            onChatMessage={handleChatMessage}
            onLayoutSelect={handleLayoutSelect}
            onContentUpdate={handleContentUpdate}
            onBack={builder.goToLanding}
          />
        )}
      </div>
    </div>
  );
}
