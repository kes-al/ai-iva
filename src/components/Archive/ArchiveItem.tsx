'use client';

import { IVA } from '@/lib/types';

interface ArchiveItemProps {
  iva: IVA;
  isSelected: boolean;
  onClick: () => void;
  onActionSelect: (action: 'edit' | 'preview') => void;
  onToggleFavorite: () => void;
}

export function ArchiveItem({
  iva,
  isSelected,
  onClick,
  onActionSelect,
  onToggleFavorite,
}: ArchiveItemProps) {
  const { metadata } = iva;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div
      className={`archive-item ${isSelected ? 'border-bms-lightBlue bg-blue-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">
              {metadata.name || 'Untitled IVA'}
            </h3>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  metadata.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }
              `}
            >
              {metadata.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{metadata.brand}</span>
            <span className="text-gray-300">|</span>
            <span>{metadata.slideCount} slides</span>
            <span className="text-gray-300">|</span>
            <span>{formatDate(metadata.updatedAt)}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            p-1 rounded hover:bg-gray-100 transition-colors
            ${metadata.isFavorite ? 'text-yellow-500' : 'text-gray-300'}
          `}
          aria-label={metadata.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Action Selection */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3 animate-fade-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionSelect('edit');
            }}
            className="btn-primary text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionSelect('preview');
            }}
            className="btn-secondary text-sm"
          >
            Preview
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
