// Formation coordinates are defined for the "Left Side" team (Red) attacking Right.
// Coordinates are in percentage (0-100).
// x=0 is left goal line, x=100 is right goal line.
// y=0 is top touchline, y=100 is bottom touchline.
// ALL POSITIONS ARE CONSTRAINED TO OWN HALF (x < 50) FOR LINEUP DISPLAY.

export type Position = { x: number, y: number }
export type FormationData = Position[]

export const FORMATIONS: Record<string, FormationData> = {
    '4-4-2 (Flat)': [
        // Defenders
        { x: 15, y: 15 }, { x: 12, y: 38 }, { x: 12, y: 62 }, { x: 15, y: 85 },
        // Midfielders
        { x: 32, y: 15 }, { x: 32, y: 38 }, { x: 32, y: 62 }, { x: 32, y: 85 },
        // Forwards
        { x: 45, y: 38 }, { x: 45, y: 62 }
    ],
    '4-4-2 (Diamond)': [
        // Defenders
        { x: 15, y: 15 }, { x: 12, y: 38 }, { x: 12, y: 62 }, { x: 15, y: 85 },
        // CDM
        { x: 25, y: 50 },
        // LM, RM
        { x: 35, y: 20 }, { x: 35, y: 80 },
        // CAM
        { x: 42, y: 50 },
        // Forwards
        { x: 48, y: 40 }, { x: 48, y: 60 }
    ],
    '4-2-3-1': [
        // Defenders
        { x: 15, y: 15 }, { x: 12, y: 38 }, { x: 12, y: 62 }, { x: 15, y: 85 },
        // CDMs
        { x: 25, y: 35 }, { x: 25, y: 65 },
        // LAM, CAM, RAM
        { x: 40, y: 15 }, { x: 40, y: 50 }, { x: 40, y: 85 },
        // ST
        { x: 48, y: 50 }
    ],
    '4-1-2-3': [
        // Defenders
        { x: 15, y: 15 }, { x: 12, y: 38 }, { x: 12, y: 62 }, { x: 15, y: 85 },
        // CDM
        { x: 22, y: 50 },
        // CMs
        { x: 32, y: 35 }, { x: 32, y: 65 },
        // LW, ST, RW
        { x: 45, y: 15 }, { x: 48, y: 50 }, { x: 45, y: 85 }
    ],
    '3-4-3': [
        // Defenders (LCB, CB, RCB)
        { x: 15, y: 25 }, { x: 12, y: 50 }, { x: 15, y: 75 },
        // Midfielders
        { x: 30, y: 10 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 30, y: 90 },
        // Forwards
        { x: 45, y: 20 }, { x: 48, y: 50 }, { x: 45, y: 80 }
    ],
    '3-5-2': [
        // Defenders
        { x: 15, y: 25 }, { x: 12, y: 50 }, { x: 15, y: 75 },
        // Midfielders (LWB, CDM, CM, CM, RWB)
        { x: 30, y: 10 }, { x: 25, y: 50 }, { x: 35, y: 35 }, { x: 35, y: 65 }, { x: 30, y: 90 },
        // Forwards
        { x: 48, y: 40 }, { x: 48, y: 60 }
    ],
    '5-2-3': [
        // Defenders
        { x: 20, y: 10 }, { x: 15, y: 30 }, { x: 12, y: 50 }, { x: 15, y: 70 }, { x: 20, y: 90 },
        // Midfielders
        { x: 35, y: 40 }, { x: 35, y: 60 },
        // Forwards
        { x: 48, y: 20 }, { x: 48, y: 50 }, { x: 48, y: 80 }
    ],
    '5-3-2': [
        // Defenders
        { x: 20, y: 10 }, { x: 15, y: 30 }, { x: 12, y: 50 }, { x: 15, y: 70 }, { x: 20, y: 90 },
        // Midfielders
        { x: 32, y: 30 }, { x: 32, y: 50 }, { x: 32, y: 70 },
        // Forwards
        { x: 45, y: 40 }, { x: 45, y: 60 }
    ]
}

export const FORMATION_OPTIONS = Object.keys(FORMATIONS)

// Helper to get positions for a specific team
export const getFormationPositions = (formationName: string, team: 'red' | 'blue'): Position[] => {
    const base = FORMATIONS[formationName]
    if (!base) return []

    // Return hard copy
    const positions = JSON.parse(JSON.stringify(base)) as Position[]

    if (team === 'red') {
        // Red is already defined as Left -> Right
        return positions
    } else {
        // Blue is Right -> Left (Mirror X coords)
        return positions.map(p => ({
            x: 100 - p.x, // Mirror X
            y: p.y        // Keep Y
        }))
    }
}
