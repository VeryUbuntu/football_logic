# Tactical Suite Manual // OPERATIONAL_GUIDE

## 1. Interface Layout
The **Command Page** is divided into two primary viewports:
- **LEFT (The Reality)**: Input video feed (supports YouTube & Bilibili).
- **RIGHT (The Logic)**: Interactive 2D Tactical Board.
- **BOTTOM (Data Stream)**: Log of all actions and committed logic nodes.
- **OVERLAY (Formation Panel)**: Collapsible panel at the bottom of the pitch for team management.

## 2. Formation Management
Located at the bottom of the Tactical Pitch (`[THE_LOGIC]`), the **Formation Control Panel** allows you to:
- **Set Team Names**: Customize names for Red (Home) and Blue (Away) teams.
- **Select Formations**: Choose from presets like `4-4-2 Flat`, `4-3-3 Holding`, `3-5-2`, etc.
  - *Note*: Players are automatically positioned within their respective halves (Red attacking Right, Blue attacking Left).
  - *GK Isolation*: Goalkeepers (No. 1) are excluded from formation shifts to maintain goal protection.

## 3. Player Interaction
- **Select**: Click a player to open the **Tag Library**.
- **Move**: Drag any player to reposition them.
  - **Smart Erasure**: Moving a player effectively "resets" their state—any attached tags, status colors, or generated tactical lines will be cleared to reflect their new position.
- **Status Indicators (Colored Dots)**:
  - 🔴 **Red**: Attacking / Run / Sprint
  - 🟠 **Orange**: Pressing / Marking
  - 🔵 **Blue**: Defending / Dropping Back
  - 🟡 **Yellow**: Support / Hold
  - 🟣 **Purple**: Spatial / Zonal Awareness

## 4. Drawing Tools
Use the toolbar at the top of the pitch to switch modes:
- **MOVE Mode**: Default mode for dragging players.
- **DRAW Mode**: Freehand drawing tool.
  - *Colors*: Red (Attack), Blue (Defense), Yellow (Movement), Green (Logic).
  - *Styles*: Toggle between Solid or Dashed lines.
- **ERASE Mode**:
  - Click any line to remove it.
  - Hovering over lines will highlight them for easier selection.
- **Undo**: `Cmd+Z` / `Ctrl+Z` to undo the last drawn line.

## 5. Auto-Tactics System
Instead of drawing manually, you can assign **Tags** to players to generate immediate tactical visualizations:
- **Movement Tags**:
  - Select "Run" -> Generates a Red Forward Arrow.
  - Select "Press" -> Generates a Short Orange Vector.
  - Select "Drop" -> Generates a Blue Backward Line.
- **Spatial Tags**:
  - Select "Half Space", "Zone 14", "Box", or "Flank".
  - System renders a **pulsing semi-transparent zone** in the appropriate area relative to the player.

## 6. Offside Line Technology
- The system automatically calculates and renders **White Dashed Lines** representing the offside line for both teams.
- **Rule**: The line tracks the X-coordinate of the **2nd deepest defender** for each team.
- **Dynamic**: These lines update in real-time as you drag defenders.

## 7. Logic Nodes (Save/Load)
- **Commit Logic**: Click `[COMMIT_LOGIC]` to save the current board state (lines + player positions) as a node.
- **Restore**: Click any saved node in the Data Stream to revert the board to that exact tactical moment.
