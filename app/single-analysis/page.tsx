import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { SingleAnalysisForm } from "@/components/single-analysis-form"

export default function SingleAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Single Text Analysis" description="Analyze the sentiment of individual text" />

        <SingleAnalysisForm />
      </div>
    </DashboardLayout>
  )
}
