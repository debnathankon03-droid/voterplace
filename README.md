# 🗳️ Matdaan Mitra — Your Election Guide

A context-aware conversational assistant that guides Indian voters through their personalized election journey — eligibility, registration, timelines, polling, and rights — powered by Google Gemini AI.

## ✨ Features

- **AI Chat Assistant** — Ask anything about elections. Answers grounded in verified ECI knowledge base with citations.
- **Election Quiz** — AI-generated questions at 3 difficulty levels to build election literacy.
- **Myth Buster** — Searchable, categorized myth-vs-fact cards with verified sources.
- **Polling Station Locator** — Geolocation + Google Maps integration to find your booth.
- **Decision Engine** — Personalized action cards based on your age, registration status, and election phase.
- **Voice-First** — Speak your questions and hear answers via Web Speech API.
- **Calendar Sync** — Add election deadlines to Google Calendar.
- **Accessibility** — Skip links, focus-visible, high-contrast mode, screen-reader friendly.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| AI | Google Gemini 2.0 Flash |
| Auth & DB | Firebase Auth + Firestore (optional) |
| Maps | Google Maps Embed API |
| Icons | Lucide React |
| Fonts | Inter + Outfit (via next/font) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google AI Studio API key ([get one free](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd "Matdaan Mitra"

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Powers AI chat and quiz generation |
| `NEXT_PUBLIC_FIREBASE_*` | ❌ Optional | Auth + Firestore persistence |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ❌ Optional | Embedded map on locator page |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Gemini chat with RAG
│   │   ├── quiz/generate/route.ts # AI quiz generation
│   │   ├── profile/route.ts       # User profile CRUD
│   │   └── calendar/add/route.ts  # Google Calendar URL gen
│   ├── chat/page.tsx              # Chat interface
│   ├── dashboard/page.tsx         # Personalized dashboard
│   ├── locator/page.tsx           # Polling station finder
│   ├── myths/page.tsx             # Myth vs Fact
│   ├── onboarding/page.tsx        # 3-step user setup
│   ├── quiz/page.tsx              # Election quiz
│   ├── settings/page.tsx          # User preferences
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Design system
├── data/
│   ├── kb/                        # Knowledge base markdown
│   │   ├── registration.md
│   │   ├── polling-process.md
│   │   ├── election-phases.md
│   │   ├── rights-and-grievance.md
│   │   └── glossary.md
│   └── myths.json                 # Myth vs fact entries
├── lib/
│   ├── decisionEngine.ts          # Action card logic
│   ├── knowledgeBase.ts           # RAG retrieval
│   ├── gemini.ts                  # Gemini AI client
│   ├── firebase.ts                # Firebase config
│   └── utils.ts                   # Helpers
└── types/
    ├── index.ts                   # All TypeScript types
    └── markdown.d.ts              # .md import declaration
```

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.

## 📝 License

This is an educational tool and is not affiliated with the Election Commission of India.
Authoritative source: [eci.gov.in](https://eci.gov.in)
