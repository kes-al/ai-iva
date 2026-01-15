import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStoredData,
  getAllIVAs,
  getIVA,
  saveIVA,
  deleteIVA,
  toggleFavorite,
  getRecentIVAs,
  getFavoriteIVAs,
  generateId,
  clearAllData,
} from '@/lib/storage';
import { IVA } from '@/lib/types';

const createMockIVA = (id: string, name: string = 'Test IVA'): IVA => ({
  metadata: {
    id,
    name,
    brand: 'Opdivo',
    therapeuticArea: 'Oncology',
    targetAudience: 'Oncologists',
    slideCount: 3,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
  },
  slides: [
    { templateId: 'title-slide', slots: { headline: 'Test', subhead: 'Subhead' } },
  ],
});

describe('Storage', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
    vi.mocked(localStorage.removeItem).mockClear();
  });

  describe('getStoredData', () => {
    it('returns default data when localStorage is empty', () => {
      const data = getStoredData();
      expect(data.ivas).toEqual([]);
      expect(data.settings.recentIds).toEqual([]);
      expect(data.settings.favoriteIds).toEqual([]);
    });

    it('parses stored data correctly', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1')],
        settings: { recentIds: ['1'], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const data = getStoredData();
      expect(data.ivas.length).toBe(1);
      expect(data.ivas[0].metadata.id).toBe('1');
    });

    it('handles corrupted data gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json');

      const data = getStoredData();
      expect(data.ivas).toEqual([]);
    });
  });

  describe('getAllIVAs', () => {
    it('returns all IVAs from storage', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1'), createMockIVA('2')],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const ivas = getAllIVAs();
      expect(ivas.length).toBe(2);
    });
  });

  describe('getIVA', () => {
    it('returns IVA by ID', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1', 'First'), createMockIVA('2', 'Second')],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const iva = getIVA('2');
      expect(iva?.metadata.name).toBe('Second');
    });

    it('returns null for non-existent ID', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1')],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const iva = getIVA('nonexistent');
      expect(iva).toBeNull();
    });
  });

  describe('saveIVA', () => {
    it('adds new IVA to storage', () => {
      const mockData = {
        userId: 'local',
        ivas: [],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const newIVA = createMockIVA('new-id');
      saveIVA(newIVA);

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(localStorage.setItem).mock.calls[0][1]
      );
      expect(savedData.ivas.length).toBe(1);
      expect(savedData.ivas[0].metadata.id).toBe('new-id');
    });

    it('updates existing IVA', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1', 'Original')],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const updatedIVA = createMockIVA('1', 'Updated');
      saveIVA(updatedIVA);

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(localStorage.setItem).mock.calls[0][1]
      );
      expect(savedData.ivas.length).toBe(1);
      expect(savedData.ivas[0].metadata.name).toBe('Updated');
    });
  });

  describe('deleteIVA', () => {
    it('removes IVA from storage', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1'), createMockIVA('2')],
        settings: { recentIds: ['1', '2'], favoriteIds: ['1'] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      deleteIVA('1');

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        vi.mocked(localStorage.setItem).mock.calls[0][1]
      );
      expect(savedData.ivas.length).toBe(1);
      expect(savedData.settings.recentIds).not.toContain('1');
      expect(savedData.settings.favoriteIds).not.toContain('1');
    });
  });

  describe('toggleFavorite', () => {
    it('adds IVA to favorites', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1')],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const result = toggleFavorite('1');

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('removes IVA from favorites', () => {
      const iva = createMockIVA('1');
      iva.metadata.isFavorite = true;
      const mockData = {
        userId: 'local',
        ivas: [iva],
        settings: { recentIds: [], favoriteIds: ['1'] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const result = toggleFavorite('1');

      expect(result).toBe(false);
    });

    it('returns false for non-existent IVA', () => {
      const mockData = {
        userId: 'local',
        ivas: [],
        settings: { recentIds: [], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const result = toggleFavorite('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^iva-\d+-[a-z0-9]+$/);
    });
  });

  describe('getRecentIVAs', () => {
    it('returns IVAs in order of recency', () => {
      const mockData = {
        userId: 'local',
        ivas: [createMockIVA('1', 'First'), createMockIVA('2', 'Second')],
        settings: { recentIds: ['2', '1'], favoriteIds: [] },
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockData));

      const recent = getRecentIVAs();

      expect(recent[0].metadata.name).toBe('Second');
      expect(recent[1].metadata.name).toBe('First');
    });
  });

  describe('clearAllData', () => {
    it('removes data from localStorage', () => {
      clearAllData();
      expect(localStorage.removeItem).toHaveBeenCalledWith('iva-builder-data');
    });
  });
});
