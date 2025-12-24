"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

export type Player = {
    id: string
    team: 'red' | 'blue'
    x: number // percentage 0-100
    y: number // percentage 0-100
    number: number
    tags: string[]
}

interface Pitch2DProps {
    players: Player[]
    onPlayerMove: (id: string, x: number, y: number) => void
    onPlayerSelect: (leader: Player) => void
    selectedPlayerId?: string | null
}

export function Pitch2D({ players, onPlayerMove, onPlayerSelect, selectedPlayerId }: Pitch2DProps) {
    const pitchRef = React.useRef<HTMLDivElement>(null)

    // State to track dragging internally for smoothness
    const [draggingId, setDraggingId] = React.useState<string | null>(null)
    const [dragStartPos, setDragStartPos] = React.useState<{ x: number, y: number } | null>(null)

    const handlePointerDown = (e: React.PointerEvent, player: Player) => {
        e.stopPropagation()
        e.preventDefault()
        setDraggingId(player.id)
        setDragStartPos({ x: e.clientX, y: e.clientY })

        // Capture pointer to ensure we track movement even if mouse leaves the dot
        const target = e.target as Element
        if (target.setPointerCapture) {
            target.setPointerCapture(e.pointerId)
        }
    }

    const handlePointerMove = (e: React.PointerEvent, player: Player) => {
        if (draggingId !== player.id || !pitchRef.current) return
        e.preventDefault()

        const rect = pitchRef.current.getBoundingClientRect()

        // Calculate new position
        // We subtract the rect position from the pointer position to get local coordinates
        let xPercent = ((e.clientX - rect.left) / rect.width) * 100
        let yPercent = ((e.clientY - rect.top) / rect.height) * 100

        // Clamp to 0-100
        xPercent = Math.min(100, Math.max(0, xPercent))
        yPercent = Math.min(100, Math.max(0, yPercent))

        onPlayerMove(player.id, xPercent, yPercent)
    }

    const handlePointerUp = (e: React.PointerEvent, player: Player) => {
        // Check for click vs drag
        if (dragStartPos) {
            const dist = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.x, 2) +
                Math.pow(e.clientY - dragStartPos.y, 2)
            )
            // If movement is small (< 5px), treat as click
            if (dist < 5) {
                onPlayerSelect(player)
            }
        }

        setDraggingId(null)
        setDragStartPos(null)
        // Release capture
        const target = e.target as Element
        if (target.releasePointerCapture) {
            target.releasePointerCapture(e.pointerId)
        }
    }

    return (
        <div className="w-full h-full bg-[#0a200a] border-2 border-[#00ff41] relative overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20" />

            {/* Pitch Markings (SVG) */}
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0 opacity-50">
                {/* Outer Boundary */}
                <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#fff" strokeWidth="2" />
                {/* Center Line */}
                <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#fff" strokeWidth="2" />
                {/* Center Circle */}
                <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#fff" strokeWidth="2" />
                {/* Penalty Areas */}
                <rect x="5%" y="25%" width="15%" height="50%" fill="none" stroke="#fff" strokeWidth="2" />
                <rect x="80%" y="25%" width="15%" height="50%" fill="none" stroke="#fff" strokeWidth="2" />
            </svg>

            {/* Players Area */}
            {/* We attach visual logic directly here. No Framer Motion drag engine needed. */}
            <div ref={pitchRef} className="absolute inset-0 z-10 touch-none">
                {players.map((p) => {
                    const isDragging = draggingId === p.id
                    return (
                        <div
                            key={p.id}
                            onPointerDown={(e) => handlePointerDown(e, p)}
                            onPointerMove={(e) => handlePointerMove(e, p)}
                            onPointerUp={(e) => handlePointerUp(e, p)}
                            // Important: touch-action none prevents scrolling on mobile/tablets while dragging
                            className={cn(
                                "absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-grab border-2 transition-shadow select-none",
                                "active:cursor-grabbing",
                                p.team === 'red' ? "bg-red-600 border-red-400 text-white" : "bg-blue-600 border-blue-400 text-white",
                                selectedPlayerId === p.id && "ring-2 ring-white shadow-[0_0_15px_#fff] z-30 scale-110",
                                isDragging && "z-50 scale-110 cursor-grabbing"
                            )}
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                transform: 'translate(-50%, -50%)', // Centering trick
                                touchAction: 'none' // Critical for browser handling
                            }}
                        >
                            {p.number}
                            {p.tags.length > 0 && (
                                <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#00ff41] rounded-full border border-black" />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
