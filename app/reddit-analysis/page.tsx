import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { RedditAnalysisForm } from "@/components/reddit-analysis-form"

export default function RedditAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Reddit Analysis" description="Analyze sentiment from Reddit posts" />

        <RedditAnalysisForm />
      </div>
    </DashboardLayout>
  )
}
