import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaCog, FaSave, FaUser, FaBell, FaLock, FaGlobe } from 'react-icons/fa';

const SettingsPage = () => {
  // Profile settings
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@example.com');
  const [bio, setBio] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [assessmentReminders, setAssessmentReminders] = useState(true);
  const [newCandidateAlerts, setNewCandidateAlerts] = useState(true);
  
  // Notifications for the UI
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>>([]);
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to an API
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile settings have been saved successfully.',
      duration: 5000
    });
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to an API
    addNotification({
      type: 'success',
      title: 'Notification Settings Updated',
      message: 'Your notification preferences have been saved.',
      duration: 5000
    });
  };
  
  // Function to add a notification
  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  // Function to remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <DashboardLayout
      title="Settings"
      icon={<FaCog className="text-blue-600" />}
      description="Manage your account settings and preferences"
      notifications={notifications}
      onCloseNotification={removeNotification}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-4">
              <nav className="space-y-1">
                <a href="#profile" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                  <FaUser className="mr-3 text-blue-500" />
                  Profile
                </a>
                <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FaBell className="mr-3 text-gray-400" />
                  Notifications
                </a>
                <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FaLock className="mr-3 text-gray-400" />
                  Security
                </a>
                <a href="#integrations" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <FaGlobe className="mr-3 text-gray-400" />
                  Integrations
                </a>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Settings */}
            <section id="profile" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us a little about yourself"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaSave className="mr-2 -ml-1 h-4 w-4" />
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            </section>
            
            {/* Notification Settings */}
            <section id="notifications" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
              <form onSubmit={handleSaveNotifications}>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotifications"
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">Receive email notifications for important updates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="assessmentReminders"
                        type="checkbox"
                        checked={assessmentReminders}
                        onChange={(e) => setAssessmentReminders(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="assessmentReminders" className="font-medium text-gray-700">
                        Assessment Reminders
                      </label>
                      <p className="text-gray-500">Receive reminders about upcoming and overdue assessments.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="newCandidateAlerts"
                        type="checkbox"
                        checked={newCandidateAlerts}
                        onChange={(e) => setNewCandidateAlerts(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="newCandidateAlerts" className="font-medium text-gray-700">
                        New Candidate Alerts
                      </label>
                      <p className="text-gray-500">Get notified when new candidates register or complete assessments.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaSave className="mr-2 -ml-1 h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </form>
            </section>
            
            {/* Placeholder for other sections */}
            <section id="security" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
              <p className="text-gray-500">Security settings will be implemented in a future update.</p>
            </section>
            
            <section id="integrations" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Integrations</h2>
              <p className="text-gray-500">Integration options will be implemented in a future update.</p>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 