import React from 'react';
import Link from 'next/link';
import { FaUserTie, FaUserGraduate, FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">BLUAPT</span>
            </div>
            <div>
              <Link href="/login">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Sign In
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Skills-Based Hiring Platform
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Objectively evaluate candidates through coding tests, aptitude assessments, and situational judgment scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Login Options */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Choose Your Path
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Select the appropriate login option based on your role
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Employer Login */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto">
                  <FaUserTie className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Employer</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create and manage assessments, review candidate results, and make data-driven hiring decisions.
                  </p>
                  <div className="mt-6">
                    <Link href="/login">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Employer Login
                        <FaArrowRight className="ml-2 -mr-1 h-4 w-4" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Login */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                  <FaUserGraduate className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Candidate</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Take assessments, showcase your skills, and get objective feedback on your performance.
                  </p>
                  <div className="mt-6">
                    <Link href="/candidates/login">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Candidate Login
                        <FaArrowRight className="ml-2 -mr-1 h-4 w-4" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Key Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Our platform offers comprehensive tools for skills-based hiring
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Test Library</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Pre-built assessments with configurable parameters for various roles and skill levels.
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Objective Scoring</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Automated evaluation with bias mitigation strategies for fair assessment.
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Comprehensive Analytics</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Data-driven insights for making informed hiring decisions based on skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy Policy</span>
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms of Service</span>
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Contact</span>
                Contact
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 BLUAPT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 