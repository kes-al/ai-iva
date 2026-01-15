'use client';

import { SlideTemplate } from '@/lib/types';
import { SlotEditor } from './SlotEditor';

interface ThreeColumnProps {
  slots: Record<string, string | null>;
  template: SlideTemplate;
  onContentUpdate?: (slotId: string, value: string) => void;
  isEditable: boolean;
}

export function ThreeColumn({
  slots,
  template,
  onContentUpdate,
  isEditable,
}: ThreeColumnProps) {
  return (
    <div className="slide-container bg-white flex flex-col p-6">
      {/* Headline */}
      <div className="text-center mb-6">
        <SlotEditor
          slotId="headline"
          value={slots.headline}
          placeholder="Section headline..."
          isEditable={isEditable}
          onUpdate={onContentUpdate}
          className="text-2xl font-bold text-bms-blue"
        />
      </div>

      {/* Three Columns */}
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-bms-lightBlue/20 flex items-center justify-center mb-3">
            <span className="text-bms-blue font-bold">1</span>
          </div>
          <SlotEditor
            slotId="column1-title"
            value={slots['column1-title']}
            placeholder="Column 1 title..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="font-semibold text-gray-900 mb-2"
          />
          <SlotEditor
            slotId="column1-body"
            value={slots['column1-body']}
            placeholder="Column 1 content..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="text-sm text-gray-600"
            multiline
          />
        </div>

        {/* Column 2 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-bms-lightBlue/20 flex items-center justify-center mb-3">
            <span className="text-bms-blue font-bold">2</span>
          </div>
          <SlotEditor
            slotId="column2-title"
            value={slots['column2-title']}
            placeholder="Column 2 title..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="font-semibold text-gray-900 mb-2"
          />
          <SlotEditor
            slotId="column2-body"
            value={slots['column2-body']}
            placeholder="Column 2 content..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="text-sm text-gray-600"
            multiline
          />
        </div>

        {/* Column 3 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-bms-lightBlue/20 flex items-center justify-center mb-3">
            <span className="text-bms-blue font-bold">3</span>
          </div>
          <SlotEditor
            slotId="column3-title"
            value={slots['column3-title']}
            placeholder="Column 3 title..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="font-semibold text-gray-900 mb-2"
          />
          <SlotEditor
            slotId="column3-body"
            value={slots['column3-body']}
            placeholder="Column 3 content..."
            isEditable={isEditable}
            onUpdate={onContentUpdate}
            className="text-sm text-gray-600"
            multiline
          />
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
