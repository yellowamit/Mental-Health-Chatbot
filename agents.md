# Agents Context & Change of Thought Tracking
**Project**: WellBot - AI Mental Health & Well-being Companion  
**Workspace**: `Mental-Health-Chatbot`  
**Last Updated**: October 11, 2026

---

## 1. Project Overview & Objectives
WellBot is a MERN-stack web application powered by Google Gemini AI, designed to provide empathetic, non-judgmental mental health support, crisis assistance, emotional reflection, and therapist appointment scheduling.

### User Request Goals:
1. **Markdown Formatting**: Fix the raw Markdown output in chatbot messages (`**bold**`, `* lists`, `# headings`, etc.) so responses render cleanly and beautifully.
2. **Modern Well-being Visual Redesign**: Overhaul the outdated UI (neon pinks, harsh reds, static pixel coordinates) into an organic, therapeutic, serene aesthetic inspired by modern well-being applications (Calm, Headspace, MindShift).
3. **Context Preservation**: Continuously maintain this `agents.md` tracking architecture, decisions, and progress.
4. **Change of Thought Methodology**: Explicitly reason through state transitions, design trade-offs, and verification steps at every phase.

---

## 2. Architecture & File Structure

```
Mental-Health-Chatbot/
├── agents.md                                # Context & Change of Thought tracking (This file)
├── README.md                                # Project documentation
├── Backend/
│   ├── index.js                             # Express server, Gemini Pro API integration, auth & booking endpoints
│   ├── help.js                              # Helper routines
│   ├── .env.example                         # Sample environment configuration
│   └── package.json                         # Backend dependencies
└── chatbot/                                 # React Frontend
    ├── package.json                         # Dependencies (React 18, React Router v6, Speech Recognition, react-markdown, lucide-react)
    ├── public/
    │   └── index.html                       # Updated with Plus Jakarta Sans & Outfit fonts + meta descriptions
    └── src/
        ├── App.js                           # App routing & root layout
        ├── index.js                         # React DOM render entry
        ├── index.css                        # Global wellness design system variables & typography
        └── Components/
            ├── Common/
            │   ├── FormattedMessage.jsx     # Rich Markdown renderer with auto-hotline detection & click-to-call
            │   ├── FormattedMessage.css     # Clean typography, list, blockquote, and crisis card styling
            │   ├── BreathingWidget.jsx      # Live interactive 4-4-4 Mindful Breathing anxiety de-escalation widget
            │   └── BreathingWidget.css      # Smooth expanding/shrinking pulse animations
            ├── Navbar/
            │   ├── Navbar.jsx               # Sticky glassmorphic navigation header with crisis quick-dial modal
            │   └── Navbar.css               # Modern glassmorphism & responsive mobile drawer styling
            ├── BeforeHome/
            │   ├── BeforeHome.jsx           # Welcoming landing page for guests with daily thoughts & breathing tool
            │   └── BeforeHome.css           # Therapeutic hero, feature pillars & gentle reassurance styling
            ├── Home/
            │   ├── Home.jsx                 # Comprehensive dashboard with daily affirmations, wellness toolkit & breathing
            │   └── Home.css                 # Clean card grid and serene sage palettes
            ├── Check/
            │   ├── Check.jsx                # Primary interactive voice & text AI chatbot with markdown rendering & typing state
            │   └── Check.css                # Elevated chat window, speech-to-text waveforms, suggested prompts
            ├── Chatbot/
            │   └── Chatbot.jsx              # Synchronized wrapper ensuring /chatbot route has the same rich experience
            ├── Booking/
            │   ├── Booking.jsx              # Mindful consultation scheduler with specialty chips & user bookings tab
            │   └── Booking.css              # Calm therapeutic scheduler styling
            ├── LoginSignup/
            │   ├── LoginSignup.jsx          # Soothing authentication card with seamless Sign In / Register toggle
            │   └── LoginSignup.css          # Focused inputs with icons and privacy badges
            └── Footer/
                ├── Footer.jsx               # 24/7 crisis hotlines, medical disclaimer, and supportive links
                └── Footer.css               # Serene footer with emergency hotline chips
```

---

## 3. Change of Thought (State & Decision Log)

### Phase 1: Analysis & Diagnosis
- **Initial Observation**: 
  - Messages in `Check.jsx` and `Chatbot.jsx` were injected directly as raw text strings `{item.message}`. Gemini AI responses contain markdown formatting (lists, asterisks, bold titles, hotline numbers) which rendered literally on screen as `* *National Suicide Prevention Lifeline:* 988 (US)`.
  - Color palette was jarring: neon purples (`#c337c8`), neon pinks (`#f15ab7`, `#fce3fe`), alert reds (`#ff4141`), raw cyan (`#0dcaf0`), and dark low-contrast text.
  - Layout was rigid with hardcoded absolute percentages (`left: 68.5%; bottom: 48%;`), fixed pixel heights (`height: 550px`), breaking responsiveness across standard screens and mobile devices.
  - Navbar links were static unclickable list items (`<li>Home</li>`), and brand title was plain text without routing.
  - No visual feedback when the AI was generating thoughts/responses (lack of typing indicator).

### Phase 2: Design System Formulation ("Mindful Wellness")
- **Palette**:
  - Primary Brand / Serene Forest: `#2D5A43` / `#3B7258`
  - Calming Teal Accent: `#1F6F78` / `#2CA58D`
  - Soothing Soft Sage Background: `#F4F9F6` / `#E8F3EE`
  - Crisp Card Surfaces: `#FFFFFF` with soft ambient shadows (`0 8px 30px rgba(45, 90, 67, 0.07)`)
  - Warm Earth Neutral: `#4A5568` text, `#1A202C` headings
  - Alert / Crisis Gentle Accent: Soft terracotta & amber `#D97706` / `#DC2626` on `#FFF5F5` surfaces
- **Typography & Atmosphere**:
  - Modern, friendly typography: Google Fonts (`Plus Jakarta Sans` and `Outfit`).
  - Organic rounded pill badges, gentle transitions, glassmorphic sticky headers.
- **Key Well-being Features**:
  - Live Mindful Breathing Widget (inhale 4s / hold 4s / exhale 4s animation) to relieve anxiety on the spot.
  - Curated Daily Affirmation card with instant refresh linked to backend `/goodthoughts`.
  - Formatted Crisis Helpline SOS Banner with direct click-to-call links whenever distress or numbers appear.
  - Markdown message renderer with syntax highlight, bullet styling, and clean paragraphs.
  - Suggested Starter Prompts to reduce cognitive load when users don't know how to start talking.

### Phase 3: Implementation & Component Overhaul
1. Installed `react-markdown@8.0.7`, `remark-gfm@3.0.1`, and `lucide-react` cleanly.
2. Built `FormattedMessage.jsx` to render Markdown properly (paragraphs, bullet points, numbered lists, blockquotes, bolding, inline code, links) and auto-detect crisis phone numbers (988, 741741, AASRA, Tele-MANAS, Kiran, 112) into clickable emergency dials.
3. Created `BreathingWidget.jsx` with an interactive 4-4-4 rhythm for instant anxiety de-escalation.
4. Overhauled `Check.jsx` (and synced `Chatbot.jsx`) with WellBot companion status, typing indicator ("WellBot is listening and reflecting..."), animated voice recognition audio waveform, starter prompt pills, message copy actions, and responsive layout.
5. Upgraded `Navbar.jsx` with glassmorphic styling, active navigation state, fast-access Crisis Support modal, responsive mobile drawer, and session status badge.
6. Redesigned `BeforeHome.jsx` and `Home.jsx` into calming wellness spaces with hero sections, live breathing tools, daily affirmation cards, and wellness pillar resources.
7. Redesigned `Booking.jsx` with specialty chips, clean form inputs, inline validations, and an appointment history manager.
8. Upgraded `LoginSignup.jsx` into a comforting, secure authentication flow.
9. Upgraded `Footer.jsx` with emergency hotlines, medical safety disclaimers, and contact details.

### Phase 4: Verification & Build Validation
- Production build executed via `npm run build`:
  - **Status**: Compiled successfully with **0 errors and 0 warnings**.
  - Output bundle size: 117.87 kB gzipped.
  - Clean accessibility compliance for headings, anchors, and form labels.

---

## 4. Current Status & Verification
- [x] Initial codebase audit complete
- [x] `agents.md` created and tracking established
- [x] Frontend dependencies installed (`react-markdown`, `remark-gfm`, `lucide-react`)
- [x] Markdown parsing & rendering integration complete with crisis callout detection
- [x] UI/UX redesign of all pages to Modern Well-being theme complete
- [x] Production build verified with zero warnings (`Compiled successfully`)
