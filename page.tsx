'use client';

import { useState } from 'react';
import { Card, Title, Text } from '@tremor/react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import SingleAnalysis from '@/components/SingleAnalysis';
import BatchAnalysis from '@/components/BatchAnalysis';
import RedditAnalysis from '@/components/RedditAnalysis';
import TwitterAnalysis from '@/components/TwitterAnalysis';

const analysisOptions = [
  {
    id: 'single',
    name: 'Single Text Analysis',
    description: 'Analyze sentiment of individual text',
    icon: DocumentTextIcon,
    component: SingleAnalysis,
  },
  {
    id: 'batch',
    name: 'Batch Analysis',
    description: 'Analyze multiple texts from CSV',
    icon: ChartBarIcon,
    component: BatchAnalysis,
  },
  {
    id: 'reddit',
    name: 'Reddit Analysis',
    description: 'Analyze Reddit posts sentiment',
    icon: ChatBubbleLeftRightIcon,
    component: RedditAnalysis,
  },
  {
    id: 'twitter',
    name: 'Twitter Analysis',
    description: 'Analyze Twitter posts sentiment',
    icon: HashtagIcon,
    component: TwitterAnalysis,
  },
];

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const SelectedComponent = analysisOptions.find(opt => opt.id === selectedOption)?.component;

  return (
    <main className="p-8">
      <Title className="mb-8 text-center">Sentiment Analysis Dashboard</Title>
      
      {!selectedOption ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {analysisOptions.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer transform transition-all hover:scale-105"
              onClick={() => setSelectedOption(option.id)}
            >
              <div className="flex items-center space-x-4">
                <option.icon className="h-8 w-8 text-blue-500" />
                <div>
                  <Text className="font-medium text-lg">{option.name}</Text>
                  <Text className="text-gray-500">{option.description}</Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedOption(null)}
            className="mb-6 text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>
          {SelectedComponent && <SelectedComponent />}
        </div>
      )}
    </main>
  );
}
