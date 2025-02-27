import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { FaUsers, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

interface AssessmentAnalyticsProps {
  assessmentId: string;
  assessmentTitle: string;
  analytics: {
    totalCandidates: number;
    completionRate: number;
    passRate: number;
    averageScore: number;
    averageCompletionTime: number;
    scoreDistribution: Record<string, number>;
    questionAnalytics: Array<{
      questionId: string;
      content: string;
      averageScore: number;
      successRate: number;
      averageTime: number;
    }>;
    skillBreakdown: Record<string, number>;
  };
}

const AssessmentAnalytics: React.FC<AssessmentAnalyticsProps> = ({
  assessmentId,
  assessmentTitle,
  analytics
}) => {
  // Score distribution chart data
  const scoreDistributionData = {
    labels: Object.keys(analytics.scoreDistribution),
    datasets: [
      {
        label: 'Number of Candidates',
        data: Object.values(analytics.scoreDistribution),
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Pass/Fail chart data
  const passFailData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [
          analytics.totalCandidates * analytics.passRate,
          analytics.totalCandidates * (1 - analytics.passRate),
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Question performance chart data
  const questionPerformanceData = {
    labels: analytics.questionAnalytics.map(q => q.content.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'Average Score',
        data: analytics.questionAnalytics.map(q => q.averageScore),
        borderColor: 'rgba(14, 165, 233, 1)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Success Rate',
        data: analytics.questionAnalytics.map(q => q.successRate * 100),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Skill breakdown chart data
  const skillBreakdownData = {
    labels: Object.keys(analytics.skillBreakdown),
    datasets: [
      {
        label: 'Average Score',
        data: Object.values(analytics.skillBreakdown),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{assessmentTitle} Analytics</h2>
        <p className="text-gray-500">Comprehensive analytics for assessment performance</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <FaUsers className="text-primary-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Candidates</p>
            <p className="text-2xl font-bold text-gray-800">{analytics.totalCandidates}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-success-100 p-3 rounded-full">
            <FaCheckCircle className="text-success-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pass Rate</p>
            <p className="text-2xl font-bold text-gray-800">{(analytics.passRate * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <FaTimesCircle className="text-primary-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Average Score</p>
            <p className="text-2xl font-bold text-gray-800">{analytics.averageScore.toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-warning-100 p-3 rounded-full">
            <FaClock className="text-warning-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Completion Time</p>
            <p className="text-2xl font-bold text-gray-800">{analytics.averageCompletionTime.toFixed(0)} min</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Distribution</h3>
          <div className="h-64">
            <Bar 
              data={scoreDistributionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Candidates',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Score Range',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pass/Fail Ratio</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48">
              <Doughnut 
                data={passFailData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Performance</h3>
          <div className="h-64">
            <Line 
              data={questionPerformanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Score / Success Rate (%)',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Breakdown</h3>
          <div className="h-64">
            <Radar 
              data={skillBreakdownData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Question analytics table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Analytics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.questionAnalytics.map((question, index) => (
                <tr key={question.questionId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {question.content.length > 50 
                      ? `${question.content.substring(0, 50)}...` 
                      : question.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {question.averageScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {(question.successRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {question.averageTime} sec
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentAnalytics; 