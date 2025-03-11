import { useEffect, useState } from 'react';
import candidateService from '../services/candidateService';

export default function TestPage() {
  const [results, setResults] = useState<any>({
    inviteStatus: 'Pending',
    verifyStatus: 'Pending',
    inviteResponse: null,
    verifyResponse: null,
    error: null
  });

  useEffect(() => {
    async function runTest() {
      try {
        setResults(prev => ({ ...prev, inviteStatus: 'Running' }));
        
        // Test data
        const inviteData = {
          assessment_id: '123e4567-e89b-12d3-a456-426614174000', // Using a valid UUID format
          candidates: [
            { name: 'John Doe', email: 'john.doe@example.com' },
            { name: 'Jane Smith', email: 'jane.smith@example.com' }
          ],
          message: 'Please complete this assessment within 3 days. Good luck!'
        };
        
        // Call the service
        const inviteResponse = await candidateService.inviteCandidates(inviteData);
        setResults(prev => ({ 
          ...prev, 
          inviteStatus: 'Completed', 
          inviteResponse 
        }));
        
        // Test verification
        setResults(prev => ({ ...prev, verifyStatus: 'Running' }));
        
        // For testing, we'll use a known test account
        const verifyData = {
          email: 'candidate@example.com',
          accessCode: 'TEST123'
        };
        
        try {
          const verifyResponse = await candidateService.verifyAccessCode(
            verifyData.email, 
            verifyData.accessCode
          );
          
          setResults(prev => ({ 
            ...prev, 
            verifyStatus: 'Completed', 
            verifyResponse 
          }));
        } catch (error: any) {
          setResults(prev => ({ 
            ...prev, 
            verifyStatus: 'Failed', 
            error: error.message 
          }));
        }
      } catch (error: any) {
        setResults(prev => ({ 
          ...prev, 
          inviteStatus: 'Failed', 
          error: error.message 
        }));
      }
    }

    runTest();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Results</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Invitation Test</h2>
        <p>Status: <span className={`font-bold ${results.inviteStatus === 'Completed' ? 'text-green-600' : results.inviteStatus === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>{results.inviteStatus}</span></p>
        {results.inviteResponse && (
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(results.inviteResponse, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Verification Test</h2>
        <p>Status: <span className={`font-bold ${results.verifyStatus === 'Completed' ? 'text-green-600' : results.verifyStatus === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>{results.verifyStatus}</span></p>
        {results.verifyResponse && (
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(results.verifyResponse, null, 2)}
          </pre>
        )}
      </div>
      
      {results.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{results.error}</p>
        </div>
      )}
    </div>
  );
} 