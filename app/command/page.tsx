"use client"

import * as React from "react"
import { RefreshCcw, MousePointer2, PenTool, Eraser, Globe, Minus, MoreHorizontal, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react"
import { cn } from "@/utils/cn"
import { Pitch2D, Player, TacticalLine, DrawingStyle, TacticalZone } from "@/components/tactical/Pitch2D"
import { TagLibrary } from "@/components/tactical/TagLibrary"
import { DataLogStream, LogicNode } from "@/components/tactical/DataLogStream"
import { getFormationPositions, FORMATION_OPTIONS } from "@/utils/formations"
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next"
import "@/utils/i18n"

// Initial Formation (4-4-2 Flat, constrained to own half)
const INITIAL_PLAYERS: Player[] = [
    // RED TEAM (Defending Left)
    { id: 'r1', team: 'red', number: 1, x: 5, y: 50, tags: [] }, // GK
    { id: 'r2', team: 'red', number: 2, x: 15, y: 15, tags: [] }, // LB
    { id: 'r3', team: 'red', number: 3, x: 15, y: 85, tags: [] }, // RB
    { id: 'r4', team: 'red', number: 4, x: 12, y: 38, tags: [] }, // CB
    { id: 'r5', team: 'red', number: 5, x: 12, y: 62, tags: [] }, // CB
    { id: 'r6', team: 'red', number: 6, x: 32, y: 15, tags: [] }, // LM
    { id: 'r7', team: 'red', number: 7, x: 32, y: 85, tags: [] }, // RM
    { id: 'r8', team: 'red', number: 8, x: 32, y: 38, tags: [] }, // CM
    { id: 'r9', team: 'red', number: 9, x: 32, y: 62, tags: [] }, // CM
    { id: 'r10', team: 'red', number: 10, x: 45, y: 38, tags: [] }, // ST
    { id: 'r11', team: 'red', number: 11, x: 45, y: 62, tags: [] }, // ST

    // BLUE TEAM (Defending Right) - Mirrored
    { id: 'b1', team: 'blue', number: 1, x: 95, y: 50, tags: [] }, // GK
    { id: 'b2', team: 'blue', number: 2, x: 85, y: 85, tags: [] }, // LB
    { id: 'b3', team: 'blue', number: 3, x: 85, y: 15, tags: [] }, // RB
    { id: 'b4', team: 'blue', number: 4, x: 88, y: 62, tags: [] }, // CB
    { id: 'b5', team: 'blue', number: 5, x: 88, y: 38, tags: [] }, // CB
    { id: 'b6', team: 'blue', number: 6, x: 68, y: 85, tags: [] }, // RM
    { id: 'b7', team: 'blue', number: 7, x: 68, y: 15, tags: [] }, // LM
    { id: 'b8', team: 'blue', number: 8, x: 68, y: 62, tags: [] }, // CM
    { id: 'b9', team: 'blue', number: 9, x: 68, y: 38, tags: [] }, // CM
    { id: 'b10', team: 'blue', number: 10, x: 55, y: 62, tags: [] }, // ST
    { id: 'b11', team: 'blue', number: 11, x: 55, y: 38, tags: [] }, // ST
]

export default function CommandPage() {
    // LAYOUT STATE
    const [videoUrl, setVideoUrl] = React.useState("")

    const { t, i18n } = useTranslation()

    // LOGIC STATE
    const [players, setPlayers] = React.useState<Player[]>(INITIAL_PLAYERS)
    const [ballPosition, setBallPosition] = React.useState<{ x: number, y: number }>({ x: 50, y: 50 })
    const [lines, setLines] = React.useState<TacticalLine[]>([])
    const [zones, setZones] = React.useState<TacticalZone[]>([])
    // Mode: 'move' | 'draw' | 'eraser'
    const [toolMode, setToolMode] = React.useState<'move' | 'draw' | 'eraser'>('move')
    const [showOffsideLines, setShowOffsideLines] = React.useState(true)

    // TEAM & FORMATION STATE
    const [redTeamName, setRedTeamName] = React.useState("")
    const [blueTeamName, setBlueTeamName] = React.useState("")
    const [redFormation, setRedFormation] = React.useState("4-4-2 (Flat)")
    const [blueFormation, setBlueFormation] = React.useState("4-4-2 (Flat)")
    // Panel Visibility State
    const [isFormationPanelOpen, setIsFormationPanelOpen] = React.useState(true)

    // DRAWING STYLE STATE
    const [currentStyle, setCurrentStyle] = React.useState<DrawingStyle>({
        color: '#fbbf24', // Default Yellow
        isDashed: true
    })

    const [savedNodes, setSavedNodes] = React.useState<LogicNode[]>([])
    const [logs, setLogs] = React.useState<string[]>([])

    // Initialize logs with translation
    React.useEffect(() => {
        setLogs([`> ${t('logs.system_init')}`])
    }, [t])

    // INTERACTION STATE
    const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null)
    const [isTagMenuOpen, setIsTagMenuOpen] = React.useState(false)

    // VIDEO REF
    const iframeRef = React.useRef<HTMLIFrameElement>(null)

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh' : 'en'
        i18n.changeLanguage(newLang)
    }

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false })
        setLogs(prev => [`> ${msg} [${time}]`, ...prev])
    }

    const handlePlayerMove = (id: string, x: number, y: number) => {
        // 1. Move Player & Clear Tags (Reset Status)
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, x, y, tags: [] } : p))

        // 2. Clear Tactical Lines linked to this player
        setLines(prev => prev.filter(line => line.ownerId !== id))

        // 3. Clear Tactical Zones linked to this player
        setZones(prev => prev.filter(zone => zone.ownerId !== id))
    }

    const handleBallMove = (x: number, y: number) => {
        setBallPosition({ x, y })
    }

    const handleLineCreate = (line: TacticalLine) => {
        setLines(prev => [...prev, line])
        addLog(`LINE DRAWN [${line.color}]`)
    }

    const handleLineRemove = (lineId: string) => {
        setLines(prev => prev.filter(l => l.id !== lineId))
        // addLog('LINE REMOVED') // Optional: reduce noise
    }

    const undoLastLine = React.useCallback(() => {
        setLines(prev => {
            if (prev.length === 0) return prev
            const newLines = [...prev]
            newLines.pop()
            addLog('UNDO DRAWING')
            return newLines
        })
    }, [])

    const clearLines = () => {
        setLines([])
        setZones([])
        addLog('ALL LINES & ZONES CLEARED')
    }

    // FORMATION HANDLER
    const applyFormation = (team: 'red' | 'blue', formation: string) => {
        if (!formation) return

        const positions = getFormationPositions(formation, team)
        if (positions.length === 0) return

        setPlayers(prev => {
            const newPlayers = JSON.parse(JSON.stringify(prev)) as Player[]
            // Filter team players, EXCLUDING GK (assuming GK is number 1)
            const teamPlayers = newPlayers.filter(p => p.team === team && p.number !== 1)

            // Expected 10 players. If counts match, assign sequentially.
            // Note: This relies on the order of players in INITIAL_PLAYERS being consistent (2,3,4,5,6...)
            teamPlayers.forEach((p, idx) => {
                if (positions[idx]) {
                    p.x = positions[idx].x
                    p.y = positions[idx].y
                }
            })
            return newPlayers
        })

        if (team === 'red') setRedFormation(formation)
        else setBlueFormation(formation)

        addLog(`FORMATION CHANGE [${team.toUpperCase()}]: ${formation}`)
    }

    // Keyboard Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault()
                undoLastLine()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undoLastLine])

    const handlePlayerSelect = (player: Player) => {
        setSelectedPlayer(player)
        setIsTagMenuOpen(true)
        addLog(t('logs.entity_select', { team: player.team.toUpperCase(), number: player.number }))
    }

    const handleAddTag = (tag: string, category: string) => {
        if (!selectedPlayer) return

        // 1. Update Player Tags
        setPlayers(prev => prev.map(p => {
            if (p.id === selectedPlayer.id) {
                // Prevent duplicate tags
                if (p.tags.includes(tag)) return p
                return { ...p, tags: [...p.tags, tag] }
            }
            return p
        }))

        // 2. Auto-Generate Tactical Logic
        let newLine: TacticalLine | null = null
        let newZone: TacticalZone | null = null

        const startX = selectedPlayer.x
        const startY = selectedPlayer.y
        const dir = selectedPlayer.team === 'red' ? 1 : -1
        const logicId = uuidv4()
        const lowerTag = tag.toLowerCase()

        // --- TACTICAL LINES (Movement) ---
        if (["run", "sprint", "attack", "前插", "跑位", "反击", "佯攻"].some(k => lowerTag.includes(k))) {
            newLine = {
                id: logicId,
                points: [{ x: startX, y: startY }, { x: startX + (15 * dir), y: startY }],
                color: '#ef4444',
                isDashed: false,
                ownerId: selectedPlayer.id
            }
        } else if (["press", "close", "逼抢", "压迫"].some(k => lowerTag.includes(k))) {
            newLine = {
                id: logicId,
                points: [{ x: startX, y: startY }, { x: startX + (8 * dir), y: startY + (5 * dir) }],
                color: '#f97316', // Orange
                isDashed: true,
                ownerId: selectedPlayer.id
            }
        } else if (["drop", "defend", "recover", "回撤", "防守"].some(k => lowerTag.includes(k))) {
            newLine = {
                id: logicId,
                points: [{ x: startX, y: startY }, { x: startX - (10 * dir), y: startY }],
                color: '#3b82f6',
                isDashed: true,
                ownerId: selectedPlayer.id
            }
        } else if (["support", "支援", "接应"].some(k => lowerTag.includes(k))) {
            newLine = {
                id: logicId,
                points: [{ x: startX, y: startY }, { x: startX + (5 * dir), y: startY + 5 }],
                color: '#eab308',
                isDashed: true,
                ownerId: selectedPlayer.id
            }
        } else if (["cut", "内切"].some(k => lowerTag.includes(k))) {
            newLine = {
                id: logicId,
                points: [{ x: startX, y: startY }, { x: startX + (10 * dir), y: 60 }],
                color: '#ef4444',
                isDashed: false,
                ownerId: selectedPlayer.id
            }
        }
        // --- TACTICAL ZONES (Spatial) ---
        else if (["half space", "channel", "肋部"].some(k => lowerTag.includes(k))) {
            // Half Space Zone (Vertical strip)
            newZone = {
                id: logicId,
                x: startX + (10 * dir),
                y: startY,
                width: 15,
                height: 30,
                color: 'rgba(168, 85, 247, 0.3)', // Purple transparent
                ownerId: selectedPlayer.id
            }
        } else if (["zone 14", "hole", "口袋", "14区"].some(k => lowerTag.includes(k))) {
            // Central Danger Zone
            newZone = {
                id: logicId,
                x: 50 + (25 * dir), // Edge of box typically
                y: 50,
                width: 20,
                height: 20,
                color: 'rgba(239, 68, 68, 0.3)', // Red transparent
                ownerId: selectedPlayer.id
            }
        } else if (["box", "area", "禁区"].some(k => lowerTag.includes(k))) {
            // Penalty Area
            newZone = {
                id: logicId,
                x: startX,
                y: startY,
                width: 20,
                height: 25,
                color: 'rgba(59, 130, 246, 0.3)', // Blue transparent
                ownerId: selectedPlayer.id
            }
        } else if (["flank", "wide", "边路"].some(k => lowerTag.includes(k))) {
            // Wide channel
            newZone = {
                id: logicId,
                x: startX,
                y: startY,
                width: 10,
                height: 40,
                color: 'rgba(234, 179, 8, 0.3)', // Yellow transparent
                ownerId: selectedPlayer.id
            }
        }

        if (newLine) {
            setLines(prev => [...prev, newLine!])
            addLog(`AUTO-LINE: ${tag} (${selectedPlayer.number})`)
        }
        if (newZone) {
            setZones(prev => [...prev, newZone!])
            addLog(`AUTO-ZONE: ${tag} (${selectedPlayer.number})`)
        }

        if (!newLine && !newZone) {
            addLog(t('logs.tag_attached', { tag, id: selectedPlayer.id }))
        }

        setIsTagMenuOpen(false)
        setSelectedPlayer(null)
    }

    const handleCommitLogic = () => {
        // Mock timestamp retrieval (would be from YouTube API)
        const mockTime = Math.floor(Math.random() * 5400) // 0-90 mins in seconds

        const newNode: LogicNode = {
            id: uuidv4(),
            timestamp: mockTime,
            label: `LOGIC_NODE_${savedNodes.length + 1}`,
            boardState: JSON.parse(JSON.stringify(players)),
            lineState: JSON.parse(JSON.stringify(lines))
        }

        setSavedNodes(prev => [...prev, newNode])
        addLog(t('logs.logic_committed', { id: newNode.id.substring(0, 6) }))
    }

    const handleRestoreNode = (node: LogicNode) => {
        setPlayers(node.boardState)
        setLines(node.lineState || [])
        addLog(t('logs.timeline_jump', { label: node.label }))
    }

    return (
        <div className="flex flex-col h-screen w-full bg-[#050505] text-[#ededed] font-mono overflow-hidden">

            {/* TOP SPLIT VIEW */}
            <div className="flex-1 flex min-h-0">

                {/* [THE_REALITY] - VIDEO WRAPPER */}
                <div className="w-1/2 border-r border-[#333] relative flex flex-col">
                    <div className="h-8 border-b border-[#333] flex items-center px-4 bg-[#0a0a0a]">
                        <span className="text-xs font-bold tracking-widest text-[#666]">{t('command.viewport_reality')}</span>
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={toggleLanguage}
                                className="mr-4 hover:text-[#00ff41] transition-colors flex items-center gap-1 text-[10px]"
                            >
                                <Globe size={10} />
                                {i18n.language === 'en' ? 'EN' : '中文'}
                            </button>

                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] text-red-500">{t('command.view_feed')}</span>
                        </div>
                    </div>

                    <div className="flex-1 bg-black relative p-8 flex items-center justify-center">
                        <div className="w-full aspect-video border border-[#333] shadow-[10px_10px_0px_#111]">
                            {videoUrl ? (
                                <iframe
                                    ref={iframeRef}
                                    src={videoUrl}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                    <input
                                        type="text"
                                        placeholder={t('header.input_placeholder')}
                                        className="bg-transparent border-b border-[#333] text-neon-green placeholder-[#444] text-center w-64 focus:outline-none focus:border-neon-green transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const url = e.currentTarget.value
                                                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                                                    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
                                                    setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`)
                                                } else if (url.includes("bilibili.com")) {
                                                    const bvid = url.match(/BV[a-zA-Z0-9]+/)?.[0]
                                                    if (bvid) setVideoUrl(`https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0`)
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* [THE_LOGIC] - 2D PITCH */}
                <div className="w-1/2 relative flex flex-col bg-[#081008] border-l border-[#333]">
                    <div className="h-8 border-b border-[#333] flex items-center px-4 bg-[#0a0a0a]">
                        <span className="text-xs font-bold tracking-widest text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)] mr-4">{t('command.viewport_logic')}</span>

                        {/* TOOLBAR */}
                        <div className="flex items-center gap-2 border-l border-[#333] pl-4">
                            <button
                                onClick={() => setToolMode('move')}
                                className={cn(
                                    "p-1 rounded flex items-center gap-1 text-[10px] transition-all",
                                    toolMode === 'move' ? "bg-neon-green text-black font-bold" : "text-[#666] hover:text-white"
                                )}
                            >
                                <MousePointer2 size={12} />
                                MOVE
                            </button>
                            <button
                                onClick={() => setToolMode('draw')}
                                className={cn(
                                    "p-1 rounded flex items-center gap-1 text-[10px] transition-all",
                                    toolMode === 'draw' ? "bg-[#ffdd00] text-black font-bold" : "text-[#666] hover:text-white"
                                )}
                            >
                                <PenTool size={12} />
                                DRAW
                            </button>
                            <button
                                onClick={() => setToolMode('eraser')}
                                className={cn(
                                    "p-1 rounded flex items-center gap-1 text-[10px] transition-all",
                                    toolMode === 'eraser' ? "bg-red-500 text-black font-bold" : "text-[#666] hover:text-white"
                                )}
                                title="Eraser Tool"
                            >
                                <Eraser size={12} />
                                ERASE
                            </button>

                            {/* TOGGLE OFFSIDE */}
                            <button
                                onClick={() => setShowOffsideLines(!showOffsideLines)}
                                className={cn(
                                    "p-1 rounded flex items-center gap-1 text-[10px] transition-all ml-2 border border-[#333]",
                                    showOffsideLines ? "bg-[#333] text-white" : "text-[#666] hover:text-white"
                                )}
                                title="Toggle Offside Lines"
                            >
                                {showOffsideLines ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>

                            {/* DRAWING OPTIONS (Only visible in Draw Mode) */}
                            {toolMode === 'draw' && (
                                <div className="flex items-center gap-2 ml-2 border-l border-[#333] pl-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                    {/* COLOR PICKER */}
                                    <div className="flex gap-1">
                                        {[
                                            { c: '#ef4444', label: 'Red' },    // Attack
                                            { c: '#3b82f6', label: 'Blue' },   // Defense
                                            { c: '#fbbf24', label: 'Yellow' }, // Movement
                                            { c: '#22c55e', label: 'Green' }   // Logic
                                        ].map((opt) => (
                                            <button
                                                key={opt.c}
                                                onClick={() => setCurrentStyle(prev => ({ ...prev, color: opt.c }))}
                                                className={cn(
                                                    "w-3 h-3 rounded-full hover:scale-125 transition-all border border-transparent",
                                                    currentStyle.color === opt.c && "ring-1 ring-white scale-110"
                                                )}
                                                style={{ backgroundColor: opt.c }}
                                                title={opt.label}
                                            />
                                        ))}
                                    </div>

                                    {/* STYLE TOGGLE */}
                                    <button
                                        onClick={() => setCurrentStyle(prev => ({ ...prev, isDashed: !prev.isDashed }))}
                                        className="text-[#666] hover:text-white ml-2 flex items-center gap-1"
                                        title={currentStyle.isDashed ? "Dashed Line" : "Solid Line"}
                                    >
                                        {currentStyle.isDashed ? <MoreHorizontal size={14} /> : <Minus size={14} />}
                                    </button>
                                </div>
                            )}

                            {lines.length > 0 && toolMode !== 'eraser' && (
                                <button
                                    onClick={clearLines}
                                    className="ml-2 hover:text-red-500 transition-colors"
                                    title="Clear All Lines"
                                >
                                    <Eraser size={12} className="opacity-50" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setPlayers(INITIAL_PLAYERS)
                                setLines([])
                                setZones([])
                                setBallPosition({ x: 50, y: 50 })
                            }}
                            className="ml-auto hover:text-[#00ff41] transition-colors"
                            title={t('command.reset_pitch')}
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <div className="flex-1 relative bg-[#050a05] flex items-center justify-center overflow-hidden">

                        {/* CENTER: PITCH */}
                        <div className="w-full aspect-video relative shadow-[10px_10px_0px_rgba(0,255,65,0.1)] flex-shrink-0 z-0">
                            <Pitch2D
                                players={players}
                                lines={lines}
                                zones={zones}
                                ballPosition={ballPosition}
                                isDrawingMode={toolMode === 'draw'}
                                isEraserMode={toolMode === 'eraser'}
                                showOffsideLines={showOffsideLines}
                                currentStyle={currentStyle}
                                onPlayerMove={handlePlayerMove}
                                onBallMove={handleBallMove}
                                onPlayerSelect={handlePlayerSelect}
                                onLineCreate={handleLineCreate}
                                onLineRemove={handleLineRemove}
                                selectedPlayerId={selectedPlayer?.id}
                            />

                            {/* Floating Tag Menu */}
                            {isTagMenuOpen && selectedPlayer && (
                                <>
                                    {/* Overlay to close */}
                                    <div
                                        className="absolute inset-0 z-40 bg-black/20"
                                        onClick={() => {
                                            setIsTagMenuOpen(false)
                                            setSelectedPlayer(null)
                                        }}
                                    />
                                    <TagLibrary
                                        isVisible={isTagMenuOpen}
                                        onClose={() => {
                                            setIsTagMenuOpen(false)
                                            setSelectedPlayer(null)
                                        }}
                                        onSelectTag={handleAddTag}
                                        position={{ x: 50, y: 50 }}
                                    />
                                </>
                            )}
                        </div>

                        {/* ABSOLUTE BOTTOM: FORMATION CONTROL PANEL */}
                        <div className={cn(
                            "absolute bottom-0 left-0 right-0 border-t border-[#333] bg-[#0a150a]/90 backdrop-blur-md z-20 transition-transform duration-300",
                            isFormationPanelOpen ? "translate-y-0" : "translate-y-[calc(100%-24px)]"
                        )}>
                            {/* Toggle Handle */}
                            <div
                                className="h-6 flex items-center justify-center cursor-pointer hover:bg-[#111] transition-colors"
                                onClick={() => setIsFormationPanelOpen(!isFormationPanelOpen)}
                            >
                                {isFormationPanelOpen ? <ChevronDown size={14} className="text-[#666]" /> : <ChevronUp size={14} className="text-[#666]" />}
                            </div>

                            <div className="w-full flex justify-between gap-4 px-4 pb-4">
                                {/* LEFT: RED TEAM */}
                                <div className="flex flex-col gap-2 w-1/3">
                                    <input
                                        type="text"
                                        value={redTeamName}
                                        onChange={(e) => setRedTeamName(e.target.value)}
                                        placeholder={t('command.red_team_name')}
                                        className="bg-transparent text-red-500 font-bold border-b border-red-900/50 focus:border-red-500 outline-none px-1 py-1 placeholder-red-900/50 text-sm"
                                    />
                                    <select
                                        value={redFormation}
                                        onChange={(e) => applyFormation('red', e.target.value)}
                                        className="bg-[#050a05] border border-[#333] text-[#888] text-xs p-2 rounded focus:border-red-500 outline-none"
                                    >
                                        <option value="" disabled>Select Formation...</option>
                                        {FORMATION_OPTIONS.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                        <option value="custom">Custom...</option>
                                    </select>
                                </div>

                                {/* RIGHT: BLUE TEAM */}
                                <div className="flex flex-col gap-2 w-1/3 items-end">
                                    <input
                                        type="text"
                                        value={blueTeamName}
                                        onChange={(e) => setBlueTeamName(e.target.value)}
                                        placeholder={t('command.blue_team_name')}
                                        className="bg-transparent text-blue-500 font-bold border-b border-blue-900/50 focus:border-blue-500 outline-none px-1 py-1 placeholder-blue-900/50 text-right text-sm w-full"
                                    />
                                    <select
                                        value={blueFormation}
                                        onChange={(e) => applyFormation('blue', e.target.value)}
                                        className="bg-[#050a05] border border-[#333] text-[#888] text-xs p-2 rounded focus:border-blue-500 outline-none w-full text-right"
                                        dir="rtl"
                                    >
                                        <option value="" disabled>Select Formation...</option>
                                        {FORMATION_OPTIONS.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                        <option value="custom">Custom...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM DATA STREAM */}
            <DataLogStream
                logs={logs}
                savedNodes={savedNodes}
                onRestoreNode={handleRestoreNode}
                onCommitLogic={handleCommitLogic}
            />

        </div>
    )
}
