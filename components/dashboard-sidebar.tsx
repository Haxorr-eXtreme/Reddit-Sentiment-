"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, Home, Info, MessageSquare, Twitter, FileSpreadsheet } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-6 w-6" />
          <span>Sentiment Analysis</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/single-analysis"}>
              <Link href="/single-analysis">
                <FileText className="h-4 w-4" />
                <span>Single Analysis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/batch-analysis"}>
              <Link href="/batch-analysis">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Batch Analysis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/reddit-analysis"}>
              <Link href="/reddit-analysis">
                <MessageSquare className="h-4 w-4" />
                <span>Reddit Analysis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/twitter-analysis"}>
              <Link href="/twitter-analysis">
                <Twitter className="h-4 w-4" />
                <span>Twitter Analysis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/about"}>
              <Link href="/about">
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Powered by BERT Model</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
