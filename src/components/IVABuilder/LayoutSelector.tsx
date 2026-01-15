'use client';

import { useState } from 'react';
import { SlideTemplate } from '@/lib/types';

interface LayoutSelectorProps {
  templates: SlideTemplate[];
  onSelect: (layoutId: string) => void;
  selectedId?: string;
}

export function LayoutSelector({ templates, onSelect, selectedId }: LayoutSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">Choose a layout:</p>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            onMouseEnter={() => setHoveredId(template.id)}
            onMouseLeave={() => setHoveredId(null)}
            data-testid={`layout-option-${template.id}`}
            className={`
              layout-card text-left
              ${selectedId === template.id ? 'selected' : ''}
            `}
          >
            {/* Template Preview */}
            <div className="aspect-video bg-gray-50 rounded mb-2 overflow-hidden">
              <TemplatePreview templateId={template.id} />
            </div>

            {/* Template Info */}
            <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
            <p
              className={`
                text-xs text-gray-500 mt-1 transition-all
                ${hoveredId === template.id ? 'opacity-100' : 'opacity-70'}
              `}
            >
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Simple template preview thumbnails
function TemplatePreview({ templateId }: { templateId: string }) {
  switch (templateId) {
    case 'title-slide':
      return (
        <div className="h-full flex flex-col items-center justify-center p-2">
          <div className="w-16 h-2 bg-gray-300 rounded mb-1" />
          <div className="w-12 h-1.5 bg-gray-200 rounded" />
        </div>
      );

    case 'content-image-split':
      return (
        <div className="h-full flex p-2 gap-1">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-1.5 bg-gray-300 rounded" />
            <div className="flex-1 bg-gray-200 rounded" />
          </div>
          <div className="w-1/2 bg-gray-300 rounded" />
        </div>
      );

    case 'full-image-overlay':
      return (
        <div className="h-full relative bg-gray-300 p-2">
          <div className="absolute bottom-2 left-2 w-1/2">
            <div className="w-full h-1.5 bg-white/80 rounded mb-1" />
            <div className="w-3/4 h-1 bg-white/60 rounded" />
          </div>
        </div>
      );

    case 'three-column':
      return (
        <div className="h-full flex flex-col p-2 gap-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded mx-auto" />
          <div className="flex-1 flex gap-1">
            <div className="flex-1 bg-gray-200 rounded" />
            <div className="flex-1 bg-gray-200 rounded" />
            <div className="flex-1 bg-gray-200 rounded" />
          </div>
        </div>
      );

    case 'data-chart-focus':
      return (
        <div className="h-full flex flex-col p-2 gap-1">
          <div className="w-10 h-1.5 bg-gray-300 rounded" />
          <div className="flex-1 bg-gray-200 rounded flex items-end p-1 gap-0.5">
            <div className="w-2 h-1/3 bg-gray-400 rounded-t" />
            <div className="w-2 h-1/2 bg-gray-400 rounded-t" />
            <div className="w-2 h-2/3 bg-gray-400 rounded-t" />
            <div className="w-2 h-1/4 bg-gray-400 rounded-t" />
          </div>
        </div>
      );

    case 'bullet-list':
      return (
        <div className="h-full flex p-2 gap-1">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="w-10 h-1.5 bg-gray-300 rounded" />
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="flex-1 h-1 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="flex-1 h-1 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              <div className="flex-1 h-1 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-1/3 bg-gray-300 rounded" />
        </div>
      );

    default:
      return <div className="h-full bg-gray-200 rounded" />;
  }
}
