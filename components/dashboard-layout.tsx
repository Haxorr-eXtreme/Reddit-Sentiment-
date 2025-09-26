"use client"

import type React from "react"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
