"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

export type Player = {
    id: string
    team: 'red' | 'blue'
    x: number // percentage 0-100
    y: number // percentage 0-100
    number: number
    tags: string[]
}

export type DrawingStyle = {
    color: string
    isDashed: boolean
}

export type TacticalLine = {
    id: string
    points: { x: number, y: number }[] // Series of points for freehand drawing
    color: string
    isDashed: boolean
    ownerId?: string // Player ID who owns this line
}

export type TacticalZone = {
    id: string
    x: number // Center X %
    y: number // Center Y %
    width: number // % of width
    height: number // % of height
    color: string
    ownerId?: string // Player ID who owns this zone
}

interface Pitch2DProps {
    players: Player[]
    lines: TacticalLine[]
    zones?: TacticalZone[] // Added
    ballPosition?: { x: number, y: number } // New Ball Prop
    isDrawingMode: boolean
    isEraserMode: boolean
    showOffsideLines?: boolean // New Toggle
    currentStyle: DrawingStyle
    onPlayerMove: (id: string, x: number, y: number) => void
    onBallMove?: (x: number, y: number) => void // New Ball Handler
    onPlayerSelect: (leader: Player) => void
    onLineCreate: (line: TacticalLine) => void
    onLineRemove: (lineId: string) => void
    selectedPlayerId?: string | null
}

export function Pitch2D({
    players,
    lines,
    zones = [],
    ballPosition,
    isDrawingMode,
    isEraserMode,
    showOffsideLines = true,
    currentStyle,
    onPlayerMove,
    onBallMove,
    onPlayerSelect,
    onLineCreate,
    onLineRemove,
    selectedPlayerId
}: Pitch2DProps) {
    const pitchRef = React.useRef<HTMLDivElement>(null)

    // State for dragging/moving players OR ball
    const [draggingId, setDraggingId] = React.useState<string | null>(null)
    const [dragStartPos, setDragStartPos] = React.useState<{ x: number, y: number } | null>(null)

    // State for drawing lines
    const [isDrawing, setIsDrawing] = React.useState(false)
    const [currentPoints, setCurrentPoints] = React.useState<{ x: number, y: number }[]>([])

    // Helper to get coordinates
    const getRelativeCoords = (e: React.PointerEvent | PointerEvent) => {
        if (!pitchRef.current) return { x: 0, y: 0 }
        const rect = pitchRef.current.getBoundingClientRect()
        const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
        const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
        return { x, y }
    }

    // Helper to generate SVG path string from points
    const getPathString = (points: { x: number, y: number }[]) => {
        if (points.length === 0) return ""
        // Start move to first point
        let d = `M ${points[0].x} ${points[0].y}`
        // Draw quadratic curves for smoothness if we have enough points, 
        // but for simplicity and responsiveness in React, simple L (lines) works surprisingly well for "digital marker" feel.
        // Let's stick to simple line segments for performance unless we need smoothing later.
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`
        }
        return d
    }

    // --- BOARD EVENTS (Drawing) ---
    const handleBoardPointerDown = (e: React.PointerEvent) => {
        if (!isDrawingMode) return
        e.preventDefault()
        e.stopPropagation()

        const target = e.currentTarget as Element
        target.setPointerCapture(e.pointerId)

        const coords = getRelativeCoords(e)
        setIsDrawing(true)
        setCurrentPoints([coords])
    }

    const handleBoardPointerMove = (e: React.PointerEvent) => {
        if (!isDrawingMode || !isDrawing) return
        e.preventDefault()

        const coords = getRelativeCoords(e)
        setCurrentPoints(prev => [...prev, coords])
    }

    const handleBoardPointerUp = (e: React.PointerEvent) => {
        if (!isDrawingMode || !isDrawing) return

        const target = e.currentTarget as Element
        if (target.releasePointerCapture) target.releasePointerCapture(e.pointerId)

        if (currentPoints.length > 2) {
            onLineCreate({
                id: Math.random().toString(36).substr(2, 9),
                points: currentPoints,
                color: currentStyle.color,
                isDashed: currentStyle.isDashed
            })
        }
        setIsDrawing(false)
        setCurrentPoints([])
    }

    // --- PLAYER & BALL EVENTS (Moving) ---
    const handleEntityPointerDown = (e: React.PointerEvent, id: string) => {
        if (isDrawingMode) return
        e.stopPropagation()
        e.preventDefault()

        const target = e.target as Element
        target.setPointerCapture(e.pointerId)

        setDraggingId(id)
        setDragStartPos({ x: e.clientX, y: e.clientY })
    }

    const handleEntityPointerMove = (e: React.PointerEvent, id: string) => {
        if (isDrawingMode || draggingId !== id) return
        e.preventDefault()
        e.stopPropagation()

        const coords = getRelativeCoords(e)

        if (id === 'ball' && onBallMove) {
            onBallMove(coords.x, coords.y)
        } else {
            onPlayerMove(id, coords.x, coords.y)
        }
    }

    const handleEntityPointerUp = (e: React.PointerEvent, player?: Player) => {
        if (isDrawingMode) return
        e.stopPropagation()

        const target = e.target as Element
        if (target.releasePointerCapture) target.releasePointerCapture(e.pointerId)

        // Select player logic (only for actual players, not ball)
        if (dragStartPos && player) {
            const dist = Math.sqrt(Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2))
            if (dist < 5) {
                onPlayerSelect(player)
            }
        }
        setDraggingId(null)
        setDragStartPos(null)
    }

    // Calculate Offside Lines
    // 1. Red Team Line (Defending Left x=0) -> Limits Blue Attackers
    // Rule: 2nd to last defender OR Ball (if closer to goal)
    const redPlayers = players.filter(p => p.team === 'red').sort((a, b) => a.x - b.x)
    let redOffsideX = redPlayers.length >= 2 ? redPlayers[1].x : null
    if (redOffsideX !== null && ballPosition) {
        redOffsideX = Math.min(redOffsideX, ballPosition.x)
    }

    // 2. Blue Team Line (Defending Right x=100) -> Limits Red Attackers
    const bluePlayers = players.filter(p => p.team === 'blue').sort((a, b) => b.x - a.x) // Descending
    let blueOffsideX = bluePlayers.length >= 2 ? bluePlayers[1].x : null
    if (blueOffsideX !== null && ballPosition) {
        blueOffsideX = Math.max(blueOffsideX, ballPosition.x)
    }

    return (
        <div
            ref={pitchRef}
            className={cn(
                "w-full h-full bg-[#0a200a] border-2 border-[#00ff41] relative overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)] touch-none select-none",
                isDrawingMode ? "cursor-crosshair" : "cursor-default"
            )}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={handleBoardPointerUp}
        >
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20" />

            {/* Pitch Markings */}
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0 opacity-50">
                <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#fff" strokeWidth="2" />
                <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#fff" strokeWidth="2" />
                <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#fff" strokeWidth="2" />
                <rect x="5%" y="25%" width="15%" height="50%" fill="none" stroke="#fff" strokeWidth="2" />
                <rect x="80%" y="25%" width="15%" height="50%" fill="none" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* DRAWING LAYER */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className={cn(
                "absolute inset-0 z-0 overflow-visible",
                isEraserMode ? "pointer-events-auto cursor-none" : "pointer-events-none" // Auto events only when erasing
            )}>
                {/* TACTICAL ZONES (Spatial) */}
                {zones.map(zone => (
                    <rect
                        key={zone.id}
                        x={zone.x - zone.width / 2}
                        y={zone.y - zone.height / 2}
                        width={zone.width}
                        height={zone.height}
                        fill={zone.color}
                        rx="2" ry="2"
                        className="animate-pulse" // Subtle pulse for emphasis
                    />
                ))}

                {/* OFFSIDE LINES */}
                {showOffsideLines && redOffsideX !== null && (
                    <line
                        x1={redOffsideX} y1={0}
                        x2={redOffsideX} y2={100}
                        stroke="white"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                        opacity="0.6"
                    />
                )}
                {showOffsideLines && blueOffsideX !== null && (
                    <line
                        x1={blueOffsideX} y1={0}
                        x2={blueOffsideX} y2={100}
                        stroke="white"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                        opacity="0.6"
                    />
                )}

                <defs>
                    <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                    </marker>
                    <marker id="arrowhead-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
                    </marker>
                    <marker id="arrowhead-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#fbbf24" />
                    </marker>
                    <marker id="arrowhead-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#22c55e" />
                    </marker>
                </defs>

                {lines.map(line => {
                    let markerId = ""
                    if (line.color.includes("red")) markerId = "url(#arrowhead-red)"
                    if (line.color.includes("blue")) markerId = "url(#arrowhead-blue)"
                    if (line.color.includes("yellow")) markerId = "url(#arrowhead-yellow)"
                    if (line.color.includes("green")) markerId = "url(#arrowhead-green)"

                    return (
                        <g key={line.id} className="group">
                            {/* HIT AREA (Thick invisible line for easier clicking) */}
                            <path
                                d={getPathString(line.points)}
                                stroke="transparent"
                                strokeWidth="5"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                                className={cn(
                                    isEraserMode ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                                )}
                                onClick={(e) => {
                                    if (isEraserMode) {
                                        e.stopPropagation()
                                        onLineRemove(line.id)
                                    }
                                }}
                            />
                            {/* VISIBLE LINE */}
                            <path
                                d={getPathString(line.points)}
                                stroke={line.color}
                                strokeWidth="1"
                                fill="none"
                                strokeDasharray={line.isDashed ? "2,2" : "none"}
                                markerEnd={markerId}
                                vectorEffect="non-scaling-stroke"
                                style={{ strokeWidth: "2px" }}
                                className={cn(
                                    "transition-opacity",
                                    isEraserMode && "group-hover:opacity-30" // Visual feedback for deletion
                                )}
                            />
                        </g>
                    )
                })}

                {/* CURRENT DRAWING */}
                {isDrawing && currentPoints.length > 0 && (
                    <path
                        d={getPathString(currentPoints)}
                        stroke={currentStyle.color}
                        strokeWidth="1"
                        fill="none"
                        strokeDasharray={currentStyle.isDashed ? "2,2" : "none"}
                        vectorEffect="non-scaling-stroke"
                        style={{ strokeWidth: "2px" }}
                        markerEnd="none"
                    />
                )}
            </svg>

            {/* BALL LAYER */}
            {ballPosition && (
                <div
                    onPointerDown={(e) => handleEntityPointerDown(e, 'ball')}
                    onPointerMove={(e) => handleEntityPointerMove(e, 'ball')}
                    onPointerUp={(e) => handleEntityPointerUp(e)}
                    className={cn(
                        "absolute w-3 h-3 bg-white rounded-full border border-black transition-shadow select-none z-20 shadow-[0_0_10px_white]",
                        isDrawingMode ? "pointer-events-none opacity-50" : "cursor-grab pointer-events-auto",
                        !isDrawingMode && "active:cursor-grabbing",
                        draggingId === 'ball' && "scale-125 z-50"
                    )}
                    style={{
                        left: `${ballPosition.x}%`,
                        top: `${ballPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        touchAction: 'none'
                    }}
                />
            )}

            {/* PLAYERS LAYER */}
            <div className="absolute inset-0 z-10 touch-none">
                {players.map((p) => {
                    const isDragging = draggingId === p.id
                    return (
                        <div
                            key={p.id}
                            onPointerDown={(e) => handleEntityPointerDown(e, p.id)}
                            onPointerMove={(e) => handleEntityPointerMove(e, p.id)}
                            onPointerUp={(e) => handleEntityPointerUp(e, p)}
                            className={cn(
                                "absolute w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-shadow select-none",
                                isDrawingMode ? "pointer-events-none opacity-50" : "cursor-grab pointer-events-auto",
                                !isDrawingMode && "active:cursor-grabbing",
                                p.team === 'red' ? "bg-red-600 border-red-400 text-white" : "bg-blue-600 border-blue-400 text-white",
                                // Active Tag Styling
                                p.tags.length > 0 && "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]",
                                selectedPlayerId === p.id && "ring-2 ring-white shadow-[0_0_15px_#fff] z-30 scale-110",
                                isDragging && "z-50 scale-110 cursor-grabbing"
                            )}
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                transform: 'translate(-50%, -50%)',
                                touchAction: 'none'
                            }}
                        >
                            {/* Status Dot with Dynamic Color */}
                            {p.tags.length > 0 && (
                                <div
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black shadow-sm"
                                    style={{
                                        backgroundColor: (() => {
                                            const tStr = p.tags.join(' ').toLowerCase()
                                            if (["run", "sprint", "attack", "前插", "跑位", "反击", "佯攻"].some(k => tStr.includes(k))) return '#ef4444' // Red
                                            if (["press", "mark", "逼抢", "压迫"].some(k => tStr.includes(k))) return '#f97316' // Orange
                                            if (["drop", "defend", "cover", "回撤", "防守"].some(k => tStr.includes(k))) return '#3b82f6' // Blue
                                            if (["support", "hold", "支援", "接应"].some(k => tStr.includes(k))) return '#eab308' // Yellow
                                            if (["space", "zone", "channel", "肋部", "口袋", "14区", "区域", "禁区", "边路"].some(k => tStr.includes(k))) return '#a855f7' // Purple
                                            return '#00ff41' // Default Green
                                        })()
                                    }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
