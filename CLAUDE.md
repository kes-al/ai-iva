# IVA Builder - Project Documentation

## Project Description

IVA Builder is a web application for Bristol Myers Squibb (BMS) that enables pharmaceutical field teams to create Interactive Visual Aids (IVAs) through a conversational interface. IVAs are HTML5 presentation packages used by sales reps to detail healthcare professionals (HCPs) on pharmaceutical products.

**Key Features:**
- Conversational IVA creation with AI assistance
- Live slide preview during creation
- 6 pre-built slide templates optimized for pharma content
- ISI (Important Safety Information) support
- Export to standalone HTML zip packages (Veeva-compatible)
- IVA archive management with favorites

**BMS Portfolio Context:** Heavy oncology/immunology focus - Opdivo, Yervoy, Reblozyl, Breyanzi, Camzyos, Sotyktu.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude API (Haiku for intent parsing)
- **State Management:** React useState/useReducer
- **Zip Generation:** JSZip (client-side)
- **Storage:** localStorage for IVA persistence
- **Testing:** Playwright (E2E), Vitest (unit tests)

## File Structure

```
src/
├── app/
│   ├── page.tsx                 # Main page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── api/
│       └── chat/
│           └── route.ts         # Chat API endpoint
├── components/
│   ├── IVABuilder/
│   │   ├── IVABuilder.tsx       # Main container
│   │   ├── LandingView.tsx      # Initial 60% state
│   │   ├── ExpandedView.tsx     # 80% state with panels
│   │   ├── ChatPanel.tsx        # Conversation panel
│   │   ├── SidePanel.tsx        # Preview/archive panel
│   │   ├── ChatInput.tsx        # Input component
│   │   ├── ChatMessage.tsx      # Message component
│   │   ├── LayoutSelector.tsx   # Layout cards
│   │   └── TransitionWrapper.tsx
│   ├── SlidePreview/
│   │   ├── SlidePreview.tsx     # Live preview
│   │   ├── SlideThumbStrip.tsx  # Thumbnails
│   │   └── templates/           # 6 slide templates
│   ├── Archive/                 # Archive components
│   └── Preview/                 # Full preview mode
├── lib/
│   ├── storage.ts               # localStorage ops
│   ├── export.ts                # Zip generation
│   ├── templates.ts             # Template definitions
│   └── types.ts                 # TypeScript types
├── hooks/
│   ├── useIVABuilder.ts         # State machine
│   ├── useChat.ts               # Chat state
│   └── useLocalStorage.ts       # Persistence
└── tests/
    ├── e2e/                     # Playwright tests
    └── unit/                    # Vitest tests
```

## Key Architectural Decisions

1. **Single Page Application:** All states (LANDING, BUILD, EDIT, PREVIEW, ARCHIVE) rendered on one page with smooth transitions
2. **State Machine Pattern:** useIVABuilder hook manages all application state and transitions
3. **AI Intent Parsing:** Haiku extracts structured intents from natural language, returns JSON
4. **Client-Side Export:** JSZip generates downloadable packages entirely in browser
5. **localStorage Persistence:** Simple v1 approach, no backend database needed
6. **Template System:** Each slide template is a React component with defined slots

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Type check
npm run type-check
```

## Testing Strategy

### Unit Tests (Vitest)
- `storage.ts` - CRUD operations, edge cases
- `export.ts` - Zip structure, HTML rendering
- `templates.ts` - Slot definitions, partial data rendering

### E2E Tests (Playwright)
- Full IVA creation flow
- State transitions and animations
- Export functionality
- Archive management

## Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
```

## API Endpoints

### POST /api/chat
Handles chat messages, returns AI response with parsed intent.

Request:
```json
{
  "message": "string",
  "context": {
    "currentState": "AppState",
    "currentIVA": "IVA | null",
    "conversationHistory": "Message[]"
  }
}
```

Response:
```json
{
  "reply": "string",
  "intent": "Intent",
  "uiActions": "UIAction[]"
}
```
