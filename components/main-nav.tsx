"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/single-analysis"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/single-analysis" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Single Analysis
      </Link>
      <Link
        href="/batch-analysis"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/batch-analysis" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Batch Analysis
      </Link>
    </nav>
  )
}
