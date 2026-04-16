"use client"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

type DashboardLayoutProps = {
    children: ReactNode
}



function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()

    return (
        <main className="min-h-screen flex  bg-red-500">
            <aside className="bg-green-500 w-64 h-screen"></aside>
            <div className="flex-1 "></div>
        </main>
    )
}

export default DashboardLayout