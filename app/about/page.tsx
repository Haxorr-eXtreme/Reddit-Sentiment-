import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader title="About" description="Learn more about our sentiment analysis tool" />

        <Card>
          <CardHeader>
            <CardTitle>BERT-Based Sentiment Analysis</CardTitle>
            <CardDescription>How our sentiment analysis works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This web application uses a fine-tuned BERT model to classify text sentiment as Positive, Negative,
              Neutral, or Irrelevant.
            </p>
            <p>
              BERT (Bidirectional Encoder Representations from Transformers) is a transformer-based machine learning
              technique for natural language processing pre-training developed by Google.
            </p>
            <p>Our application supports:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Custom text input for individual analysis</li>
              <li>CSV batch uploads for analyzing multiple texts at once</li>
              <li>Real-time Reddit topic analysis</li>
              <li>Real-time Twitter topic analysis</li>
            </ul>
            <p>
              The model has been fine-tuned on a diverse dataset to ensure accurate sentiment classification across
              various domains and contexts.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
