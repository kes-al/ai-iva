// Core Types for IVA Builder

// App States
export type AppState = 'LANDING' | 'BUILD' | 'EDIT' | 'PREVIEW' | 'ARCHIVE';

// IVA Metadata
export interface IVAMetadata {
  id: string;
  name: string;
  brand: Brand;
  therapeuticArea: TherapeuticArea;
  targetAudience: string;
  slideCount: number;
  status: 'draft' | 'submitted';
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

// Brands
export type Brand =
  | 'Opdivo'
  | 'Yervoy'
  | 'Reblozyl'
  | 'Breyanzi'
  | 'Camzyos'
  | 'Sotyktu';

// Therapeutic Areas
export type TherapeuticArea =
  | 'Oncology'
  | 'Immunology'
  | 'Cardiovascular'
  | 'Dermatology'
  | 'Hematology';

// Slot Types
export type SlotType =
  | 'headline'
  | 'subhead'
  | 'body'
  | 'image'
  | 'chart'
  | 'bullet-list'
  | 'isi';

// Slot Definition
export interface SlotDefinition {
  id: string;
  type: SlotType;
  label: string;
  required: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  placeholder?: string;
}

// Slide Template
export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  slots: SlotDefinition[];
}

// Slide Data
export interface SlideData {
  templateId: string;
  slots: Record<string, string | null>;
}

// Full IVA
export interface IVA {
  metadata: IVAMetadata;
  slides: SlideData[];
}

// Stored Data (localStorage)
// Note: userId placeholder for future Supabase migration
export interface StoredData {
  userId: string;  // 'local' for now, will be real user ID with Supabase
  ivas: IVA[];
  settings: UserSettings;
}

export interface UserSettings {
  recentIds: string[];
  favoriteIds: string[];
}

// Chat Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  uiAction?: UIAction;
}

// Intent Types
export type Intent =
  | { type: 'create_iva' }
  | { type: 'edit_iva'; ivaId: string }
  | { type: 'preview_iva'; ivaId: string }
  | { type: 'show_archive' }
  | { type: 'show_favorites' }
  | { type: 'select_layout'; slideIndex: number; layoutId: string }
  | { type: 'set_content'; slideIndex: number; field: string; value: string }
  | { type: 'set_brand'; brand: Brand }
  | { type: 'set_audience'; audience: string }
  | { type: 'set_therapeutic_area'; area: TherapeuticArea }
  | { type: 'set_slide_count'; count: number }
  | { type: 'set_slide_intent'; slideIndex: number; intent: string }
  | { type: 'set_iva_name'; name: string }
  | { type: 'configure_isi'; config: ISIConfig }
  | { type: 'export_iva' }
  | { type: 'save_iva' }
  | { type: 'go_back' }
  | { type: 'next_slide' }
  | { type: 'prev_slide' }
  | { type: 'select_slide'; slideIndex: number }
  | { type: 'unknown'; rawInput: string };

// ISI Configuration
export interface ISIConfig {
  enabled: boolean;
  style: 'scrolling' | 'expandable';
  placement: 'bottom' | 'right';
}

// UI Actions (returned from AI)
export type UIAction =
  | { type: 'show_layouts'; layouts: SlideTemplate[] }
  | { type: 'show_slide_preview'; slideIndex: number }
  | { type: 'highlight_slot'; slotId: string }
  | { type: 'show_edit_options'; ivaId: string }
  | { type: 'show_isi_options' }
  | { type: 'trigger_export' }
  | { type: 'navigate_to'; state: AppState };

// Chat API Request
export interface ChatRequest {
  message: string;
  context: ChatContext;
}

// Chat Context
export interface ChatContext {
  currentState: AppState;
  currentIVA: Partial<IVA> | null;
  currentSlideIndex: number;
  conversationHistory: Message[];
  conversationPhase: ConversationPhase;
}

// Conversation Phases
export type ConversationPhase =
  | 'initial'
  | 'brand_selection'
  | 'audience_selection'
  | 'slide_structure'
  | 'layout_selection'
  | 'content_population'
  | 'isi_configuration'
  | 'review'
  | 'editing';

// Chat API Response
export interface ChatResponse {
  reply: string;
  intent: Intent;
  uiActions?: UIAction[];
  nextPhase?: ConversationPhase;
}

// Builder State (for useIVABuilder hook)
export interface BuilderState {
  appState: AppState;
  currentIVA: Partial<IVA> | null;
  currentSlideIndex: number;
  messages: Message[];
  conversationPhase: ConversationPhase;
  isTransitioning: boolean;
  isLoading: boolean;
  error: string | null;
}

// Builder Actions
export type BuilderAction =
  | { type: 'SET_APP_STATE'; state: AppState }
  | { type: 'SET_CURRENT_IVA'; iva: Partial<IVA> | null }
  | { type: 'UPDATE_IVA_METADATA'; metadata: Partial<IVAMetadata> }
  | { type: 'SET_SLIDE'; slideIndex: number; slide: SlideData }
  | { type: 'ADD_SLIDE'; slide: SlideData }
  | { type: 'SET_CURRENT_SLIDE_INDEX'; index: number }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_CONVERSATION_PHASE'; phase: ConversationPhase }
  | { type: 'SET_TRANSITIONING'; isTransitioning: boolean }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

// Archive Filter
export type ArchiveFilter = 'all' | 'drafts' | 'submitted';

// Export types
export interface ExportManifest {
  name: string;
  brand: Brand;
  version: string;
  slideCount: number;
  createdAt: string;
  createdBy: string;
}
