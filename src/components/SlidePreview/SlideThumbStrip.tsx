'use client';

import { SlideData } from '@/lib/types';
import { getTemplateById } from '@/lib/templates';

interface SlideThumbStripProps {
  slides: SlideData[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function SlideThumbStrip({
  slides,
  currentIndex,
  onSelect,
}: SlideThumbStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {slides.map((slide, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`
            thumbnail flex-shrink-0 w-20 h-12 rounded overflow-hidden
            ${index === currentIndex ? 'active' : ''}
          `}
        >
          <ThumbnailPreview slide={slide} index={index} />
        </button>
      ))}
    </div>
  );
}

interface ThumbnailPreviewProps {
  slide: SlideData;
  index: number;
}

function ThumbnailPreview({ slide, index }: ThumbnailPreviewProps) {
  const template = getTemplateById(slide.templateId);
  const hasContent = Object.values(slide.slots).some((v) => v !== null);

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-1">
      <span className="text-xs font-medium text-gray-700">{index + 1}</span>
      <span className="text-[8px] text-gray-400 truncate w-full text-center">
        {template?.name || 'Slide'}
      </span>
      {hasContent && (
        <div className="w-2 h-2 rounded-full bg-green-400 mt-0.5" />
      )}
    </div>
  );
}
