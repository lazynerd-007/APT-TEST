import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationTriangle, FaEye, FaInfoCircle, FaLock, FaWindowClose } from 'react-icons/fa';
import { Socket } from 'socket.io-client';

interface ProctoringSystemProps {
  assessmentId: string;
  candidateId: string;
  socket: Socket;
  onViolation?: (violation: ProctoringViolation) => void;
  onTerminate?: () => void;
}

export interface ProctoringViolation {
  id: string;
  type: 'tab_switch' | 'multiple_faces' | 'no_face' | 'forbidden_app' | 'copy_paste' | 'screenshot' | 'other';
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
  evidence?: string; // Base64 image or other evidence
}

const ProctoringSystem: React.FC<ProctoringSystemProps> = ({
  assessmentId,
  candidateId,
  socket,
  onViolation,
  onTerminate
}) => {
  const [isActive, setIsActive] = useState(false);
  const [permissions, setPermissions] = useState({
    fullscreen: false
  });
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [showViolations, setShowViolations] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState({
    tabSwitches: 0,
    timeActive: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize proctoring
  useEffect(() => {
    // Check if browser supports required APIs
    const hasRequiredAPIs = document.documentElement.requestFullscreen !== undefined;
    
    if (!hasRequiredAPIs) {
      addViolation({
        type: 'other',
        details: 'Your browser does not support the required features for proctoring',
        severity: 'high'
      });
      return;
    }
    
    // Listen for socket events
    socket.on('proctor:violation', handleRemoteViolation);
    
    // Set up fullscreen detection
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Set up tab visibility detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up copy/paste detection
    document.addEventListener('copy', handleCopyEvent);
    document.addEventListener('paste', handlePasteEvent);
    
    // Set up interval for periodic checks
    intervalRef.current = setInterval(performPeriodicChecks, 10000); // Every 10 seconds
    
    return () => {
      // Clean up
      socket.off('proctor:violation', handleRemoteViolation);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyEvent);
      document.removeEventListener('paste', handlePasteEvent);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Request fullscreen
  const requestFullscreen = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        setPermissions(prev => ({ ...prev, fullscreen: true }));
        setIsFullscreen(true);
        return true;
      } else {
        addViolation({
          type: 'other',
          details: 'Fullscreen mode is not supported by your browser',
          severity: 'medium'
        });
        return false;
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      return false;
    }
  };
  
  // Start proctoring
  const startProctoring = async () => {
    const fullscreenReady = requestFullscreen();
    
    if (fullscreenReady) {
      setIsActive(true);
      
      // Notify server that proctoring has started
      socket.emit('proctor:start', {
        assessmentId,
        candidateId,
        timestamp: new Date()
      });
    } else {
      // If fullscreen permission is denied, we can't proceed with proctoring
      alert('Fullscreen mode is required to proceed with the assessment');
    }
  };
  
  // Stop proctoring
  const stopProctoring = () => {
    setIsActive(false);
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    // Notify server that proctoring has stopped
    socket.emit('proctor:stop', {
      assessmentId,
      candidateId,
      timestamp: new Date()
    });
  };
  
  // Handle fullscreen change
  const handleFullscreenChange = () => {
    const isInFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isInFullscreen);
    
    if (isActive && !isInFullscreen) {
      addViolation({
        type: 'other',
        details: 'Exited fullscreen mode during assessment',
        severity: 'medium'
      });
    }
  };
  
  // Handle tab visibility change
  const handleVisibilityChange = () => {
    if (isActive && document.visibilityState === 'hidden') {
      addViolation({
        type: 'tab_switch',
        details: 'Switched to another tab or window during assessment',
        severity: 'medium'
      });
      
      setMonitoringStats(prev => ({
        ...prev,
        tabSwitches: prev.tabSwitches + 1
      }));
    }
  };
  
  // Handle copy event
  const handleCopyEvent = (e: Event) => {
    if (isActive) {
      e.preventDefault();
      addViolation({
        type: 'copy_paste',
        details: 'Attempted to copy content during assessment',
        severity: 'medium'
      });
    }
  };
  
  // Handle paste event
  const handlePasteEvent = (e: Event) => {
    if (isActive) {
      e.preventDefault();
      addViolation({
        type: 'copy_paste',
        details: 'Attempted to paste content during assessment',
        severity: 'medium'
      });
    }
  };
  
  // Handle violations reported by the server
  const handleRemoteViolation = (violation: ProctoringViolation) => {
    addViolation(violation);
  };
  
  // Add a violation to the list
  const addViolation = (violationData: Omit<ProctoringViolation, 'id' | 'timestamp'>) => {
    const violation: ProctoringViolation = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      ...violationData
    };
    
    setViolations(prev => [...prev, violation]);
    
    // Call the onViolation callback if provided
    if (onViolation) {
      onViolation(violation);
    }
    
    // For high severity violations, consider terminating the assessment
    if (violation.severity === 'high' && violations.filter(v => v.severity === 'high').length >= 3) {
      if (onTerminate) {
        onTerminate();
      }
    }
    
    // Send violation to server
    socket.emit('proctor:violation', {
      assessmentId,
      candidateId,
      violation
    });
  };
  
  // Perform periodic checks
  const performPeriodicChecks = () => {
    if (!isActive) return;
    
    // Check if still in fullscreen
    if (!document.fullscreenElement) {
      addViolation({
        type: 'other',
        details: 'Not in fullscreen mode',
        severity: 'low'
      });
    }
    
    // Update monitoring stats
    setMonitoringStats(prev => ({
      ...prev,
      timeActive: prev.timeActive + 10
    }));
  };
  
  // Render the proctoring UI
  return (
    <div className="proctoring-system">
      {!isActive ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment Proctoring</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This assessment is proctored to ensure academic integrity. The following permission is required:
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full ${permissions.fullscreen ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}>
                  {permissions.fullscreen && <FaLock className="text-white text-xs" />}
                </div>
                <span className="ml-2 text-gray-700">Fullscreen mode to prevent multitasking</span>
                {!permissions.fullscreen && (
                  <button 
                    onClick={requestFullscreen}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                  >
                    Allow
                  </button>
                )}
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Do not leave the assessment page or switch tabs</li>
                    <li>Do not exit fullscreen mode during the assessment</li>
                    <li>Do not copy or paste content during the assessment</li>
                    <li>Violations may result in assessment termination</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            <button
              onClick={startProctoring}
              disabled={!permissions.fullscreen}
              className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                permissions.fullscreen
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Start Assessment with Proctoring
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-2 flex items-center justify-between">
          <div className="flex items-center">
            <FaEye className="mr-2" />
            <span className="text-sm font-medium">Proctoring Active</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {violations.length > 0 && (
              <button
                onClick={() => setShowViolations(!showViolations)}
                className="flex items-center text-sm"
              >
                <FaExclamationTriangle className="text-yellow-400 mr-1" />
                <span>{violations.length} Violation{violations.length !== 1 ? 's' : ''}</span>
              </button>
            )}
            
            <button
              onClick={stopProctoring}
              className="flex items-center text-sm text-red-400 hover:text-red-300"
            >
              <FaWindowClose className="mr-1" />
              <span>End Proctoring</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Violations panel */}
      {showViolations && (
        <div className="fixed top-10 right-0 w-80 bg-white shadow-lg rounded-l-lg overflow-hidden z-50">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <h3 className="text-sm font-medium">Proctoring Violations</h3>
            <button onClick={() => setShowViolations(false)} className="text-gray-400 hover:text-white">
              <FaWindowClose />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {violations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No violations detected
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {violations.map(violation => (
                  <li key={violation.id} className="p-3">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                        violation.severity === 'high' ? 'bg-red-500' :
                        violation.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        <FaExclamationTriangle className="text-white text-xs" />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {violation.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(violation.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {violation.details}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringSystem; 