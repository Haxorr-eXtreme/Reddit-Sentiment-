"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { useAnalyses } from "@/contexts/analyses-context"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

export function SingleAnalysisForm() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ sentiment: number; probabilities: number[] } | null>(null)
  const { toast } = useToast()
  const { addAnalysis } = useAnalyses()

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post("http://localhost:8000/predict", {
        text: text.trim(),
      })

      if (response.data) {
        const sentiment = response.data.sentiment
        const probabilities = response.data.probabilities || response.data.probability || []

        setResult({
          sentiment: typeof sentiment === "number" ? sentiment : 0,
          probabilities: Array.isArray(probabilities) ? probabilities : [],
        })

        // Add to recent analyses
        addAnalysis({
          text: text.trim(),
          sentiment: typeof sentiment === "number" ? sentiment : 0,
          source: "Single",
        })

        toast({
          title: "Analysis Complete",
          description: `Sentiment: ${SENTIMENT_LABELS[typeof sentiment === "number" ? sentiment : 0]}`,
        })
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
      setError("Failed to analyze sentiment. Please try again.")

      toast({
        title: "Error",
        description: "Failed to analyze sentiment. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze..."
              className="min-h-[200px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <Button onClick={analyzeSentiment} disabled={loading || !text.trim()} className="w-full">
              {loading ? "Analyzing..." : "Analyze Sentiment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Analysis Result</h3>
                <div
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: CHART_COLORS.backgroundColor[result.sentiment],
                    color: "white",
                  }}
                >
                  {SENTIMENT_LABELS[result.sentiment]}
                </div>
              </div>

              {result.probabilities.length > 0 && (
                <div className="h-64">
                  <Bar
                    data={{
                      labels: SENTIMENT_LABELS,
                      datasets: [
                        {
                          label: "Confidence Scores",
                          data: result.probabilities,
                          backgroundColor: CHART_COLORS.backgroundColor,
                          borderColor: CHART_COLORS.borderColor,
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1,
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number
                              return `Confidence: ${(value * 100).toFixed(2)}%`
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
