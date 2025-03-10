import React, { useState } from 'react';
import { FaUpload, FaDownload, FaTimes } from 'react-icons/fa';
import { Button, Modal } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, testId: string) => Promise<void>;
  availableTests: Array<{ id: string; title: string }>;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  availableTests,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [testId, setTestId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      setFile(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    
    if (!testId) {
      toast.error('Please select a test');
      return;
    }
    
    try {
      setUploading(true);
      await onUpload(file, testId);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error uploading CSV:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTestId('');
  };

  const downloadSampleCSV = () => {
    // Create sample CSV content
    const csvContent = `question_type,content,difficulty,points,answers,correct_answers,explanation
mcq,"What is the capital of France?",easy,1,"Paris,London,Berlin,Madrid",0,"Paris is the capital of France"
mcq,"Which of the following is a JavaScript framework?",medium,2,"Angular,Bootstrap,jQuery,All of the above",0,"Angular is a JavaScript framework"
essay,"Explain the concept of Object-Oriented Programming.",medium,5,,,"This is a theory question that requires a written answer"
coding,"Write a function that returns the sum of two numbers.",hard,10,,,"This is a coding question"`;

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Questions CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Upload a CSV file containing questions to add them in bulk.
          </p>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="flex items-center text-sm"
            >
              <FaDownload className="mr-1" />
              Download Sample CSV
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="test" className="block text-sm font-medium text-gray-700 mb-1">
                Select Test*
              </label>
              <select
                id="test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                required
              >
                <option value="">Select a test</option>
                {availableTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV File*
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span className="font-medium text-primary-600">{file.name}</span>
                  <span className="ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-danger-500 hover:text-danger-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !testId || uploading}
              isLoading={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CSVUploadModal; 