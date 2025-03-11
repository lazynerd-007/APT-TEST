import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from '@/components/ui';
import { FaClipboardCheck, FaUserGraduate, FaChartLine } from 'react-icons/fa';

const CandidateLandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Assessment Platform - Candidate Portal</title>
      </Head>

      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Assessment Platform</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/candidate/login')}
            className="text-sm"
          >
            Login
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Welcome to the Assessment Platform</h2>
              <p className="text-xl mb-8">
                Showcase your skills and abilities through our comprehensive assessment platform.
              </p>
              <Button
                size="lg"
                onClick={() => router.push('/candidate/dashboard')}
                className="px-8 py-3 text-lg"
              >
                Start Your Assessment
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-soft p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaClipboardCheck className="text-primary-600 text-2xl" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Take Assessments</h4>
                <p className="text-gray-600">
                  Complete various tests designed to evaluate your skills and knowledge in different areas.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-soft p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUserGraduate className="text-primary-600 text-2xl" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Demonstrate Skills</h4>
                <p className="text-gray-600">
                  Show your expertise through coding challenges, multiple-choice questions, and more.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-soft p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaChartLine className="text-primary-600 text-2xl" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Get Results</h4>
                <p className="text-gray-600">
                  Receive detailed feedback and scores to understand your strengths and areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Begin?</h3>
              <p className="text-gray-600 mb-8">
                Access your assigned assessments and start showcasing your skills today.
              </p>
              <Button
                onClick={() => router.push('/candidate/dashboard')}
                className="px-8"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Assessment Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CandidateLandingPage; 