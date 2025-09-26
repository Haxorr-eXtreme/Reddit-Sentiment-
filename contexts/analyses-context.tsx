"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type AnalysisType = "Single" | "Batch" | "Reddit" | "Twitter"

export interface Analysis {
  id: string
  text: string
  sentiment: number
  source: AnalysisType
  timestamp: Date
}

interface AnalysesContextType {
  recentAnalyses: Analysis[]
  addAnalysis: (analysis: Omit<Analysis, "id" | "timestamp">) => void
  clearAnalyses: () => void
}

const AnalysesContext = createContext<AnalysesContextType | undefined>(undefined)

export function AnalysesProvider({ children }: { children: React.ReactNode }) {
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])

  // Load analyses from localStorage on initial render
  useEffect(() => {
    const savedAnalyses = localStorage.getItem("recentAnalyses")
    if (savedAnalyses) {
      try {
        const parsed = JSON.parse(savedAnalyses)
        // Convert string timestamps back to Date objects
        const analyses = parsed.map((analysis: any) => ({
          ...analysis,
          timestamp: new Date(analysis.timestamp),
        }))
        setRecentAnalyses(analyses)
      } catch (error) {
        console.error("Failed to parse saved analyses:", error)
      }
    }
  }, [])

  // Save analyses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("recentAnalyses", JSON.stringify(recentAnalyses))
  }, [recentAnalyses])

  const addAnalysis = (analysis: Omit<Analysis, "id" | "timestamp">) => {
    const newAnalysis: Analysis = {
      ...analysis,
      id: window.crypto.randomUUID(),
      timestamp: new Date(),
    }

    setRecentAnalyses((prev) => {
      // Add new analysis to the beginning and limit to 10 items
      const updated = [newAnalysis, ...prev].slice(0, 10)
      return updated
    })
  }

  const clearAnalyses = () => {
    setRecentAnalyses([])
  }

  return (
    <AnalysesContext.Provider value={{ recentAnalyses, addAnalysis, clearAnalyses }}>
      {children}
    </AnalysesContext.Provider>
  )
}

export function useAnalyses() {
  const context = useContext(AnalysesContext)
  if (context === undefined) {
    throw new Error("useAnalyses must be used within an AnalysesProvider")
  }
  return context
}
