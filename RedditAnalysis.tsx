'use client';

import { useState } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
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

export default function RedditAnalysis() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sentimentCounts, setSentimentCounts] = useState<number[]>([0, 0, 0, 0]);

  const analyzeReddit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/reddit/${encodeURIComponent(query)}`);
      const results = response.data.results || [];
      setResults(results);
      
      // Calculate sentiment distribution
      const counts = [0, 0, 0, 0];
      results.forEach((result: { sentiment: number }) => {
        counts[result.sentiment]++;
      });
      setSentimentCounts(counts);
    } catch (error: any) {
      console.error('Error analyzing Reddit posts:', error);
      setResults([]);
      setSentimentCounts([0, 0, 0, 0]);
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <Title className="mb-4">Reddit Analysis</Title>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <TextInput
            placeholder="Enter search query (e.g., Imran Khan)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={analyzeReddit}
            loading={loading}
            disabled={!query.trim()}
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
                      Post Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sentiment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {result.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {SENTIMENT_LABELS[result.sentiment]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score}
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
