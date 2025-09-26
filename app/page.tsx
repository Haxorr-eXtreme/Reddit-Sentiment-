import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalysisCards } from "@/components/analysis-cards"
import { RecentAnalyses } from "@/components/recent-analyses"
import { SentimentOverview } from "@/components/sentiment-overview"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader
          title="Sentiment Analysis Dashboard"
          description="Analyze sentiment in text using our advanced BERT model"
        />

        <AnalysisCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SentimentOverview />
          <RecentAnalyses />
        </div>
      </div>
    </DashboardLayout>
  )
}
