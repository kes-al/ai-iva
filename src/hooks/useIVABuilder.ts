'use client';

import { useReducer, useCallback } from 'react';
import {
  AppState,
  BuilderState,
  BuilderAction,
  Message,
  IVA,
  IVAMetadata,
  SlideData,
  ConversationPhase,
} from '@/lib/types';
import { generateId } from '@/lib/storage';

const initialState: BuilderState = {
  appState: 'LANDING',
  currentIVA: null,
  currentSlideIndex: 0,
  messages: [],
  conversationPhase: 'initial',
  isTransitioning: false,
  isLoading: false,
  error: null,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_APP_STATE':
      return { ...state, appState: action.state };

    case 'SET_CURRENT_IVA':
      return { ...state, currentIVA: action.iva };

    case 'UPDATE_IVA_METADATA':
      if (!state.currentIVA) {
        return {
          ...state,
          currentIVA: {
            metadata: {
              id: generateId(),
              name: '',
              brand: 'Opdivo',
              therapeuticArea: 'Oncology',
              targetAudience: '',
              slideCount: 0,
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isFavorite: false,
              ...action.metadata,
            } as IVAMetadata,
            slides: [],
          },
        };
      }
      return {
        ...state,
        currentIVA: {
          ...state.currentIVA,
          metadata: {
            ...state.currentIVA.metadata,
            ...action.metadata,
          } as IVAMetadata,
        },
      };

    case 'SET_SLIDE':
      if (!state.currentIVA) return state;
      const updatedSlides = [...(state.currentIVA.slides || [])];
      updatedSlides[action.slideIndex] = action.slide;
      return {
        ...state,
        currentIVA: {
          ...state.currentIVA,
          slides: updatedSlides,
        },
      };

    case 'ADD_SLIDE':
      if (!state.currentIVA) return state;
      return {
        ...state,
        currentIVA: {
          ...state.currentIVA,
          slides: [...(state.currentIVA.slides || []), action.slide],
        },
      };

    case 'SET_CURRENT_SLIDE_INDEX':
      return { ...state, currentSlideIndex: action.index };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };

    case 'SET_CONVERSATION_PHASE':
      return { ...state, conversationPhase: action.phase };

    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.isTransitioning };

    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useIVABuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  // State setters
  const setAppState = useCallback((appState: AppState) => {
    dispatch({ type: 'SET_APP_STATE', state: appState });
  }, []);

  const setCurrentIVA = useCallback((iva: Partial<IVA> | null) => {
    dispatch({ type: 'SET_CURRENT_IVA', iva });
  }, []);

  const updateIVAMetadata = useCallback((metadata: Partial<IVAMetadata>) => {
    dispatch({ type: 'UPDATE_IVA_METADATA', metadata });
  }, []);

  const setSlide = useCallback((slideIndex: number, slide: SlideData) => {
    dispatch({ type: 'SET_SLIDE', slideIndex, slide });
  }, []);

  const addSlide = useCallback((slide: SlideData) => {
    dispatch({ type: 'ADD_SLIDE', slide });
  }, []);

  const setCurrentSlideIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_SLIDE_INDEX', index });
  }, []);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', message });
  }, []);

  const setConversationPhase = useCallback((phase: ConversationPhase) => {
    dispatch({ type: 'SET_CONVERSATION_PHASE', phase });
  }, []);

  const setTransitioning = useCallback((isTransitioning: boolean) => {
    dispatch({ type: 'SET_TRANSITIONING', isTransitioning });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Complex actions
  const startNewIVA = useCallback(() => {
    const newIVA: Partial<IVA> = {
      metadata: {
        id: generateId(),
        name: '',
        brand: 'Opdivo',
        therapeuticArea: 'Oncology',
        targetAudience: '',
        slideCount: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
      },
      slides: [],
    };

    dispatch({ type: 'SET_CURRENT_IVA', iva: newIVA });
    dispatch({ type: 'SET_CONVERSATION_PHASE', phase: 'brand_selection' });
    dispatch({ type: 'SET_APP_STATE', state: 'BUILD' });
  }, []);

  const loadIVAForEdit = useCallback((iva: IVA) => {
    dispatch({ type: 'SET_CURRENT_IVA', iva });
    dispatch({ type: 'SET_CONVERSATION_PHASE', phase: 'editing' });
    dispatch({ type: 'SET_APP_STATE', state: 'EDIT' });
  }, []);

  const loadIVAForPreview = useCallback((iva: IVA) => {
    dispatch({ type: 'SET_CURRENT_IVA', iva });
    dispatch({ type: 'SET_CURRENT_SLIDE_INDEX', index: 0 });
    dispatch({ type: 'SET_APP_STATE', state: 'PREVIEW' });
  }, []);

  const goToArchive = useCallback(() => {
    dispatch({ type: 'SET_APP_STATE', state: 'ARCHIVE' });
  }, []);

  const goToLanding = useCallback(() => {
    dispatch({ type: 'SET_APP_STATE', state: 'LANDING' });
    dispatch({ type: 'SET_CURRENT_IVA', iva: null });
    dispatch({ type: 'SET_CONVERSATION_PHASE', phase: 'initial' });
  }, []);

  // Transition handling
  const transitionTo = useCallback(
    async (newState: AppState) => {
      setTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Allow React to batch
      setAppState(newState);
      await new Promise((resolve) => setTimeout(resolve, 400)); // Animation duration
      setTransitioning(false);
    },
    [setAppState, setTransitioning]
  );

  return {
    state,
    // Basic setters
    setAppState,
    setCurrentIVA,
    updateIVAMetadata,
    setSlide,
    addSlide,
    setCurrentSlideIndex,
    addMessage,
    setConversationPhase,
    setTransitioning,
    setLoading,
    setError,
    reset,
    // Complex actions
    startNewIVA,
    loadIVAForEdit,
    loadIVAForPreview,
    goToArchive,
    goToLanding,
    transitionTo,
  };
}

export type UseIVABuilderReturn = ReturnType<typeof useIVABuilder>;
