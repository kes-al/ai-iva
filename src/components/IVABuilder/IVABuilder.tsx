'use client';

import { useEffect, useRef } from 'react';
import { useIVABuilder } from '@/hooks/useIVABuilder';
import { useChat } from '@/hooks/useChat';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LandingView } from './LandingView';
import { ExpandedView } from './ExpandedView';
import { IVA, Intent, ChatResponse } from '@/lib/types';
import { saveIVA } from '@/lib/storage';
import { createEmptySlideData } from '@/lib/templates';
import { exportIVA, downloadBlob } from '@/lib/export';

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
        // Initialize placeholder slides (no template yet - user will choose per slide)
        for (let i = 0; i < intent.count; i++) {
          builder.addSlide({ templateId: '', slots: {} });
        }
        // Start at first slide for layout selection
        builder.setCurrentSlideIndex(0);
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
        if (intent.ivaId) {
          const previewIva = storage.getById(intent.ivaId);
          if (previewIva) {
            builder.loadIVAForPreview(previewIva);
          }
        } else if (builder.state.currentIVA?.slides?.length) {
          // Preview the current IVA being built
          builder.loadIVAForPreview(builder.state.currentIVA as IVA);
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
        handleExport();
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

    // Check if there are more slides that need templates
    const slides = builder.state.currentIVA?.slides || [];
    const nextSlideWithoutTemplate = slides.findIndex(
      (slide, idx) => idx > slideIndex && !slide.templateId
    );

    if (nextSlideWithoutTemplate !== -1) {
      // Move to next slide that needs a template
      builder.setCurrentSlideIndex(nextSlideWithoutTemplate);
      // Add a message to guide the user
      chat.addSystemMessage(
        `Great! Now let's choose a layout for Slide ${nextSlideWithoutTemplate + 1}.`
      );
    } else {
      // All slides have templates, move to content population
      builder.setCurrentSlideIndex(0);
      builder.setConversationPhase('content_population');
      chat.addSystemMessage(
        `All slides have layouts. Now let's add content. Starting with Slide 1.`
      );
    }
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

  // Handle export
  const handleExport = async () => {
    if (builder.state.currentIVA?.metadata && builder.state.currentIVA.slides) {
      try {
        // Save first
        const ivaToExport = builder.state.currentIVA as IVA;
        saveIVA({
          ...ivaToExport,
          metadata: { ...ivaToExport.metadata, status: 'submitted' },
        });
        storage.refreshData();

        // Generate and download zip
        const blob = await exportIVA(ivaToExport);
        const filename = `${ivaToExport.metadata.name || 'iva'}-${Date.now()}.zip`;
        downloadBlob(blob, filename);

        chat.addSystemMessage(
          `Your IVA "${ivaToExport.metadata.name}" has been exported and downloaded. It's also been saved to your recent IVAs.`
        );
      } catch (error) {
        console.error('Export failed:', error);
        chat.addSystemMessage('Sorry, there was an error exporting your IVA. Please try again.');
      }
    }
  };

  // Auto-save during build - save whenever currentIVA changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    // Skip first render and only save if we have a valid IVA with an ID
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      builder.state.currentIVA?.metadata?.id &&
      builder.state.appState !== 'LANDING' &&
      builder.state.appState !== 'PREVIEW'
    ) {
      // Auto-save as draft
      saveIVA(builder.state.currentIVA as IVA);
      storage.refreshData();
    }
  }, [builder.state.currentIVA, builder.state.appState]);

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
