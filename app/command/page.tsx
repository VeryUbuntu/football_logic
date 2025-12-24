"use client"

import * as React from "react"
import { Play, Pause, RefreshCcw } from "lucide-react"
import { cn } from "@/utils/cn"
import { Pitch2D, Player } from "@/components/tactical/Pitch2D"
import { TagLibrary } from "@/components/tactical/TagLibrary"
import { DataLogStream, LogicNode } from "@/components/tactical/DataLogStream"
import { v4 as uuidv4 } from 'uuid';

// Initial Formation (Horizontal Pitch: Red is LEFT, Blue is RIGHT)
const INITIAL_PLAYERS: Player[] = [
    // RED TEAM (Defending Left) -> GK at x~5%
    { id: 'r1', team: 'red', number: 1, x: 5, y: 50, tags: [] }, // GK
    { id: 'r2', team: 'red', number: 2, x: 20, y: 15, tags: [] }, // LB
    { id: 'r3', team: 'red', number: 3, x: 20, y: 85, tags: [] }, // RB
    { id: 'r4', team: 'red', number: 4, x: 18, y: 38, tags: [] }, // CB
    { id: 'r5', team: 'red', number: 5, x: 18, y: 62, tags: [] }, // CB
    { id: 'r6', team: 'red', number: 6, x: 35, y: 50, tags: [] }, // DM
    { id: 'r7', team: 'red', number: 7, x: 60, y: 15, tags: [] }, // LW
    { id: 'r8', team: 'red', number: 8, x: 45, y: 35, tags: [] }, // CM
    { id: 'r9', team: 'red', number: 9, x: 65, y: 50, tags: [] }, // ST
    { id: 'r10', team: 'red', number: 10, x: 45, y: 65, tags: [] }, // CM
    { id: 'r11', team: 'red', number: 11, x: 60, y: 85, tags: [] }, // RW

    // BLUE TEAM (Defending Right) -> GK at x~95%
    { id: 'b1', team: 'blue', number: 1, x: 95, y: 50, tags: [] }, // GK
    { id: 'b2', team: 'blue', number: 2, x: 80, y: 85, tags: [] }, // LB
    { id: 'b3', team: 'blue', number: 3, x: 80, y: 15, tags: [] }, // RB
    { id: 'b4', team: 'blue', number: 4, x: 82, y: 62, tags: [] }, // CB
    { id: 'b5', team: 'blue', number: 5, x: 82, y: 38, tags: [] }, // CB
    { id: 'b6', team: 'blue', number: 6, x: 65, y: 50, tags: [] }, // DM
    { id: 'b7', team: 'blue', number: 7, x: 40, y: 85, tags: [] }, // LW
    { id: 'b8', team: 'blue', number: 8, x: 55, y: 65, tags: [] }, // CM
    { id: 'b9', team: 'blue', number: 9, x: 35, y: 50, tags: [] }, // ST
    { id: 'b10', team: 'blue', number: 10, x: 55, y: 35, tags: [] }, // CM
    { id: 'b11', team: 'blue', number: 11, x: 40, y: 15, tags: [] }, // RW
]

import { useTranslation } from "react-i18next"
import "@/utils/i18n"
import { Globe } from "lucide-react"

export default function CommandPage() {
    // LAYOUT STATE
    const [videoUrl, setVideoUrl] = React.useState("")

    const { t, i18n } = useTranslation()

    // LOGIC STATE
    const [players, setPlayers] = React.useState<Player[]>(INITIAL_PLAYERS)
    const [savedNodes, setSavedNodes] = React.useState<LogicNode[]>([])
    const [logs, setLogs] = React.useState<string[]>([])

    // Initialize logs with translation
    React.useEffect(() => {
        setLogs([`> ${t('logs.system_init')}`])
    }, [t])

    // INTERACTION STATE
    const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null)
    const [isTagMenuOpen, setIsTagMenuOpen] = React.useState(false)

    // VIDEO REF (Mock for now, would need Youtube API for real timestamp)
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
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, x, y } : p))
    }

    const handlePlayerSelect = (player: Player) => {
        setSelectedPlayer(player)
        setIsTagMenuOpen(true)
        addLog(t('logs.entity_select', { team: player.team.toUpperCase(), number: player.number }))
    }

    const handleAddTag = (tag: string, category: string) => {
        if (!selectedPlayer) return

        setPlayers(prev => prev.map(p => {
            if (p.id === selectedPlayer.id) {
                // Prevent duplicate tags
                if (p.tags.includes(tag)) return p
                return { ...p, tags: [...p.tags, tag] }
            }
            return p
        }))

        addLog(t('logs.tag_attached', { tag, id: selectedPlayer.id }))
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
            boardState: JSON.parse(JSON.stringify(players)) // Deep copy
        }

        setSavedNodes(prev => [...prev, newNode])
        addLog(t('logs.logic_committed', { id: newNode.id.substring(0, 6) }))
    }

    const handleRestoreNode = (node: LogicNode) => {
        setPlayers(node.boardState)
        addLog(t('logs.timeline_jump', { label: node.label }))
        // ideally jump video here too
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
                        <span className="text-xs font-bold tracking-widest text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]">{t('command.viewport_logic')}</span>
                        <button
                            onClick={() => setPlayers(INITIAL_PLAYERS)}
                            className="ml-auto hover:text-[#00ff41] transition-colors"
                            title={t('command.reset_pitch')}
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <div className="flex-1 relative p-8 flex items-center justify-center bg-[#050a05]">
                        {/* Aspect Ratio Container for Pitch */}
                        <div className="w-full aspect-video relative shadow-[10px_10px_0px_rgba(0,255,65,0.1)]">
                            <Pitch2D
                                players={players}
                                onPlayerMove={handlePlayerMove}
                                onPlayerSelect={handlePlayerSelect}
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
