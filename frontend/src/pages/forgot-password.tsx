import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await authService.requestPasswordReset(email);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        
        // Add a demo-specific message
        setTimeout(() => {
          setMessage({
            type: 'info',
            text: 'DEMO MODE: For valid emails, the reset link is logged to the browser console (F12). In a real app, this would be sent via email.'
          });
        }, 1000);
        
        setEmail(''); // Clear the form
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-600">BLUAPT</h2>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Reset Your Password</h3>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Demo notice */}
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Demo Mode:</strong> Valid emails for testing are admin@example.com, babsodunewu@gmail.com, and employer@bluapt.com
                  </p>
                </div>
              </div>
            </div>
            
            {message && (
              <div className={`mb-4 ${
                message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 
                message.type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700' :
                'bg-red-50 border-red-500 text-red-700'
              } border-l-4 p-4`}>
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We'll send you a link to reset your password.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <Link href="/login" className="flex items-center text-sm text-blue-600 hover:text-blue-500">
                <FaArrowLeft className="mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 