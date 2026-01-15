'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface DataChartFocusProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function DataChartFocus({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: DataChartFocusProps) {
  return (
    <div className="slide-container bg-white flex flex-col p-6">
      {/* Headline */}
      <div className="mb-4">
        <SlotEditor
          slotId="headline"
          value={slots.headline}
          placeholder="Chart/data title..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-xl font-bold text-bms-blue"
        />
      </div>

      {/* Chart Area */}
      <div className="flex-1 mb-3">
        {slots.chart ? (
          <div className="h-full w-full rounded-lg overflow-hidden bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slots.chart}
              alt="Chart"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="slot-placeholder h-full flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
            <span className="text-sm">Upload chart image or data</span>
            {isEditable && (
              <input
                type="text"
                placeholder="Paste chart image URL..."
                className="mt-2 px-2 py-1 text-xs border border-gray-300 rounded w-3/4"
                onChange={(e) => onContentUpdate?.('chart', e.target.value)}
              />
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="border-t border-gray-200 pt-2">
        <SlotEditor
          slotId="caption"
          value={slots.caption}
          placeholder="Source: ..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-xs text-gray-500 italic"
        />
      </div>

      {/* ISI Strip */}
      {slots.isi && (
        <div className="isi-section border-t border-gray-200 mt-3 -mx-6 -mb-6 px-6 py-3">
          <p className="text-xs text-gray-500">{slots.isi}</p>
        </div>
      )}
    </div>
  );
}
