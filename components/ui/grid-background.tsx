"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

export function GridBackground({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("relative min-h-screen w-full bg-cyber-black bg-grid-pattern overflow-hidden", className)}>
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent pointer-events-none" />
            {children}
        </div>
    )
}
