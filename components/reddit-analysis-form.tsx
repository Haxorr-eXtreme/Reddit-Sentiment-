"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { useAnalyses } from "@/contexts/analyses-context"

ChartJS.register(ArcElement, Tooltip, Legend)

const SENTIMENT_LABELS = ["Negative", "Neutral", "Positive", "Irrelevant"]
const CHART_COLORS = {
  backgroundColor: [
    "rgba(239, 68, 68, 0.7)", // red
    "rgba(59, 130, 246, 0.7)", // blue
    "rgba(34, 197, 94, 0.7)", // green
    "rgba(168, 162, 158, 0.7)", // gray
  ],
  borderColor: ["rgb(239, 68, 68)", "rgb(59, 130, 246)", "rgb(34, 197, 94)", "rgb(168, 162, 158)"],
}

export function RedditAnalysisForm() {
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [sentimentCounts, setSentimentCounts] = useState<number[]>([0, 0, 0, 0])
  const { toast } = useToast()
  const { addAnalysis } = useAnalyses()

  const analyzeReddit = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setSentimentCounts([0, 0, 0, 0])

    try {
      const response = await axios.get(`http://localhost:8000/reddit/${encodeURIComponent(query)}?limit=${limit}`)
      const results = response.data.results || []
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No Reddit posts found for your query.",
          variant: "default",
        })
        return
      }
      
      setResults(results)
      setError(null)

      // Calculate sentiment distribution
      const counts = [0, 0, 0, 0]
      results.forEach((result: { sentiment: number }) => {
        counts[result.sentiment]++
      })
      setSentimentCounts(counts)

      // Add each result to recent analyses
      results.forEach((result: { title: string; sentiment: number }) => {
        addAnalysis({
          text: result.title,
          sentiment: result.sentiment,
          source: "Reddit",
        })
      })

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${results.length} Reddit posts for "${query}".`,
      })
    } catch (error) {
      console.error("Error analyzing Reddit posts:", error)
      setError("Failed to analyze Reddit posts. Please try again.")
      setResults([])
      setSentimentCounts([0, 0, 0, 0])

      toast({
        title: "Error",
        description: "Failed to analyze Reddit posts. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Input
                placeholder="Enter search query (e.g., Imran Khan)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={analyzeReddit} disabled={loading || !query.trim()}>
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="limit" className="text-sm font-medium">
                Number of posts to analyze:
              </label>
              <Input
                id="limit"
                type="number"
                min={10}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Math.min(100, Math.max(10, parseInt(e.target.value) || 30)))}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && results.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="h-80">
                <Pie
                  data={{
                    labels: SENTIMENT_LABELS,
                    datasets: [
                      {
                        data: sentimentCounts,
                        backgroundColor: CHART_COLORS.backgroundColor,
                        borderColor: CHART_COLORS.borderColor,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw as number
                            const total = sentimentCounts.reduce((a, b) => a + b, 0)
                            const percentage = ((value / total) * 100).toFixed(1)
                            return `${context.label}: ${value} (${percentage}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-80 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post Title</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate max-w-[300px]">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {result.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: CHART_COLORS.backgroundColor[result.sentiment],
                              color: "white",
                            }}
                          >
                            {SENTIMENT_LABELS[result.sentiment]}
                          </div>
                        </TableCell>
                        <TableCell>{result.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
