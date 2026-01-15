'use client';

import { useState } from 'react';
import { IVA } from '@/lib/types';
import { ChatInput } from './ChatInput';

interface LandingViewProps {
  recentIVAs: IVA[];
  favoriteIVAs: IVA[];
  onPromptSubmit: (prompt: string) => void;
  onIVASelect: (iva: IVA, action: 'edit' | 'preview') => void;
  isTransitioning: boolean;
}

export function LandingView({
  recentIVAs,
  favoriteIVAs,
  onPromptSubmit,
  onIVASelect,
  isTransitioning,
}: LandingViewProps) {
  const [selectedIVA, setSelectedIVA] = useState<IVA | null>(null);

  const handleIVAClick = (iva: IVA) => {
    if (selectedIVA?.metadata.id === iva.metadata.id) {
      setSelectedIVA(null);
    } else {
      setSelectedIVA(iva);
    }
  };

  const handleActionSelect = (action: 'edit' | 'preview') => {
    if (selectedIVA) {
      onIVASelect(selectedIVA, action);
      setSelectedIVA(null);
    }
  };

  return (
    <div
      className={`h-full flex flex-col p-8 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What would you like to create?
        </h1>
        <p className="text-gray-500">
          Build and manage your IVAs with natural conversation
        </p>
      </div>

      {/* Chat Input */}
      <div className="mb-8">
        <ChatInput
          onSubmit={onPromptSubmit}
          placeholder="Message IVA Builder..."
          autoFocus
        />
      </div>

      {/* Recent and Favorites */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Recent IVAs */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Recent
          </h2>
          {recentIVAs.length > 0 ? (
            <div className="space-y-2">
              {recentIVAs.slice(0, 5).map((iva) => (
                <IVAListItem
                  key={iva.metadata.id}
                  iva={iva}
                  isSelected={selectedIVA?.metadata.id === iva.metadata.id}
                  onClick={() => handleIVAClick(iva)}
                  onActionSelect={handleActionSelect}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">
              No recent IVAs. Start by creating one above.
            </p>
          )}
        </div>

        {/* Favorites */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1">
            <span className="text-yellow-500">&#9733;</span>
            Favorites
          </h2>
          {favoriteIVAs.length > 0 ? (
            <div className="space-y-2">
              {favoriteIVAs.map((iva) => (
                <IVAListItem
                  key={iva.metadata.id}
                  iva={iva}
                  isSelected={selectedIVA?.metadata.id === iva.metadata.id}
                  onClick={() => handleIVAClick(iva)}
                  onActionSelect={handleActionSelect}
                  showStar
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">
              Star an IVA to add it to favorites.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface IVAListItemProps {
  iva: IVA;
  isSelected: boolean;
  onClick: () => void;
  onActionSelect: (action: 'edit' | 'preview') => void;
  showStar?: boolean;
}

function IVAListItem({
  iva,
  isSelected,
  onClick,
  onActionSelect,
  showStar,
}: IVAListItemProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          w-full text-left px-4 py-3 rounded-lg transition-all
          ${
            isSelected
              ? 'bg-blue-50 border border-bms-lightBlue'
              : 'hover:bg-gray-50 border border-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showStar && <span className="text-yellow-500">&#9733;</span>}
            <span className="font-medium text-gray-900">{iva.metadata.name || 'Untitled IVA'}</span>
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full
              ${
                iva.metadata.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }
            `}
            >
              {iva.metadata.status}
            </span>
          </div>
          <span className="text-sm text-gray-400">{iva.metadata.brand}</span>
        </div>
      </button>

      {/* Action Selection */}
      {isSelected && (
        <div className="mt-2 ml-4 flex items-center gap-2 animate-fade-in">
          <span className="text-sm text-gray-500">Would you like to</span>
          <button
            onClick={() => onActionSelect('edit')}
            className="text-sm font-medium text-bms-blue hover:underline"
          >
            Edit
          </button>
          <span className="text-gray-400">or</span>
          <button
            onClick={() => onActionSelect('preview')}
            className="text-sm font-medium text-bms-blue hover:underline"
          >
            Preview
          </button>
          <span className="text-sm text-gray-500">this IVA?</span>
        </div>
      )}
    </div>
  );
}
