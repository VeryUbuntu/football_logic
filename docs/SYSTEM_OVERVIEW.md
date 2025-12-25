# Football Logic - System Overview

## Project Goal
A professional-grade football tactical analysis platform combining video analysis with a sophisticated 2D schematic engine.

## Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, `lucide-react` icons.
- **State Management**: React Hooks (Complex interactive state).
- **Internationalization**: `i18next` (English/Chinese).

## Architecture & Modules

### 1. Tactical Engine (`components/tactical/`)
- **`Pitch2D.tsx`**: The core component. Handles:
    - SVG-based drawing layers (Freehand lines, vectors).
    - DOM-based player rendering and physics.
    - Coordinate translation (0-100% relative positioning).
    - Real-time offside line calculation.
    - Tactical Zone rendering.
- **`DataLogStream.tsx`**: Manages the immutable log of actions and the "Time Machine" logic (LogicNodes) to restore states.
- **`TagLibrary.tsx`**: Floating context menu for assigning semantic actions to players.

### 2. Logic Controller (`app/command/page.tsx`)
The central brain that orchestrates:
- Video/Pitch synchronization.
- Tool modes (Move/Draw/Erase).
- Formation application logic.
- Auto-tactics generation (converting Tags to Lines/Zones).

### 3. Data Utilities
- **`utils/formations.ts`**: Contains normalized coordinate data for standard football formations.
- **`utils/locales/`**: Translation dictionaries.

## Project Structure
```
football_logic/
├── app/
│   ├── command/        # Tactical Command Center (Main App)
│   ├── globals.css     # Global styles & Tailwind
│   └── layout.tsx      # Root layout
├── components/
│   ├── tactical/       # Pitch2D, DataLog, TagLibrary
│   └── ui/             # Generic UI components
├── utils/
│   ├── formations.ts   # Formation Data
│   └── locales/        # i18n
└── docs/               # Documentation
    ├── TACTICAL_MANUAL.md
    └── SYSTEM_OVERVIEW.md
```
