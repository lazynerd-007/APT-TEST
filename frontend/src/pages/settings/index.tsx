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
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorQR, setShowTwoFactorQR] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: '1', device: 'Chrome on Windows', location: 'New York, USA', lastActive: '2 minutes ago', current: true },
    { id: '2', device: 'Safari on MacOS', location: 'San Francisco, USA', lastActive: '2 days ago', current: false },
  ]);
  
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
  
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (newPassword && newPassword !== confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
        duration: 5000
      });
      return;
    }
    
    // In a real app, this would save to an API
    addNotification({
      type: 'success',
      title: 'Security Settings Updated',
      message: 'Your security settings have been saved successfully.',
      duration: 5000
    });
    
    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handleEnableTwoFactor = () => {
    // In a real app, this would generate a QR code from the backend
    setShowTwoFactorQR(true);
  };
  
  const handleConfirmTwoFactor = () => {
    // In a real app, this would verify the code with the backend
    setTwoFactorEnabled(true);
    setShowTwoFactorQR(false);
    addNotification({
      type: 'success',
      title: 'Two-Factor Authentication Enabled',
      message: 'Your account is now more secure with 2FA.',
      duration: 5000
    });
  };
  
  const handleDisableTwoFactor = () => {
    // In a real app, this would disable 2FA on the backend
    setTwoFactorEnabled(false);
    addNotification({
      type: 'info',
      title: 'Two-Factor Authentication Disabled',
      message: 'Two-factor authentication has been disabled.',
      duration: 5000
    });
  };
  
  const handleTerminateSession = (sessionId: string) => {
    // In a real app, this would terminate the session on the backend
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    addNotification({
      type: 'success',
      title: 'Session Terminated',
      message: 'The selected session has been terminated successfully.',
      duration: 5000
    });
  };
  
  const handleTerminateAllSessions = () => {
    // In a real app, this would terminate all sessions except the current one
    setActiveSessions(prev => prev.filter(session => session.current));
    addNotification({
      type: 'success',
      title: 'All Sessions Terminated',
      message: 'All other sessions have been terminated successfully.',
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
              
              {/* Password Change */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Change Password</h3>
                <form onSubmit={handleSaveSecurity}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaSave className="mr-2 -ml-1 h-4 w-4" />
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Two-Factor Authentication */}
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                
                {!twoFactorEnabled && !showTwoFactorQR && (
                  <button
                    onClick={handleEnableTwoFactor}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Enable Two-Factor Authentication
                  </button>
                )}
                
                {showTwoFactorQR && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    <div className="bg-white p-4 inline-block rounded-md border border-gray-300 mb-3">
                      {/* Placeholder for QR code - in a real app, this would be an actual QR code */}
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">QR Code Placeholder</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                        Verification Code
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          id="verificationCode"
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                          placeholder="Enter 6-digit code"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmTwoFactor}
                          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {twoFactorEnabled && (
                  <div className="bg-green-50 p-4 rounded-md mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Two-factor authentication is enabled
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleDisableTwoFactor}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Disable Two-Factor Authentication
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Active Sessions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Active Sessions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  These are the devices that are currently logged into your account.
                </p>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {activeSessions.map((session) => (
                      <li key={session.id}>
                        <div className="px-4 py-4 flex items-center sm:px-6">
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <div className="flex text-sm">
                                <p className="font-medium text-blue-600 truncate">{session.device}</p>
                                {session.current && (
                                  <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                    (Current session)
                                  </p>
                                )}
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <p>
                                    {session.location} · Last active {session.lastActive}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!session.current && (
                            <div className="ml-5 flex-shrink-0">
                              <button
                                onClick={() => handleTerminateSession(session.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Terminate
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {activeSessions.length > 1 && (
                  <div className="mt-4">
                    <button
                      onClick={handleTerminateAllSessions}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Terminate All Other Sessions
                    </button>
                  </div>
                )}
              </div>
            </section>
            
            <section id="integrations" className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Integrations</h2>
              
              <div className="space-y-6">
                {/* ATS Integrations */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">Applicant Tracking Systems</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect BLUAPT with your existing ATS to streamline your hiring workflow.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative rounded-lg border border-gray-300 bg-white px-5 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-800">G</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href="#" className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true"></span>
                          <p className="text-sm font-medium text-gray-900">Greenhouse</p>
                          <p className="text-sm text-gray-500 truncate">Popular ATS for growing companies</p>
                        </a>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative rounded-lg border border-gray-300 bg-white px-5 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-800">L</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href="#" className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true"></span>
                          <p className="text-sm font-medium text-gray-900">Lever</p>
                          <p className="text-sm text-gray-500 truncate">Modern recruiting software</p>
                        </a>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Job Boards */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Job Boards</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Publish assessment requirements directly to job boards.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative rounded-lg border border-gray-300 bg-white px-5 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-800">I</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href="#" className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true"></span>
                          <p className="text-sm font-medium text-gray-900">Indeed</p>
                          <p className="text-sm text-gray-500 truncate">World's #1 job site</p>
                        </a>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative rounded-lg border border-gray-300 bg-white px-5 py-4 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-800">L</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href="#" className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true"></span>
                          <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                          <p className="text-sm text-gray-500 truncate">Professional networking platform</p>
                        </a>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-green-100 text-green-800 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded">
                          Connected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* API Integration */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-800 mb-3">API Access</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use our API to build custom integrations with your internal tools.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-700">
                          Your API key provides access to all BLUAPT services. Keep it secure and never share it publicly.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                        API Key
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          id="api-key"
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                          value="••••••••••••••••••••••••••••••"
                          readOnly
                        />
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                        >
                          Show
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Generate New Key
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View API Documentation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage; 