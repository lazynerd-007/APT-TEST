import React, { useState } from 'react';
import { 
  FaHome, 
  FaClipboardList, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaBell, 
  FaUserCircle 
} from 'react-icons/fa';

interface NavigationProps {
  userRole: 'admin' | 'employer' | 'candidate';
  userName: string;
  userAvatar?: string;
  notificationCount?: number;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  userRole,
  userName,
  userAvatar,
  notificationCount = 0,
  onNavigate,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { icon: <FaHome />, label: 'Dashboard', path: '/dashboard' },
    ];

    if (userRole === 'admin') {
      return [
        ...commonItems,
        { icon: <FaClipboardList />, label: 'Assessments', path: '/assessments' },
        { icon: <FaClipboardList />, label: 'Tests', path: '/tests' },
        { icon: <FaClipboardList />, label: 'Questions', path: '/questions' },
        { icon: <FaUsers />, label: 'Candidates', path: '/candidates' },
        { icon: <FaUsers />, label: 'Organizations', path: '/organizations' },
        { icon: <FaChartBar />, label: 'Analytics', path: '/analytics' },
        { icon: <FaCog />, label: 'Settings', path: '/settings' },
      ];
    } else if (userRole === 'employer') {
      return [
        ...commonItems,
        { icon: <FaClipboardList />, label: 'Assessments', path: '/assessments' },
        { icon: <FaClipboardList />, label: 'Tests', path: '/tests' },
        { icon: <FaClipboardList />, label: 'Questions', path: '/questions' },
        { icon: <FaUsers />, label: 'Candidates', path: '/candidates' },
        { icon: <FaChartBar />, label: 'Analytics', path: '/analytics' },
        { icon: <FaCog />, label: 'Settings', path: '/settings' },
      ];
    } else {
      // Candidate
      return [
        ...commonItems,
        { icon: <FaClipboardList />, label: 'My Tests', path: '/my-tests' },
        { icon: <FaChartBar />, label: 'My Results', path: '/my-results' },
        { icon: <FaCog />, label: 'Settings', path: '/settings' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-soft">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="text-primary-600 font-bold text-xl">BLUAPT</div>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate(item.path)}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop Right Section */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Notifications */}
            <button
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 relative"
              onClick={() => onNavigate('/notifications')}
            >
              <FaBell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={toggleProfileMenu}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {userAvatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={userAvatar}
                      alt={userName}
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium">{userName}</p>
                    <p className="text-gray-500 capitalize">{userRole}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('/profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FaSignOutAlt className="mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 w-full"
              >
                <span className="mr-3 text-gray-400">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Mobile profile section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {userAvatar ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={userAvatar}
                    alt={userName}
                  />
                ) : (
                  <FaUserCircle className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{userName}</div>
                <div className="text-sm font-medium text-gray-500 capitalize">{userRole}</div>
              </div>
              <button
                className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 relative"
                onClick={() => onNavigate('/notifications')}
              >
                <FaBell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-danger-500 text-white text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  onNavigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 w-full"
              >
                Your Profile
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 w-full"
              >
                <FaSignOutAlt className="mr-3 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 