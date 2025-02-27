import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to BLUAPT Platform</h1>
        
        <p className="text-gray-600 mb-8 text-center">
          A comprehensive platform for skill management, assessments, and candidate evaluation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/skills" className="block p-6 bg-blue-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Skills Management</h2>
            <p className="text-gray-600">Create, manage, and organize skills and skill categories.</p>
          </Link>
          
          <Link href="/assessments" className="block p-6 bg-green-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2 text-green-700">Assessments</h2>
            <p className="text-gray-600">Create and manage assessments for evaluating skills.</p>
          </Link>
          
          <Link href="/candidates" className="block p-6 bg-purple-50 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2 text-purple-700">Candidates</h2>
            <p className="text-gray-600">Manage candidates and their assessment results.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 