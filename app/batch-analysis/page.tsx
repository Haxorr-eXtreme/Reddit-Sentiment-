import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { BatchAnalysisForm } from "@/components/batch-analysis-form"

export default function BatchAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader title="Batch Analysis" description="Analyze multiple texts from a CSV file" />

        <BatchAnalysisForm />
      </div>
    </DashboardLayout>
  )
}
