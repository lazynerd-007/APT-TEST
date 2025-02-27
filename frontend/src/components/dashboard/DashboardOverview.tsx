import React from 'react';
import { 
  FaClipboardCheck, 
  FaUsers, 
  FaClock, 
  FaChartLine, 
  FaCalendarAlt, 
  FaBell, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEllipsisH
} from 'react-icons/fa';

interface Metric {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'assessment_completed' | 'candidate_invited' | 'assessment_created' | 'candidate_hired' | 'other';
}

interface UpcomingAssessment {
  id: string;
  title: string;
  date: string;
  timeRemaining: string;
  candidateCount: number;
}

interface DashboardOverviewProps {
  userRole: 'admin' | 'employer' | 'candidate';
  metrics: Metric[];
  recentActivities: Activity[];
  upcomingAssessments: UpcomingAssessment[];
  onViewAllActivities?: () => void;
  onViewAllAssessments?: () => void;
  onViewMetricDetails?: (metricId: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  userRole,
  metrics,
  recentActivities,
  upcomingAssessments,
  onViewAllActivities,
  onViewAllAssessments,
  onViewMetricDetails,
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'assessment_completed':
        return <FaClipboardCheck className="text-success-500" />;
      case 'candidate_invited':
        return <FaUsers className="text-primary-500" />;
      case 'assessment_created':
        return <FaCalendarAlt className="text-warning-500" />;
      case 'candidate_hired':
        return <FaCheckCircle className="text-success-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div 
            key={metric.id} 
            className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewMetricDetails && onViewMetricDetails(metric.id)}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-full ${metric.color}`}>
                {metric.icon}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm ${
                    metric.change.isPositive ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {metric.change.isPositive ? '+' : ''}{metric.change.value}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            {onViewAllActivities && (
              <button 
                onClick={onViewAllActivities}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {userRole === 'candidate' ? 'Upcoming Tests' : 'Upcoming Assessments'}
            </h2>
            {onViewAllAssessments && (
              <button 
                onClick={onViewAllAssessments}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingAssessments.length > 0 ? (
              upcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaCalendarAlt className="text-primary-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                        <div className="flex items-center mt-1">
                          <FaClock className="text-gray-400 text-xs mr-1" />
                          <p className="text-xs text-gray-500">{assessment.date}</p>
                          {userRole !== 'candidate' && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <FaUsers className="text-gray-400 text-xs mr-1" />
                              <p className="text-xs text-gray-500">{assessment.candidateCount} candidates</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-warning-100 text-warning-800">
                        {assessment.timeRemaining}
                      </span>
                      <button className="ml-2 text-gray-400 hover:text-gray-500">
                        <FaEllipsisH />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">
                  {userRole === 'candidate' 
                    ? 'No upcoming tests' 
                    : 'No upcoming assessments'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific sections */}
      {userRole === 'employer' && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Candidates</h2>
          {/* Employer-specific content would go here */}
          <p className="text-gray-500 text-center py-4">Top candidate visualization would go here</p>
        </div>
      )}

      {userRole === 'candidate' && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Skills Progress</h2>
          {/* Candidate-specific content would go here */}
          <p className="text-gray-500 text-center py-4">Skills progress visualization would go here</p>
        </div>
      )}

      {userRole === 'admin' && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Health</h2>
          {/* Admin-specific content would go here */}
          <p className="text-gray-500 text-center py-4">System health metrics would go here</p>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;