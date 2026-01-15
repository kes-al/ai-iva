'use client';

import { AppState, IVA, SlideData } from '@/lib/types';
import { SlidePreview } from '../SlidePreview/SlidePreview';
import { SlideThumbStrip } from '../SlidePreview/SlideThumbStrip';
import { ArchiveList } from '../Archive/ArchiveList';

interface SidePanelProps {
  appState: AppState;
  currentIVA: Partial<IVA> | null;
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onContentUpdate: (slideIndex: number, slotId: string, value: string) => void;
  ivas: IVA[];
  onIVASelect: (iva: IVA, action: 'edit' | 'preview') => void;
  onToggleFavorite: (id: string) => boolean;
}

export function SidePanel({
  appState,
  currentIVA,
  currentSlideIndex,
  onSlideSelect,
  onContentUpdate,
  ivas,
  onIVASelect,
  onToggleFavorite,
}: SidePanelProps) {
  // Archive mode
  if (appState === 'ARCHIVE') {
    return (
      <div className="h-full p-4 bg-gray-50">
        <ArchiveList
          ivas={ivas}
          onSelect={onIVASelect}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    );
  }

  // Build/Edit mode - show slide preview
  const slides = currentIVA?.slides || [];
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="h-full flex flex-col p-4 bg-gray-50">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">
          {slides.length > 0
            ? `Slide ${currentSlideIndex + 1} of ${slides.length}`
            : 'Slide Preview'}
        </h3>
        {currentIVA?.metadata?.name && (
          <span className="text-sm text-gray-500">{currentIVA.metadata.name}</span>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 mb-4">
        {currentSlide ? (
          <SlidePreview
            slide={currentSlide}
            onContentUpdate={(slotId, value) =>
              onContentUpdate(currentSlideIndex, slotId, value)
            }
            isEditable={appState === 'BUILD' || appState === 'EDIT'}
          />
        ) : (
          <EmptyPreview />
        )}
      </div>

      {/* Thumbnail Strip */}
      {slides.length > 0 && (
        <SlideThumbStrip
          slides={slides}
          currentIndex={currentSlideIndex}
          onSelect={onSlideSelect}
        />
      )}
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <p className="text-sm">Your slide will appear here</p>
        <p className="text-xs mt-1">Select a layout to get started</p>
      </div>
    </div>
  );
}
