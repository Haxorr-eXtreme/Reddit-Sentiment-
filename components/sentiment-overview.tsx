"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"
import { useAnalyses } from "@/contexts/analyses-context"
import { useMemo } from "react"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

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

export function SentimentOverview() {
  const { recentAnalyses } = useAnalyses()

  // Calculate sentiment distribution for pie chart
  const pieChartData = useMemo(() => {
    const counts = [0, 0, 0, 0] // [Negative, Neutral, Positive, Irrelevant]

    recentAnalyses.forEach((analysis) => {
      counts[analysis.sentiment]++
    })

    return {
      labels: SENTIMENT_LABELS,
      datasets: [
        {
          data: counts,
          backgroundColor: CHART_COLORS.backgroundColor,
          borderColor: CHART_COLORS.borderColor,
          borderWidth: 1,
        },
      ],
    }
  }, [recentAnalyses])

  // Calculate sentiment by source for bar chart
  const barChartData = useMemo(() => {
    // Initialize data structure
    const sourceData = {
      Single: [0, 0, 0, 0], // [Negative, Neutral, Positive, Irrelevant]
      Batch: [0, 0, 0, 0],
      Reddit: [0, 0, 0, 0],
      Twitter: [0, 0, 0, 0],
    }

    // Count sentiments by source
    recentAnalyses.forEach((analysis) => {
      sourceData[analysis.source][analysis.sentiment]++
    })

    return {
      labels: ["Single", "Batch", "Reddit", "Twitter"],
      datasets: [
        {
          label: "Negative",
          data: [sourceData.Single[0], sourceData.Batch[0], sourceData.Reddit[0], sourceData.Twitter[0]],
          backgroundColor: CHART_COLORS.backgroundColor[0],
        },
        {
          label: "Neutral",
          data: [sourceData.Single[1], sourceData.Batch[1], sourceData.Reddit[1], sourceData.Twitter[1]],
          backgroundColor: CHART_COLORS.backgroundColor[1],
        },
        {
          label: "Positive",
          data: [sourceData.Single[2], sourceData.Batch[2], sourceData.Reddit[2], sourceData.Twitter[2]],
          backgroundColor: CHART_COLORS.backgroundColor[2],
        },
        {
          label: "Irrelevant",
          data: [sourceData.Single[3], sourceData.Batch[3], sourceData.Reddit[3], sourceData.Twitter[3]],
          backgroundColor: CHART_COLORS.backgroundColor[3],
        },
      ],
    }
  }, [recentAnalyses])

  // Check if there's any data to display
  const hasData = recentAnalyses.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Overview</CardTitle>
        <CardDescription>Distribution of sentiment across all analyses</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No data available yet. Try analyzing some text!
          </div>
        ) : (
          <Tabs defaultValue="distribution">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="by-source">By Source</TabsTrigger>
            </TabsList>
            <TabsContent value="distribution" className="pt-4">
              <div className="h-80">
                <Pie
                  data={pieChartData}
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
                            const total = pieChartData.datasets[0].data.reduce(
                              (a, b) => (a as number) + (b as number),
                              0,
                            ) as number
                            const percentage = ((value / total) * 100).toFixed(1)
                            return `${context.label}: ${value} (${percentage}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="by-source" className="pt-4">
              <div className="h-80">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
