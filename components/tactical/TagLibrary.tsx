"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/utils/cn"
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"
import "@/utils/i18n"

export const DEFAULT_TAGS = {
    strategic: ["高位逼抢", "低位防守", "快速反击", "组织进攻"],
    spatial: ["肋部空间", "局部过载", "接球口袋", "边路通道"],
    action: ["关键传球", "拦截", "佯攻跑位", "1v1对抗", "前插跑动", "回撤接应", "压迫", "支援"]
}

interface TagLibraryProps {
    isVisible: boolean
    onClose: () => void
    onSelectTag: (tag: string, category: 'strategic' | 'spatial' | 'action') => void
    position: { x: number, y: number } // Percentage position roughly
}

export function TagLibrary({ isVisible, onClose, onSelectTag, position }: TagLibraryProps) {
    if (!isVisible) return null

    const { t } = useTranslation()

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-50 w-64 bg-black/90 border border-[#00ff41] shadow-[10px_10px_0px_#00ff41] p-4 text-xs font-mono backdrop-blur-md"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)', // Centered for now, ideally relative to player
                    // In a real app we'd use a portal or precise positioning
                }}
            >
                <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                    <span className="text-[#00ff41] font-bold">{t('tags.library_title')}</span>
                    <button onClick={onClose} className="hover:text-red-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                    <div>
                        <div className="text-[#666] mb-2 font-bold">{t('tags.strategic')}</div>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_TAGS.strategic.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onSelectTag(tag, 'strategic')}
                                    className="px-2 py-1 border border-[#333] hover:bg-[#00ff41] hover:text-black transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[#666] mb-2 font-bold">{t('tags.spatial')}</div>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_TAGS.spatial.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onSelectTag(tag, 'spatial')}
                                    className="px-2 py-1 border border-[#333] hover:bg-blue-400 hover:text-black transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[#666] mb-2 font-bold">{t('tags.action')}</div>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_TAGS.action.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onSelectTag(tag, 'action')}
                                    className="px-2 py-1 border border-[#333] hover:bg-red-500 hover:text-white transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
