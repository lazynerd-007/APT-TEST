import React, { ReactNode, useState } from 'react';
import Navigation from './Navigation';
import { NotificationContainer } from '../common/Notification';
import { FaBars, FaTimes } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'employer' | 'candidate';
  userName: string;
  userAvatar?: string;
  notificationCount?: number;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onCloseNotification: (id: string) => void;
  pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
  userName,
  userAvatar,
  notificationCount = 0,
  notifications,
  onNavigate,
  onLogout,
  onCloseNotification,
  pageTitle,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onClose={onCloseNotification}
        position="top-right"
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform ${
            sidebarOpen
              ? 'translate-x-0 ease-out duration-300'
              : '-translate-x-full ease-in duration-200'
          }`}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FaTimes className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="text-primary-600 font-bold text-xl">BLUAPT</div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {/* Sidebar navigation items */}
              {/* This would be a duplicate of the navigation items in the Navigation component */}
              {/* For simplicity, we'll just show a placeholder */}
              <div className="py-4 text-center text-gray-500">
                Navigation items would go here
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar component */}
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="text-primary-600 font-bold text-xl">BLUAPT</div>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {/* Sidebar navigation items */}
                {/* This would be a duplicate of the navigation items in the Navigation component */}
                {/* For simplicity, we'll just show a placeholder */}
                <div className="py-4 text-center text-gray-500">
                  Navigation items would go here
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <Navigation
          userRole={userRole}
          userName={userName}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        {/* Page header */}
        {pageTitle && (
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-tight text-gray-900">{pageTitle}</h1>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  {/* Action buttons could go here */}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 