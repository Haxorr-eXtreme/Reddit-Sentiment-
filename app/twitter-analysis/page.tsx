import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { TwitterAnalysisForm } from "@/components/twitter-analysis-form"

export default function TwitterAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Twitter Analysis" description="Analyze sentiment from Twitter posts" />

        <TwitterAnalysisForm />
      </div>
    </DashboardLayout>
  )
}
