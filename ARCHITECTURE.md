# Architecture — Matdaan Mitra

## System Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Landing → Onboarding → Dashboard → Features    │
│  (React Server + Client Components)             │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌──────────┐ ┌───────────┐ ┌──────────┐
   │ /api/chat│ │/api/quiz/ │ │/api/     │
   │          │ │ generate  │ │calendar/ │
   └────┬─────┘ └─────┬─────┘ └──────────┘
        │              │
   ┌────▼──────────────▼────┐
   │    Knowledge Base      │
   │  (Markdown → Chunks)   │
   └────────────┬───────────┘
                │
   ┌────────────▼───────────┐
   │   Google Gemini 2.0    │
   │     Flash (Server)     │
   └────────────────────────┘
```

## Core Modules

### 1. Decision Engine (`src/lib/decisionEngine.ts`)

Pure function with zero side effects. Maps `(UserProfile, ElectionPhase) → ActionCard[]`.

**Branching logic:**
- **Under 18** → Future voter pathway (pre-registration, learning)
- **Eligible but unregistered** → Registration urgency (escalates during active election)
- **Registered** → Phase-dependent guidance (8 phases: no_election → concluded)

Each ActionCard has a `priority` (0=critical → 4=low). The dashboard sorts and renders them.

### 2. Knowledge Base (`src/lib/knowledgeBase.ts`)

RAG-style retrieval without embeddings:
1. **Load**: Import 5 markdown files at build time via `raw-loader`
2. **Parse**: Extract YAML frontmatter (topic, tags, source)
3. **Chunk**: Split by `##` headings into discrete `KBChunk` objects
4. **Retrieve**: Score chunks by keyword overlap (heading match +3, tag match +2, content match +1)
5. **Inject**: Top-3 chunks are injected into Gemini's system prompt as `CONTEXT`

### 3. Gemini Integration (`src/lib/gemini.ts`)

Server-side only. Two prompt templates:
- **Chat**: System prompt with user profile + KB context. Instructs model to stay non-partisan, cite sources, match language.
- **Quiz**: Instructs model to return strict JSON with question, 4 options, correctIndex, explanation. Includes retry logic and validation.

### 4. Chat API (`src/app/api/chat/route.ts`)

Request flow:
1. Sanitize user input
2. Retrieve relevant KB chunks via keyword matching
3. Build system prompt with user context + KB context
4. Call Gemini `generateContent`
5. Return response + source citations

### 5. Quiz API (`src/app/api/quiz/generate/route.ts`)

1. Pick random topic from KB
2. Get relevant chunks
3. Ask Gemini to generate MCQ in JSON format
4. Parse and validate response shape (retry up to 2x)
5. Fall back to hardcoded question on failure

## Data Flow

```
User Profile (localStorage)
    │
    ├──→ Decision Engine ──→ Dashboard Action Cards
    │
    ├──→ Chat API ──→ Gemini (with KB context) ──→ Response + Citations
    │
    └──→ Quiz API ──→ Gemini (with KB context) ──→ MCQ JSON
```

## Design System

- **Theme**: Dark mode with Indian tricolor accents (saffron/white/green)
- **Glass**: `backdrop-filter: blur(16px)` cards with subtle borders
- **Typography**: Outfit (headings) + Inter (body) via `next/font/google`
- **Animations**: slideInUp, pulse-glow, float, shimmer, fadeIn
- **Accessibility**: Skip link, `:focus-visible` ring, `[data-theme="high-contrast"]` override

## Key Design Decisions

1. **No embeddings for KB** — Keyword retrieval is sufficient for 5 small documents and avoids vector DB complexity.
2. **Gemini server-side only** — API key never exposed to client. All AI calls through Next.js API routes.
3. **localStorage for MVP** — Firebase Auth/Firestore are configured but profiles use localStorage for zero-config demo.
4. **Pure decision engine** — No side effects, fully unit-testable. Takes profile + phase, returns cards.
5. **Turbopack** — Next.js 16 default bundler. Uses `raw-loader` for .md file imports.
