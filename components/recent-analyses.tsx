"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAnalyses } from "@/contexts/analyses-context"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

const SENTIMENT_LABELS = ["Negative", "Neutral", "Positive", "Irrelevant"]

const getSentimentColor = (sentiment: number) => {
  switch (sentiment) {
    case 0: // Negative
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case 1: // Neutral
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case 2: // Positive
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case 3: // Irrelevant
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Format the timestamp to a relative time string (e.g., "2 hours ago")
const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
}

export function RecentAnalyses() {
  const { recentAnalyses, clearAnalyses } = useAnalyses()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>Your most recent sentiment analyses</CardDescription>
        </div>
        {recentAnalyses.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAnalyses}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {recentAnalyses.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No recent analyses yet. Try analyzing some text!
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{analysis.source}</Badge>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(analysis.timestamp)}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{analysis.text}</p>
                  <div>
                    <Badge className={getSentimentColor(analysis.sentiment)}>
                      {SENTIMENT_LABELS[analysis.sentiment]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
