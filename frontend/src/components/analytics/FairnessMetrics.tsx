import React, { useState } from 'react';
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
import { toast } from 'react-hot-toast';

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
  const [showBiasMetrics, setShowBiasMetrics] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Blind review state
  const [blindReviewEnabled, setBlindReviewEnabled] = useState(false);
  const [showBlindReviewSettings, setShowBlindReviewSettings] = useState(false);
  const [blindReviewSettings, setBlindReviewSettings] = useState({
    hideNames: true,
    hideDemographics: true,
    hideEducation: false,
    multipleReviewers: true,
    minReviewers: 2
  });
  
  const handleSaveBlindReviewSettings = () => {
    // In a real app, this would save settings to the backend
    toast({
      title: "Settings saved",
      description: "Blind review settings have been updated successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    
    // If blind review is enabled, apply the settings immediately
    if (blindReviewEnabled) {
      // In a real app, this would trigger an API call to apply settings
      toast({
        title: "Blind review active",
        description: "Blind review has been applied to all subjective assessments.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
                Enable blind review for subjective questions to reduce unconscious bias.
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="blind-review"
                      name="blind-review"
                      type="checkbox"
                      checked={blindReviewEnabled}
                      onChange={(e) => setBlindReviewEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="blind-review" className="ml-2 block text-sm text-gray-700">
                      Enable Blind Review
                    </label>
                  </div>
                  <button
                    onClick={() => setShowBlindReviewSettings(!showBlindReviewSettings)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showBlindReviewSettings ? 'Hide Settings' : 'Show Settings'}
                  </button>
                </div>
                
                {showBlindReviewSettings && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-md">
                    <h5 className="font-medium text-gray-700 text-sm mb-2">Blind Review Settings</h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="hide-names"
                            name="hide-names"
                            type="checkbox"
                            checked={blindReviewSettings.hideNames}
                            onChange={(e) => setBlindReviewSettings({
                              ...blindReviewSettings,
                              hideNames: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="hide-names" className="font-medium text-gray-700">Hide candidate names</label>
                          <p className="text-gray-500">Reviewers will see anonymous identifiers instead of names</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="hide-demographics"
                            name="hide-demographics"
                            type="checkbox"
                            checked={blindReviewSettings.hideDemographics}
                            onChange={(e) => setBlindReviewSettings({
                              ...blindReviewSettings,
                              hideDemographics: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="hide-demographics" className="font-medium text-gray-700">Hide demographic information</label>
                          <p className="text-gray-500">Remove any demographic indicators from submissions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="hide-education"
                            name="hide-education"
                            type="checkbox"
                            checked={blindReviewSettings.hideEducation}
                            onChange={(e) => setBlindReviewSettings({
                              ...blindReviewSettings,
                              hideEducation: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="hide-education" className="font-medium text-gray-700">Hide education details</label>
                          <p className="text-gray-500">Remove school names and degree information</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="multiple-reviewers"
                            name="multiple-reviewers"
                            type="checkbox"
                            checked={blindReviewSettings.multipleReviewers}
                            onChange={(e) => setBlindReviewSettings({
                              ...blindReviewSettings,
                              multipleReviewers: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="multiple-reviewers" className="font-medium text-gray-700">Require multiple reviewers</label>
                          <p className="text-gray-500">Each submission will be reviewed by at least 2 people</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="min-reviewers" className="block text-sm font-medium text-gray-700">
                        Minimum reviewers per submission
                      </label>
                      <select
                        id="min-reviewers"
                        name="min-reviewers"
                        value={blindReviewSettings.minReviewers}
                        onChange={(e) => setBlindReviewSettings({
                          ...blindReviewSettings,
                          minReviewers: parseInt(e.target.value)
                        })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value={2}>2 reviewers</option>
                        <option value={3}>3 reviewers</option>
                        <option value={4}>4 reviewers</option>
                        <option value={5}>5 reviewers</option>
                      </select>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveBlindReviewSettings}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
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