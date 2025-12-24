"use client"

import * as React from "react"
import type { Player } from "./Pitch2D"
import { cn } from "@/utils/cn"

export type LogicNode = {
    id: string
    timestamp: number // seconds in video
    label: string
    boardState: Player[]
}

interface DataLogStreamProps {
    logs: string[]
    savedNodes: LogicNode[]
    onRestoreNode: (node: LogicNode) => void
    onCommitLogic: () => void
}

import { useTranslation } from "react-i18next"
import "@/utils/i18n"

export function DataLogStream({ logs, savedNodes, onRestoreNode, onCommitLogic }: DataLogStreamProps) {
    const { t } = useTranslation()

    return (
        <div className="h-64 border-t border-[#333] bg-[#050505] flex font-mono text-xs overflow-hidden">
            {/* LEFT: BUTTONS & METADATA */}
            <div className="w-48 border-r border-[#333] p-4 flex flex-col gap-2">
                <button
                    onClick={onCommitLogic}
                    className="w-full py-2 bg-neon-green/10 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                >
                    {t('command.commit_logic')}
                </button>
                <div className="text-[#444] mt-2">
                    {t('command.nodes_saved')}: {savedNodes.length}
                </div>
            </div>

            {/* CENTER: SAVED NODES (Horizontal Scroll) */}
            <div className="flex-1 border-r border-[#333] p-4 flex gap-4 overflow-x-auto overflow-y-hidden items-center scrollbar-hide">
                {savedNodes.length === 0 && (
                    <div className="text-[#333] italic">{t('command.no_logic')}</div>
                )}
                {savedNodes.map(node => (
                    <button
                        key={node.id}
                        onClick={() => onRestoreNode(node)}
                        className="flex flex-col items-start p-3 border border-[#333] min-w-[120px] bg-[#0a0a0a] hover:border-neon-green hover:shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all group h-full relative"
                    >
                        {/* Connector Line decoration */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-px h-4 bg-[#333] group-hover:bg-neon-green" />

                        <div className="font-bold text-white mb-1">{node.label}</div>
                        <div className="text-[#666] group-hover:text-neon-green">@ {new Date(node.timestamp * 1000).toISOString().substr(14, 5)}</div>
                        <div className="mt-auto text-[10px] text-[#444] border-t border-[#333] pt-1 w-full text-left">
                            {t('command.state_entities', { count: node.boardState.length })}
                        </div>
                    </button>
                ))}
            </div>

            {/* RIGHT: RAW LOGS */}
            <div className="w-1/3 p-4 overflow-y-auto font-mono text-[10px] space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="text-[#666] border-l border-transparent pl-2 hover:text-white cursor-default">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    )
}
