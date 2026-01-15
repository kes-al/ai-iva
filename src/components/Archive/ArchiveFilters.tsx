'use client';

import { ArchiveFilter } from '@/lib/types';

interface ArchiveFiltersProps {
  currentFilter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
}

export function ArchiveFilters({ currentFilter, onFilterChange }: ArchiveFiltersProps) {
  const filters: { value: ArchiveFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'submitted', label: 'Submitted' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`filter-tab ${currentFilter === filter.value ? 'active' : ''}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
