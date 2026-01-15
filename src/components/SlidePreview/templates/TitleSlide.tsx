'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface TitleSlideProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function TitleSlide({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: TitleSlideProps) {
  return (
    <div className="slide-container bg-gradient-to-br from-bms-blue to-bms-lightBlue flex flex-col items-center justify-center text-white p-8">
      {/* Headline */}
      <div className="w-full text-center mb-4">
        <SlotEditor
          slotId="headline"
          value={slots.headline}
          placeholder="Enter your main title..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-3xl font-bold text-white placeholder:text-white/50"
        />
      </div>

      {/* Subhead */}
      <div className="w-full text-center">
        <SlotEditor
          slotId="subhead"
          value={slots.subhead}
          placeholder="Enter a subtitle..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-xl text-white/80 placeholder:text-white/40"
        />
      </div>

      {/* Brand Logo Area */}
      <div className="absolute bottom-4 right-4 text-white/60 text-sm">
        BMS
      </div>
    </div>
  );
}
