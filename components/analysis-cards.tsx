"use client"

import { useRouter } from "next/navigation"
import { FileText, FileSpreadsheet, MessageSquare, Twitter } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnalysisCards() {
  const router = useRouter()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Single Analysis</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyze sentiment of individual text</div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button variant="outline" className="w-full" onClick={() => router.push("/single-analysis")}>
            Start Analysis
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Batch Analysis</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyze multiple texts from CSV</div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button variant="outline" className="w-full" onClick={() => router.push("/batch-analysis")}>
            Start Analysis
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reddit Analysis</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyze Reddit posts sentiment</div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button variant="outline" className="w-full" onClick={() => router.push("/reddit-analysis")}>
            Start Analysis
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Twitter Analysis</CardTitle>
          <Twitter className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyze Twitter posts sentiment</div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button variant="outline" className="w-full" onClick={() => router.push("/twitter-analysis")}>
            Start Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
