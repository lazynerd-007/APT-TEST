import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface BiasMetric {
  metricName: string;
  metricValue: number;
  demographicGroup: string;
  comparisonGroup: string;
  isSignificant: boolean;
}

interface FairnessMetricsProps {
  assessmentId: string;
  assessmentTitle: string;
  demographicGroups: string[];
  passingRates: number[];
  averageScores: number[];
  showWarning: boolean[];
  biasMetrics: BiasMetric[];
}

const FairnessMetrics: React.FC<FairnessMetricsProps> = ({
  assessmentId,
  assessmentTitle,
  demographicGroups,
  passingRates,
  averageScores,
  showWarning,
  biasMetrics
}) => {
  // Prepare chart data
  const data = {
    labels: demographicGroups,
    datasets: [
      {
        label: 'Passing Rate (%)',
        data: passingRates,
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
      {
        label: 'Average Score',
        data: averageScores,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Check if any warnings exist
  const hasWarnings = showWarning.some(w => w);
  
  // Count significant bias metrics
  const significantBiasCount = biasMetrics.filter(m => m.isSignificant).length;

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Fairness Metrics</h2>
        <p className="text-gray-500">{assessmentTitle}</p>
      </div>

      {/* Fairness status */}
      <div className={`rounded-lg p-4 flex items-start space-x-4 ${
        hasWarnings 
          ? 'bg-warning-50 border border-warning-200' 
          : 'bg-success-50 border border-success-200'
      }`}>
        <div className={`p-2 rounded-full ${
          hasWarnings ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
        }`}>
          {hasWarnings 
            ? <FaExclamationTriangle className="text-xl" /> 
            : <FaCheckCircle className="text-xl" />
          }
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            hasWarnings ? 'text-warning-800' : 'text-success-800'
          }`}>
            {hasWarnings 
              ? 'Potential Bias Detected' 
              : 'No Significant Bias Detected'
            }
          </h3>
          <p className={hasWarnings ? 'text-warning-700' : 'text-success-700'}>
            {hasWarnings 
              ? `We've detected ${significantBiasCount} potential bias ${significantBiasCount === 1 ? 'issue' : 'issues'} in this assessment.` 
              : 'This assessment shows balanced performance across demographic groups.'
            }
          </p>
          {hasWarnings && (
            <p className="mt-2 text-sm text-warning-600">
              Review the metrics below and consider adjusting the assessment to reduce potential bias.
            </p>
          )}
        </div>
      </div>

      {/* Demographic comparison chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance by Demographic Group</h3>
        <div className="h-80">
          <Bar 
            data={data} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const index = context.dataIndex;
                      return showWarning[index] 
                        ? '⚠️ Potential bias detected' 
                        : '';
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Score / Pass Rate (%)',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Bias metrics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bias Metrics</h3>
        <div className="space-y-4">
          {biasMetrics.length > 0 ? (
            biasMetrics.map((metric, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  metric.isSignificant 
                    ? 'border-warning-300 bg-warning-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${
                    metric.isSignificant 
                      ? 'bg-warning-100 text-warning-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {metric.isSignificant 
                      ? <FaExclamationTriangle /> 
                      : <FaInfoCircle />
                    }
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800">{metric.metricName}</h4>
                    <p className="text-gray-600 mt-1">
                      Value: <span className="font-medium">{metric.metricValue.toFixed(2)}</span>
                    </p>
                    {(metric.demographicGroup && metric.comparisonGroup) && (
                      <p className="text-gray-600">
                        {metric.demographicGroup} vs {metric.comparisonGroup}
                      </p>
                    )}
                    {metric.isSignificant && (
                      <div className="mt-2 text-sm text-warning-700">
                        <p>
                          This metric indicates a potential bias in the assessment. 
                          Consider reviewing the questions that may be contributing to this disparity.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500">
              No bias metrics available for this assessment
            </div>
          )}
        </div>
      </div>

      {/* Mitigation strategies */}
      {hasWarnings && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bias Mitigation Strategies</h3>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Review Question Wording</h4>
              <p className="text-sm text-gray-600 mt-1">
                Check questions for language that might favor certain groups or backgrounds.
              </p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Diversify Question Types</h4>
              <p className="text-sm text-gray-600 mt-1">
                Include a mix of question formats to allow candidates to demonstrate skills in different ways.
              </p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Adjust Scoring Weights</h4>
              <p className="text-sm text-gray-600 mt-1">
                Consider rebalancing the weights of different question types or skills being assessed.
              </p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Blind Review Process</h4>
              <p className="text-sm text-gray-600 mt-1">
                Implement blind review for subjective questions to reduce unconscious bias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fairness documentation */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">About Fairness Metrics</h3>
        <p className="text-primary-700 text-sm">
          BLUAPT uses statistical methods to detect potential bias in assessment results. 
          We analyze performance differences across demographic groups and flag significant disparities 
          that may indicate bias. These metrics help ensure that assessments evaluate skills fairly 
          across all candidate groups.
        </p>
        <div className="mt-3 text-sm text-primary-700">
          <p className="font-medium">Metrics we track:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Demographic parity: Equal passing rates across groups</li>
            <li>Score distribution: Similar score patterns across groups</li>
            <li>Question-level bias: Questions that show significant performance gaps</li>
            <li>Completion time: Similar time requirements across groups</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FairnessMetrics; 