'use client';

import { useState } from 'react';
import { Card, Title, Button } from '@tremor/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const SENTIMENT_LABELS = ['Negative', 'Neutral', 'Positive', 'Irrelevant'];
const CHART_COLORS = {
  backgroundColor: [
    'rgba(239, 68, 68, 0.5)',   // red
    'rgba(59, 130, 246, 0.5)',  // blue
    'rgba(34, 197, 94, 0.5)',   // green
    'rgba(168, 162, 158, 0.5)', // gray
  ],
  borderColor: [
    'rgb(239, 68, 68)',
    'rgb(59, 130, 246)',
    'rgb(34, 197, 94)',
    'rgb(168, 162, 158)',
  ],
};

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sentimentCounts, setSentimentCounts] = useState<number[]>([0, 0, 0, 0]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const analyzeBatch = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const results = response.data.results || [];
      setResults(results);
      
      // Calculate sentiment distribution
      const counts = [0, 0, 0, 0];
      results.forEach((result: { sentiment: number }) => {
        counts[result.sentiment]++;
      });
      setSentimentCounts(counts);
    } catch (error) {
      console.error('Error analyzing batch:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Title className="mb-4">Batch Analysis</Title>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <Button
            onClick={analyzeBatch}
            loading={loading}
            disabled={!file}
          >
            Analyze
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="h-64">
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
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const total = sentimentCounts.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${context.label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sentiment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {SENTIMENT_LABELS[result.sentiment]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
