import { IVA, StoredData, UserSettings } from './types';

const STORAGE_KEY = 'iva-builder-data';

// Placeholder user ID for future database migration
// When migrating to Supabase, replace this with actual auth user ID
const LOCAL_USER_ID = 'local';

const DEFAULT_DATA: StoredData = {
  userId: LOCAL_USER_ID,
  ivas: [],
  settings: {
    recentIds: [],
    favoriteIds: [],
  },
};

// Get all stored data
export function getStoredData(): StoredData {
  if (typeof window === 'undefined') return DEFAULT_DATA;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;

    const data = JSON.parse(raw) as StoredData;
    return {
      userId: data.userId || LOCAL_USER_ID,
      ivas: data.ivas || [],
      settings: {
        recentIds: data.settings?.recentIds || [],
        favoriteIds: data.settings?.favoriteIds || [],
      },
    };
  } catch {
    console.error('Failed to parse stored data');
    return DEFAULT_DATA;
  }
}

// Save all data
function saveStoredData(data: StoredData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// Get all IVAs
export function getAllIVAs(): IVA[] {
  return getStoredData().ivas;
}

// Get single IVA by ID
export function getIVA(id: string): IVA | null {
  const data = getStoredData();
  return data.ivas.find((iva) => iva.metadata.id === id) || null;
}

// Save or update IVA
export function saveIVA(iva: IVA): void {
  const data = getStoredData();
  const existingIndex = data.ivas.findIndex((i) => i.metadata.id === iva.metadata.id);

  const updatedIva = {
    ...iva,
    metadata: {
      ...iva.metadata,
      updatedAt: new Date().toISOString(),
    },
  };

  if (existingIndex >= 0) {
    data.ivas[existingIndex] = updatedIva;
  } else {
    data.ivas.push(updatedIva);
  }

  saveStoredData(data);
  updateRecents(iva.metadata.id);
}

// Delete IVA
export function deleteIVA(id: string): void {
  const data = getStoredData();
  data.ivas = data.ivas.filter((iva) => iva.metadata.id !== id);
  data.settings.recentIds = data.settings.recentIds.filter((rid) => rid !== id);
  data.settings.favoriteIds = data.settings.favoriteIds.filter((fid) => fid !== id);
  saveStoredData(data);
}

// Toggle favorite status
export function toggleFavorite(id: string): boolean {
  const data = getStoredData();
  const ivaIndex = data.ivas.findIndex((iva) => iva.metadata.id === id);

  if (ivaIndex < 0) return false;

  const isFavorite = data.settings.favoriteIds.includes(id);

  if (isFavorite) {
    data.settings.favoriteIds = data.settings.favoriteIds.filter((fid) => fid !== id);
    data.ivas[ivaIndex].metadata.isFavorite = false;
  } else {
    data.settings.favoriteIds.push(id);
    data.ivas[ivaIndex].metadata.isFavorite = true;
  }

  saveStoredData(data);
  return !isFavorite;
}

// Update recent IVAs list
export function updateRecents(id: string): void {
  const data = getStoredData();

  // Remove if already exists
  data.settings.recentIds = data.settings.recentIds.filter((rid) => rid !== id);

  // Add to front
  data.settings.recentIds.unshift(id);

  // Keep only last 10
  data.settings.recentIds = data.settings.recentIds.slice(0, 10);

  saveStoredData(data);
}

// Get recent IVAs
export function getRecentIVAs(): IVA[] {
  const data = getStoredData();
  return data.settings.recentIds
    .map((id) => data.ivas.find((iva) => iva.metadata.id === id))
    .filter((iva): iva is IVA => iva !== undefined);
}

// Get favorite IVAs
export function getFavoriteIVAs(): IVA[] {
  const data = getStoredData();
  return data.settings.favoriteIds
    .map((id) => data.ivas.find((iva) => iva.metadata.id === id))
    .filter((iva): iva is IVA => iva !== undefined);
}

// Get settings
export function getSettings(): UserSettings {
  return getStoredData().settings;
}

// Generate unique ID
export function generateId(): string {
  return `iva-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get IVAs by status
export function getIVAsByStatus(status: 'draft' | 'submitted'): IVA[] {
  const data = getStoredData();
  return data.ivas.filter((iva) => iva.metadata.status === status);
}

// Clear all data (for testing)
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
