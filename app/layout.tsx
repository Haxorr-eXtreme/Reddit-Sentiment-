import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AnalysesProvider } from "@/contexts/analyses-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sentiment Analysis Dashboard",
  description: "Advanced sentiment analysis using BERT model",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AnalysesProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </AnalysesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
