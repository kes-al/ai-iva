'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface ContentImageSplitProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function ContentImageSplit({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: ContentImageSplitProps) {
  return (
    <div className="slide-container bg-white flex flex-col">
      <div className="flex-1 flex">
        {/* Left Content */}
        <div className="w-1/2 p-6 flex flex-col">
          {/* Headline */}
          <div className="mb-4">
            <SlotEditor
              slotId="headline"
              value={slots.headline}
              placeholder="Section headline..."
              isEditable={isEditable}
              onUpdate={onContentUpdate}
              className="text-xl font-bold text-bms-blue"
            />
          </div>

          {/* Body */}
          <div className="flex-1">
            <SlotEditor
              slotId="body"
              value={slots.body}
              placeholder="Enter your main content here..."
              isEditable={isEditable}
              onUpdate={onContentUpdate}
              className="text-sm text-gray-700 leading-relaxed"
              multiline
            />
          </div>
        </div>

        {/* Right Image */}
        <div className="w-1/2 p-4">
          <ImageSlot
            value={slots.image}
            placeholder="Upload or paste image URL..."
            isEditable={isEditable}
            onUpdate={(value) => onContentUpdate?.('image', value)}
          />
        </div>
      </div>

      {/* ISI Strip */}
      {slots.isi && (
        <div className="isi-section border-t border-gray-200">
          <p className="text-xs text-gray-500">{slots.isi}</p>
        </div>
      )}
    </div>
  );
}

interface ImageSlotProps {
  value: string | null;
  placeholder: string;
  isEditable: boolean;
  onUpdate?: (value: string) => void;
}

function ImageSlot({ value, placeholder, isEditable, onUpdate }: ImageSlotProps) {
  if (value) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Slide content"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (isEditable) {
    return (
      <div className="slot-placeholder h-full flex flex-col items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
        <span className="text-sm">{placeholder}</span>
        <input
          type="text"
          placeholder="Paste image URL..."
          className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded w-3/4"
          onChange={(e) => onUpdate?.(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="slot-placeholder h-full">
      <span className="text-sm">{placeholder}</span>
    </div>
  );
}
