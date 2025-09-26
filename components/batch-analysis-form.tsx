"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload } from "lucide-react"
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

export function BatchAnalysisForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [sentimentCounts, setSentimentCounts] = useState<number[]>([0, 0, 0, 0])
  const { toast } = useToast()
  const { addAnalysis } = useAnalyses()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setFile(file)
      toast({
        title: "File Selected",
        description: `${file.name} has been selected for analysis.`,
      })
    } else {
      setFile(null)
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      })
    }
  }

  const analyzeBatch = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a CSV file to analyze",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post("http://localhost:8000/batch", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const results = response.data.results || []
      setResults(results)

      // Calculate sentiment distribution
      const counts = [0, 0, 0, 0]
      results.forEach((result: { sentiment: number }) => {
        counts[result.sentiment]++
      })
      setSentimentCounts(counts)

      // Add each result to recent analyses (limit to first 10 to avoid overwhelming)
      results.slice(0, 10).forEach((result: { text: string; sentiment: number }) => {
        addAnalysis({
          text: result.text,
          sentiment: result.sentiment,
          source: "Batch",
        })
      })

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${results.length} entries from the CSV file.`,
      })
    } catch (error) {
      console.error("Error analyzing batch:", error)
      setError("Failed to analyze the CSV file. Please check the format and try again.")

      toast({
        title: "Error",
        description: "Failed to analyze the CSV file. Please check the format and try again.",
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
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV file with a 'text' column</p>
                </div>
                <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {file && (
              <div className="text-sm text-center">
                Selected file: <span className="font-medium">{file.name}</span>
              </div>
            )}

            <Button onClick={analyzeBatch} disabled={loading || !file} className="w-full">
              {loading ? "Analyzing..." : "Analyze Batch"}
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
                      <TableHead>Text</TableHead>
                      <TableHead>Sentiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate max-w-[300px]">{result.text}</TableCell>
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
