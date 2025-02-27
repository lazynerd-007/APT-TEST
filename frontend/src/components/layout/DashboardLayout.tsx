import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { NotificationContainer } from '../common/Notification';
import { FaBars, FaTimes, FaHome, FaGraduationCap, FaClipboardCheck, FaUsers, FaCog } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  notifications?: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>;
  onCloseNotification?: (id: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
  icon,
  notifications = [], // Default to empty array
  onCloseNotification = () => {}, // Default no-op function
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
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <FaTimes className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-xl font-bold text-blue-600">BLUAPT</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <NavItem href="/dashboard" icon={<FaHome />} label="Dashboard" />
              <NavItem href="/skills" icon={<FaGraduationCap />} label="Skills" />
              <NavItem href="/assessments" icon={<FaClipboardCheck />} label="Assessments" />
              <NavItem href="/candidates" icon={<FaUsers />} label="Candidates" />
              <NavItem href="/settings" icon={<FaCog />} label="Settings" />
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold text-blue-600">BLUAPT</span>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                <NavItem href="/dashboard" icon={<FaHome />} label="Dashboard" />
                <NavItem href="/skills" icon={<FaGraduationCap />} label="Skills" />
                <NavItem href="/assessments" icon={<FaClipboardCheck />} label="Assessments" />
                <NavItem href="/candidates" icon={<FaUsers />} label="Candidates" />
                <NavItem href="/settings" icon={<FaCog />} label="Settings" />
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <FaBars className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {(title || description) && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
              <div className="flex items-center">
                {icon && <div className="mr-3">{icon}</div>}
                <div>
                  {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
                  {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                </div>
              </div>
            </div>
          )}
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ href, icon, label }: { href: string; icon: ReactNode; label: string }) => {
  return (
    <Link href={href} className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
      <div className="mr-3 text-gray-400 group-hover:text-gray-500">{icon}</div>
      {label}
    </Link>
  );
};

export default DashboardLayout; 