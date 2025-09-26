'use client';

import { useState } from 'react';
import { Card, Title, Button } from '@tremor/react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useAnalyses } from '@/contexts/analyses-context';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip);

const SENTIMENT_LABELS = ['Negative', 'Neutral', 'Positive', 'Irrelevant'];

export default function SingleAnalysis() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sentiment: number; probabilities: number[] } | null>(null);
  const { addAnalysis } = useAnalyses();

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:8000/predict', {
        text: text.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        const sentiment = response.data.sentiment;
        const probabilities = response.data.probabilities || response.data.probability || [];
        
        const newResult = { 
          sentiment: typeof sentiment === 'number' ? sentiment : 0,
          probabilities: Array.isArray(probabilities) ? probabilities : []
        };
        
        setResult(newResult);
        setError(null);

        // Add to recent analyses
        addAnalysis({
          text: text.trim(),
          sentiment: newResult.sentiment,
          source: 'Single'
        });
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || error.message || 'Error connecting to server');
      } else {
        setError('An unexpected error occurred');
      }
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Title className="mb-4">Single Text Analysis</Title>
      
      <div className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-lg min-h-[150px]"
          placeholder="Enter text to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <Button
          onClick={analyzeSentiment}
          loading={loading}
          className="w-full"
        >
          Analyze Sentiment
        </Button>

        {error && !result && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="text-lg font-medium">
              Result: <span className="text-blue-600">{SENTIMENT_LABELS[result.sentiment]}</span>
            </div>

            {result.probabilities.length > 0 && (
              <div className="h-64">
                <Bar
                  data={{
                    labels: SENTIMENT_LABELS,
                    datasets: [
                      {
                        label: 'Confidence Scores',
                        data: result.probabilities,
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.5)',  // red for negative
                          'rgba(59, 130, 246, 0.5)', // blue for neutral
                          'rgba(34, 197, 94, 0.5)',  // green for positive
                          'rgba(168, 162, 158, 0.5)', // gray for irrelevant
                        ],
                        borderColor: [
                          'rgb(239, 68, 68)',
                          'rgb(59, 130, 246)',
                          'rgb(34, 197, 94)',
                          'rgb(168, 162, 158)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
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
                            const value = context.raw as number;
                            return `Confidence: ${(value * 100).toFixed(2)}%`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
