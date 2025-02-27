import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { FaUserCheck, FaUserTimes, FaUserClock, FaChartLine, FaCheck, FaTimes } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface Candidate {
  id: string;
  name: string;
  score: number;
  completionTime: number;
  strengths: string[];
  weaknesses: string[];
  skillScores: Record<string, number>;
}

interface CandidateComparisonProps {
  assessmentId: string;
  assessmentTitle: string;
  candidates: Candidate[];
  onSelectCandidate?: (candidateId: string) => void;
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  assessmentId,
  assessmentTitle,
  candidates,
  onSelectCandidate
}) => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(
    candidates.slice(0, 3).map(c => c.id)
  );

  const toggleCandidateSelection = (candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      if (selectedCandidates.length < 5) {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      }
    }
  };

  // Get all unique skills across selected candidates
  const allSkills = new Set<string>();
  candidates
    .filter(c => selectedCandidates.includes(c.id))
    .forEach(candidate => {
      Object.keys(candidate.skillScores).forEach(skill => {
        allSkills.add(skill);
      });
    });
  
  const skillsArray = Array.from(allSkills);

  // Generate random colors for candidates
  const generateColor = (index: number, alpha: number = 0.7) => {
    const colors = [
      `rgba(14, 165, 233, ${alpha})`,
      `rgba(139, 92, 246, ${alpha})`,
      `rgba(34, 197, 94, ${alpha})`,
      `rgba(239, 68, 68, ${alpha})`,
      `rgba(245, 158, 11, ${alpha})`
    ];
    return colors[index % colors.length];
  };

  // Prepare radar chart data
  const radarData = {
    labels: skillsArray,
    datasets: candidates
      .filter(c => selectedCandidates.includes(c.id))
      .map((candidate, index) => ({
        label: candidate.name,
        data: skillsArray.map(skill => candidate.skillScores[skill] || 0),
        backgroundColor: generateColor(index, 0.2),
        borderColor: generateColor(index, 1),
        borderWidth: 2,
        pointBackgroundColor: generateColor(index, 1),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: generateColor(index, 1),
      })),
  };

  // Prepare bar chart data for overall scores
  const scoreData = {
    labels: candidates
      .filter(c => selectedCandidates.includes(c.id))
      .map(c => c.name),
    datasets: [
      {
        label: 'Overall Score',
        data: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map(c => c.score),
        backgroundColor: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map((_, index) => generateColor(index)),
        borderColor: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map((_, index) => generateColor(index, 1)),
        borderWidth: 1,
      },
    ],
  };

  // Prepare bar chart data for completion time
  const timeData = {
    labels: candidates
      .filter(c => selectedCandidates.includes(c.id))
      .map(c => c.name),
    datasets: [
      {
        label: 'Completion Time (minutes)',
        data: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map(c => c.completionTime),
        backgroundColor: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map((_, index) => generateColor(index)),
        borderColor: candidates
          .filter(c => selectedCandidates.includes(c.id))
          .map((_, index) => generateColor(index, 1)),
        borderWidth: 1,
      },
    ],
  };

  // Find top candidate
  const topCandidate = candidates
    .filter(c => selectedCandidates.includes(c.id))
    .reduce((prev, current) => (prev.score > current.score) ? prev : current, candidates[0]);

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Candidate Comparison</h2>
        <p className="text-gray-500">{assessmentTitle}</p>
      </div>

      {/* Candidate selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Candidates to Compare (max 5)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {candidates.map((candidate, index) => (
            <div 
              key={candidate.id}
              className={`
                p-3 rounded-lg border-2 cursor-pointer transition-all
                ${selectedCandidates.includes(candidate.id) 
                  ? `border-primary-500 bg-primary-50` 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => toggleCandidateSelection(candidate.id)}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: generateColor(index, 1) }}
                >
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{candidate.name}</span>
                {selectedCandidates.includes(candidate.id) && (
                  <FaCheck className="text-primary-500 ml-auto" />
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Score: {candidate.score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCandidates.length > 0 ? (
        <>
          {/* Top recommendation */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Top Recommendation</h3>
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <FaUserCheck className="text-primary-600 text-xl" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{topCandidate.name}</p>
                <p className="text-gray-600">Score: {topCandidate.score.toFixed(1)} | Time: {topCandidate.completionTime} min</p>
              </div>
              {onSelectCandidate && (
                <button 
                  onClick={() => onSelectCandidate(topCandidate.id)}
                  className="ml-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors"
                >
                  View Profile
                </button>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Comparison</h3>
              <div className="h-80">
                <Radar 
                  data={radarData} 
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

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Score</h3>
              <div className="h-80">
                <Bar 
                  data={scoreData} 
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
                        max: 100,
                        title: {
                          display: true,
                          text: 'Score',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion Time</h3>
              <div className="h-80">
                <Bar 
                  data={timeData} 
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
                          text: 'Minutes',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Strengths & Weaknesses</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {candidates
                  .filter(c => selectedCandidates.includes(c.id))
                  .map((candidate, index) => (
                    <div key={candidate.id} className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: generateColor(index, 1) }}
                        ></div>
                        <span>{candidate.name}</span>
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <h5 className="text-sm font-medium text-success-700 flex items-center space-x-1">
                            <FaChartLine className="text-success-600" />
                            <span>Strengths</span>
                          </h5>
                          <ul className="mt-1 text-sm">
                            {candidate.strengths.length > 0 ? (
                              candidate.strengths.map((strength, i) => (
                                <li key={i} className="text-gray-700 flex items-center space-x-1">
                                  <FaCheck className="text-success-500 text-xs" />
                                  <span>{strength}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 italic">None identified</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-danger-700 flex items-center space-x-1">
                            <FaChartLine className="text-danger-600" />
                            <span>Weaknesses</span>
                          </h5>
                          <ul className="mt-1 text-sm">
                            {candidate.weaknesses.length > 0 ? (
                              candidate.weaknesses.map((weakness, i) => (
                                <li key={i} className="text-gray-700 flex items-center space-x-1">
                                  <FaTimes className="text-danger-500 text-xs" />
                                  <span>{weakness}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 italic">None identified</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Please select at least one candidate to compare</p>
        </div>
      )}
    </div>
  );
};

export default CandidateComparison; 