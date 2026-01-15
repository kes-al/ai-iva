'use client';

import { UseIVABuilderReturn } from '@/hooks/useIVABuilder';
import { UseChatReturn } from '@/hooks/useChat';
import { UseLocalStorageReturn } from '@/hooks/useLocalStorage';
import { ChatPanel } from './ChatPanel';
import { SidePanel } from './SidePanel';
import { IVAPlayer } from '../Preview/IVAPlayer';
import { IVA } from '@/lib/types';

interface ExpandedViewProps {
  builder: UseIVABuilderReturn;
  chat: UseChatReturn;
  storage: UseLocalStorageReturn;
  onChatMessage: (message: string) => void;
  onLayoutSelect: (slideIndex: number, layoutId: string) => void;
  onContentUpdate: (slideIndex: number, slotId: string, value: string) => void;
  onBack: () => void;
}

export function ExpandedView({
  builder,
  chat,
  storage,
  onChatMessage,
  onLayoutSelect,
  onContentUpdate,
  onBack,
}: ExpandedViewProps) {
  const { state } = builder;

  // Preview mode takes full screen
  if (state.appState === 'PREVIEW' && state.currentIVA?.slides) {
    return (
      <IVAPlayer
        iva={state.currentIVA as IVA}
        onClose={onBack}
        currentSlideIndex={state.currentSlideIndex}
        onSlideChange={builder.setCurrentSlideIndex}
      />
    );
  }

  // Calculate if current slide needs a template
  const slides = state.currentIVA?.slides || [];
  const currentSlide = slides[state.currentSlideIndex];
  const currentSlideNeedsTemplate = currentSlide ? !currentSlide.templateId : false;
  const totalSlides = slides.length;

  return (
    <div className="h-full flex">
      {/* Chat Panel - 60% */}
      <div className="w-[60%] h-full border-r border-gray-200">
        <ChatPanel
          messages={chat.messages}
          isLoading={chat.isLoading}
          error={chat.error}
          conversationPhase={state.conversationPhase}
          currentSlideIndex={state.currentSlideIndex}
          currentSlideNeedsTemplate={currentSlideNeedsTemplate}
          totalSlides={totalSlides}
          onSendMessage={onChatMessage}
          onLayoutSelect={onLayoutSelect}
          onBack={onBack}
        />
      </div>

      {/* Side Panel - 40% */}
      <div
        data-testid="side-panel"
        className="w-[40%] h-full animate-slide-in-right"
      >
        <SidePanel
          appState={state.appState}
          currentIVA={state.currentIVA}
          currentSlideIndex={state.currentSlideIndex}
          onSlideSelect={builder.setCurrentSlideIndex}
          onContentUpdate={onContentUpdate}
          ivas={storage.ivas}
          onIVASelect={(iva, action) => {
            if (action === 'edit') {
              builder.loadIVAForEdit(iva);
            } else {
              builder.loadIVAForPreview(iva);
            }
          }}
          onToggleFavorite={storage.toggleFavorite}
        />
      </div>
    </div>
  );
}
