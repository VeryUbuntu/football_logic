"use client"

import * as React from "react"
import { Play, Pause, Circle, ArrowRight, X, Maximize, Save, Layers, Terminal, Globe } from "lucide-react"
import { cn } from "@/utils/cn"
import { useTranslation } from "react-i18next"
import "@/utils/i18n"

export default function AnalysisPage() {
    const [videoUrl, setVideoUrl] = React.useState("")
    const [embedUrl, setEmbedUrl] = React.useState<string | null>(null)
    const [isAnalysisMode, setIsAnalysisMode] = React.useState(false)
    const [tool, setTool] = React.useState<'brush' | 'arrow' | 'circle'>('brush')
    const [logs, setLogs] = React.useState<string[]>([])

    // Canvas Refs
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [isDrawing, setIsDrawing] = React.useState(false)
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })

    const { t, i18n } = useTranslation()

    // Auto-focus logic for immersion
    React.useEffect(() => {
        addLog(t('logs.system_ready'))
    }, [])

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLogs(prev => [`> ${message} @ ${timestamp}`, ...prev].slice(0, 50))
    }

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh' : 'en'
        i18n.changeLanguage(newLang)
    }

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoUrl) return

        let finalUrl = ""
        // Simple logic to detect Youtube or Bilibili
        if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
            const videoId = videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("/").pop()
            finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`
            addLog(t('logs.source_detected', { type: 'YOUTUBE', id: videoId }))
        } else if (videoUrl.includes("bilibili.com")) {
            const bvid = videoUrl.match(/BV[a-zA-Z0-9]+/)?.[0]
            if (bvid) {
                finalUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&danmaku=0`
                addLog(t('logs.source_detected', { type: 'BILIBILI', id: bvid }))
            }
        }

        if (finalUrl) {
            setEmbedUrl(finalUrl)
            addLog(t('logs.stream_linked'))
        } else {
            addLog(t('logs.invalid_source'))
        }
    }

    const toggleAnalysis = () => {
        setIsAnalysisMode(!isAnalysisMode)
        if (!isAnalysisMode) {
            addLog(t('logs.mode_switch_on'))
        } else {
            addLog(t('logs.mode_switch_off'))
            clearCanvas()
        }
    }

    // Canvas Logic
    const startDrawing = (e: React.MouseEvent) => {
        if (!isAnalysisMode) return
        const canvas = canvasRef.current
        if (!canvas) return

        setIsDrawing(true)
        const rect = canvas.getBoundingClientRect()
        setStartPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !isAnalysisMode) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        if (tool === 'brush') {
            ctx.strokeStyle = '#00ff41'
            ctx.lineWidth = 3
            ctx.shadowBlur = 10
            ctx.shadowColor = '#00ff41'
            ctx.lineCap = 'round'

            ctx.beginPath()
            ctx.moveTo(startPos.x, startPos.y)
            ctx.lineTo(currentX, currentY)
            ctx.stroke()

            setStartPos({ x: currentX, y: currentY })
        }
    }

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false)
            if (tool === 'brush') addLog(t('logs.freehand_path'))
        }
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            addLog(t('logs.canvas_wipe'))
        }
    }

    const handleResize = () => {
        if (containerRef.current && canvasRef.current) {
            canvasRef.current.width = containerRef.current.clientWidth
            canvasRef.current.height = containerRef.current.clientHeight
        }
    }

    React.useEffect(() => {
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [embedUrl]) // Resize when video loads

    return (
        <div className="flex h-screen w-full bg-cyber-black text-neon font-mono overflow-hidden">

            {/* LEFT SIDEBAR / MANIFESTO */}
            <div className="w-64 border-r border-[#333] p-6 flex flex-col justify-between hidden md:flex">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter text-white whitespace-pre-line">
                        {t('system_manifesto.title')}
                    </h1>
                    <div className="text-xs text-neon/70 mb-12 animate-pulse whitespace-pre-line">
                        {t('system_manifesto.subtitle')}
                    </div>

                    <div className="text-[10px] text-[#666] mb-8">
                        VER: 4.0.0 ● LIVE_FEED
                    </div>

                    <nav className="space-y-6 text-sm">
                        <div className="group cursor-pointer flex items-center gap-2 hover:text-white transition-colors">
                            <span className="text-xs">[01]</span> {t('nav.archives')}
                        </div>
                        <div className="group cursor-pointer flex items-center gap-2 hover:text-white transition-colors">
                            <span className="text-xs">[02]</span> {t('nav.protocols')}
                        </div>
                        <div className="group cursor-pointer flex items-center gap-2 hover:text-white transition-colors">
                            <span className="text-xs">[03]</span> {t('nav.nodes')}
                        </div>
                    </nav>
                </div>

                <div className="space-y-2 text-[10px] text-[#666]">
                    <div className="flex justify-between">
                        <span>CPU_LOAD</span>
                        <span className="text-neon">12%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>MEMORY</span>
                        <span className="text-neon">402MB</span>
                    </div>
                    <button
                        onClick={toggleLanguage}
                        className="w-full mt-4 border border-[#333] hover:bg-neon-green hover:text-black transition-colors py-1 flex items-center justify-center gap-2"
                    >
                        <Globe size={12} />
                        {i18n.language === 'en' ? 'LANG: EN' : '语言: 中文'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col relative">

                {/* HEADER / CONTROLS */}
                <header className="h-16 border-b border-[#333] flex items-center px-6 justify-between bg-cyber-gray/20">
                    <div className="flex items-center gap-4 w-full max-w-2xl">
                        <span className="text-xs text-[#666] whitespace-nowrap">{t('header.input_label')}</span>
                        <form onSubmit={handleUrlSubmit} className="flex-1">
                            <input
                                type="text"
                                placeholder={t('header.input_placeholder')}
                                className="w-full bg-transparent border-b border-[#333] text-neon placeholder-[#444] text-sm py-1 focus:outline-none focus:border-neon transition-colors"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                            />
                        </form>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={toggleAnalysis}
                            className={cn(
                                "px-4 py-1 text-xs border transition-all duration-300 hover:shadow-[0_0_15px_var(--neon-green)] hover:text-black hover:bg-neon-green flex items-center gap-2 uppercase font-bold tracking-wider",
                                isAnalysisMode ? "bg-neon-green text-black border-neon-green" : "border-[#333] text-[#666]"
                            )}
                        >
                            {isAnalysisMode ? <Pause size={14} /> : <Play size={14} />}
                            {isAnalysisMode ? t('header.freeze_btn') : t('header.resume_btn')}
                        </button>
                    </div>
                </header>

                {/* MAIN VIEWPORT (THE MONOLITH) */}
                <main className="flex-1 p-8 grid place-items-center relative bg-[url('/grid.svg')]">
                    <div
                        ref={containerRef}
                        className={cn(
                            "relative aspect-video w-full max-w-5xl bg-black border border-[#333] transition-all duration-500",
                            embedUrl ? "shadow-[20px_20px_0px_var(--neon-green)] border-neon-green" : "opacity-50"
                        )}
                    >
                        {embedUrl ? (
                            <>
                                <iframe
                                    src={embedUrl}
                                    className={cn("w-full h-full object-cover", isAnalysisMode && "pointer-events-none opacity-80 grayscale")}
                                    allow="autoplay; encrypted-media"
                                />
                                {isAnalysisMode && (
                                    <div className="absolute inset-0 z-20 cursor-crosshair">
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            className="w-full h-full"
                                        />
                                        {/* Canvas Toolbar Overlay */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 border border-[#333] p-2 flex gap-2 backdrop-blur-sm">
                                            <button
                                                onClick={() => setTool('brush')}
                                                className={cn("p-2 hover:bg-neon-green/20", tool === 'brush' && "text-neon bg-neon-green/10")}
                                            >
                                                <Layers size={18} />
                                            </button>
                                            <button
                                                onClick={() => setTool('arrow')}
                                                className={cn("p-2 hover:bg-neon-green/20", tool === 'arrow' && "text-neon bg-neon-green/10")}
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                            <button
                                                onClick={() => setTool('circle')}
                                                className={cn("p-2 hover:bg-neon-green/20", tool === 'circle' && "text-neon bg-neon-green/10")}
                                            >
                                                <Circle size={18} />
                                            </button>
                                            <div className="w-px bg-[#333] mx-1" />
                                            <button
                                                onClick={clearCanvas}
                                                className="p-2 hover:text-red-500 hover:bg-red-500/10 text-[#666]"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-[#444] animate-pulse">
                                <Maximize size={48} className="mb-4 opacity-50" />
                                <span className="text-xl font-bold tracking-[0.2em]">{t('monolith.awaiting_signal')}</span>
                            </div>
                        )}
                    </div>
                </main>

            </div>

            {/* RIGHT SIDEBAR / DATA STREAM */}
            <div className="w-80 border-l border-[#333] flex flex-col bg-[#050505]">
                <div className="h-16 border-b border-[#333] flex items-center px-4 font-bold text-sm tracking-wider">
                    {t('sidebar.data_stream')}
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 scrollbar-hide">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[#666] border-l-2 border-transparent hover:border-neon-green hover:text-neon pl-2 py-1 transition-all cursor-default break-words">
                            {log}
                        </div>
                    ))}
                    <div className="text-neon animate-flicker">_</div>
                </div>

                <div className="h-64 border-t border-[#333] p-4 flex flex-col gap-2">
                    <div className="text-xs text-[#444] mb-2 uppercase tracking-wider">{t('sidebar.tactical_tools')}</div>
                    <button className="flex items-center gap-3 w-full p-3 border border-[#333] text-sm hover:bg-white hover:text-black transition-all group">
                        <Save size={16} />
                        <span>{t('sidebar.save_frame')}</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 border border-[#333] text-sm hover:bg-neon-green hover:text-black transition-all group">
                        <Terminal size={16} />
                        <span>{t('sidebar.export_json')}</span>
                    </button>
                </div>
            </div>

        </div>
    )
}
