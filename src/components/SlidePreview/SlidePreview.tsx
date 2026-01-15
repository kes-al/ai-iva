'use client';

import { SlideData } from '@/lib/types';
import { getTemplateById } from '@/lib/templates';
import { TitleSlide } from './templates/TitleSlide';
import { ContentImageSplit } from './templates/ContentImageSplit';
import { FullImageOverlay } from './templates/FullImageOverlay';
import { ThreeColumn } from './templates/ThreeColumn';
import { DataChartFocus } from './templates/DataChartFocus';
import { BulletList } from './templates/BulletList';

interface SlidePreviewProps {
  slide: SlideData;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable?: boolean;
}

export function SlidePreview({
  slide,
  onContentUpdate,
  isEditable = false,
}: SlidePreviewProps) {
  // Handle slides without a template yet
  if (!slide.templateId) {
    return (
      <div className="slide-container flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5ZM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6ZM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6Z"
          />
        </svg>
        <p className="text-gray-500 font-medium">Choose a layout</p>
        <p className="text-gray-400 text-sm mt-1">Select a template from the chat panel</p>
      </div>
    );
  }

  const template = getTemplateById(slide.templateId);

  if (!template) {
    return (
      <div className="slide-container flex items-center justify-center text-gray-400">
        Unknown template: {slide.templateId}
      </div>
    );
  }

  const props = {
    slots: slide.slots,
    template,
    onContentUpdate,
    isEditable,
  };

  // Render the appropriate template component
  switch (slide.templateId) {
    case 'title-slide':
      return <TitleSlide {...props} />;
    case 'content-image-split':
      return <ContentImageSplit {...props} />;
    case 'full-image-overlay':
      return <FullImageOverlay {...props} />;
    case 'three-column':
      return <ThreeColumn {...props} />;
    case 'data-chart-focus':
      return <DataChartFocus {...props} />;
    case 'bullet-list':
      return <BulletList {...props} />;
    default:
      return <DefaultSlide {...props} />;
  }
}

// Default fallback template
interface DefaultSlideProps {
  slots: Record<string, string | null>;
  isEditable: boolean;
  onContentUpdate?: (slotId: string, value: string) => void;
}

function DefaultSlide({ slots, isEditable, onContentUpdate }: DefaultSlideProps) {
  return (
    <div className="slide-container p-6">
      {Object.entries(slots).map(([slotId, value]) => (
        <div key={slotId} className="mb-4">
          <label className="text-xs text-gray-400 uppercase tracking-wide">
            {slotId}
          </label>
          {isEditable && onContentUpdate ? (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onContentUpdate(slotId, e.target.value)}
              className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder={`Enter ${slotId}...`}
            />
          ) : (
            <p className="text-gray-900">{value || '—'}</p>
          )}
        </div>
      ))}
    </div>
  );
}
