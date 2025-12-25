# ABRA-SIVE LOGIC: Football Analytical Suite
> "WE REJECT THE SOFT CURVES OF CORPORATE COMFORT. THE FUTURE IS RAW, VISIBLE, AND UNCOMPROMISING."

## Overview
**Football Logic** is a high-performance, professional-grade tactical analysis platform designed for football analysts, coaches, and enthusiasts. It combines real-time video feeds with a synchronized, interactive 2D tactical board to deconstruct matches with logic and precision.

## Core Features

### 1. Tactical Command Center (`/command`)
The heart of the application, featuring a split-view interface:
- **Viewport Reality**: Embeddable video player (YouTube/Bilibili) for match footage.
- **Viewport Logic**: synchronized 2D tactical pitch for schematic analysis.

### 2. Advanced Pitch2D Engine
A custom-built 2D tactical drawing engine supporting:
- **Interactive Players**: Drag-and-drop players with physics-based smooth movement.
- **Smart Formations**: Built-in standard formations (4-4-2, 4-3-3, etc.) with automatic positioning constrained to team halves.
- **Dynamic Offside Lines**: Real-time white dashed lines tracking the 2nd-to-last defender for both teams.
- **Auto-Tactics System**: intelligently generates visual cues based on assigned tags:
  - **Run/Attack**: Red forward trajectories.
  - **Press**: Orange aggressive vectors.
  - **Drop/Defend**: Blue defensive recovery lines.
  - **Support**: Yellow connection lines.
  - **Tactical Zones**: Semi-transparent overlays for "Half Spaces", "Zone 14", "Box", etc.

### 3. Visual Logic Stream
- **Status Indicators**: Players glow with color-coded status rings (Red=Attack, Orange=Press, Blue=Defend, etc.) based on their current orders.
- **Smart Erasure**: Moving a player automatically clears their outdated tactical lines and status tags to keep the board clean.
- **Logic Commit**: Save snapshots of the board state and drawing lines, linked to specific video timestamps.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Brutalist Design System
- **State**: React Hooks + Local State for high-frequency interactive canvas
- **Localization**: i18n support (English / Chinese)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Command Center**:
   Navigate to `http://localhost:3000/command` to launch the tactical suite.

## Control Manual
See [docs/TACTICAL_MANUAL.md](docs/TACTICAL_MANUAL.md) for detailed usage instructions.
