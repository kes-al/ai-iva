'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface BulletListProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function BulletList({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: BulletListProps) {
  // Parse bullets from string (one per line)
  const bullets = slots.bullets?.split('\n').filter((b) => b.trim()) || [];

  return (
    <div className="slide-container bg-white flex flex-col p-6">
      {/* Headline */}
      <div className="mb-6">
        <SlotEditor
          slotId="headline"
          value={slots.headline}
          placeholder="Section headline..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-2xl font-bold text-bms-blue"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex gap-6">
        {/* Bullet List */}
        <div className="flex-1">
          {isEditable ? (
            <div className="h-full">
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">
                Bullet Points (one per line)
              </label>
              <textarea
                value={slots.bullets || ''}
                onChange={(e) => onContentUpdate?.('bullets', e.target.value)}
                placeholder="Enter bullet points, one per line..."
                className="w-full h-[calc(100%-24px)] px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bms-lightBlue"
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {bullets.length > 0 ? (
                bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-bms-blue mt-1.5 flex-shrink-0" />
                    <span className="text-gray-700">{bullet}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">No bullet points yet</li>
              )}
            </ul>
          )}
        </div>

        {/* Supporting Image */}
        <div className="w-1/3">
          {slots.image ? (
            <div className="h-full rounded-lg overflow-hidden bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slots.image}
                alt="Supporting"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
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
              <span className="text-xs">Optional image</span>
              {isEditable && (
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded w-full"
                  onChange={(e) => onContentUpdate?.('image', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ISI Strip */}
      {slots.isi && (
        <div className="isi-section border-t border-gray-200 mt-4 -mx-6 -mb-6 px-6 py-3">
          <p className="text-xs text-gray-500">{slots.isi}</p>
        </div>
      )}
    </div>
  );
}
