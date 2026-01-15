'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface FullImageOverlayProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function FullImageOverlay({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: FullImageOverlayProps) {
  return (
    <div className="slide-container relative">
      {/* Background Image */}
      {slots.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slots.image}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Text Overlay Box */}
      <div className="absolute bottom-12 left-6 w-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <SlotEditor
          slotId="headline"
          value={slots.headline}
          placeholder="Headline text..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-xl font-bold text-bms-blue mb-2"
        />
        <SlotEditor
          slotId="body"
          value={slots.body}
          placeholder="Additional text..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-sm text-gray-700"
          multiline
        />
      </div>

      {/* Image URL Input (when editable and no image) */}
      {isEditable && !slots.image && (
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
          <label className="text-xs text-gray-500 block mb-1">
            Background Image URL
          </label>
          <input
            type="text"
            placeholder="Paste image URL..."
            className="px-2 py-1 text-sm border border-gray-300 rounded w-48"
            onChange={(e) => onContentUpdate?.('image', e.target.value)}
          />
        </div>
      )}

      {/* ISI Strip */}
      {slots.isi && (
        <div className="absolute bottom-0 left-0 right-0 isi-section bg-white/95">
          <p className="text-xs text-gray-500">{slots.isi}</p>
        </div>
      )}
    </div>
  );
}
