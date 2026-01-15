'use client';

import { useState, useEffect, useCallback } from 'react';
import { IVA } from '@/lib/types';
import {
  getAllIVAs,
  getIVA,
  saveIVA,
  deleteIVA,
  toggleFavorite,
  getRecentIVAs,
  getFavoriteIVAs,
  getIVAsByStatus,
} from '@/lib/storage';

export function useLocalStorage() {
  const [ivas, setIvas] = useState<IVA[]>([]);
  const [recentIVAs, setRecentIVAs] = useState<IVA[]>([]);
  const [favoriteIVAs, setFavoriteIVAs] = useState<IVA[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshData();
      setIsLoaded(true);
    }
  }, []);

  const refreshData = useCallback(() => {
    setIvas(getAllIVAs());
    setRecentIVAs(getRecentIVAs());
    setFavoriteIVAs(getFavoriteIVAs());
  }, []);

  const save = useCallback(
    (iva: IVA) => {
      saveIVA(iva);
      refreshData();
    },
    [refreshData]
  );

  const remove = useCallback(
    (id: string) => {
      deleteIVA(id);
      refreshData();
    },
    [refreshData]
  );

  const toggle = useCallback(
    (id: string) => {
      const newState = toggleFavorite(id);
      refreshData();
      return newState;
    },
    [refreshData]
  );

  const getById = useCallback((id: string) => {
    return getIVA(id);
  }, []);

  const getByStatus = useCallback((status: 'draft' | 'submitted') => {
    return getIVAsByStatus(status);
  }, []);

  return {
    ivas,
    recentIVAs,
    favoriteIVAs,
    isLoaded,
    save,
    remove,
    toggleFavorite: toggle,
    getById,
    getByStatus,
    refreshData,
  };
}

export type UseLocalStorageReturn = ReturnType<typeof useLocalStorage>;
