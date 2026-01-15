'use client';

import { useState } from 'react';
import { IVA, ArchiveFilter } from '@/lib/types';
import { ArchiveItem } from './ArchiveItem';
import { ArchiveFilters } from './ArchiveFilters';

interface ArchiveListProps {
  ivas: IVA[];
  onSelect: (iva: IVA, action: 'edit' | 'preview') => void;
  onToggleFavorite: (id: string) => boolean;
}

export function ArchiveList({ ivas, onSelect, onToggleFavorite }: ArchiveListProps) {
  const [filter, setFilter] = useState<ArchiveFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredIVAs = ivas.filter((iva) => {
    if (filter === 'all') return true;
    if (filter === 'drafts') return iva.metadata.status === 'draft';
    if (filter === 'submitted') return iva.metadata.status === 'submitted';
    return true;
  });

  const handleItemClick = (iva: IVA) => {
    if (selectedId === iva.metadata.id) {
      setSelectedId(null);
    } else {
      setSelectedId(iva.metadata.id);
    }
  };

  const handleActionSelect = (iva: IVA, action: 'edit' | 'preview') => {
    onSelect(iva, action);
    setSelectedId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your IVAs</h2>
        <ArchiveFilters currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredIVAs.length > 0 ? (
          filteredIVAs.map((iva) => (
            <ArchiveItem
              key={iva.metadata.id}
              iva={iva}
              isSelected={selectedId === iva.metadata.id}
              onClick={() => handleItemClick(iva)}
              onActionSelect={(action) => handleActionSelect(iva, action)}
              onToggleFavorite={() => onToggleFavorite(iva.metadata.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No IVAs found</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-bms-blue text-sm mt-2 hover:underline"
              >
                Show all IVAs
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
        {filteredIVAs.length} IVA{filteredIVAs.length !== 1 ? 's' : ''}{' '}
        {filter !== 'all' && `(${filter})`}
      </div>
    </div>
  );
}
