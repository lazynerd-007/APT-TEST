import React, { useState } from 'react';
import { FaUpload, FaFileAlt, FaTimesCircle } from 'react-icons/fa';
import { Button, Modal } from '@/components/ui';
import { assessmentsService } from '@/services/assessmentsService';
import { toast } from 'react-hot-toast';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  onSuccess: () => void;
}

const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  testId,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      if (uploadedFile.type === 'text/csv' || uploadedFile.name.endsWith('.csv')) {
        setFile(uploadedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      if (uploadedFile.type === 'text/csv' || uploadedFile.name.endsWith('.csv')) {
        setFile(uploadedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      await assessmentsService.uploadQuestionsCSV(file, testId);
      toast.success('Questions imported successfully');
      setFile(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error importing questions:', error);
      toast.error('Failed to import questions. Please check your CSV format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const downloadTemplate = () => {
    // Create a link to the template file
    const a = document.createElement('a');
    a.href = '/templates/questions_template.csv';
    a.download = 'questions_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Questions">
      <div className="p-6">
        <p className="text-gray-600 mb-4">
          Upload a CSV file containing questions to import. The file should have the following columns:
          content, type, points, difficulty, and answers.
        </p>
        
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="text-sm"
          >
            Download CSV Template
          </Button>
        </div>

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FaUpload className="text-gray-400 text-3xl mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop your CSV file here
              </p>
              <p className="text-gray-500 text-sm mb-3">or click to browse</p>
              <Button variant="outline" type="button" className="mt-2">
                Select CSV File
              </Button>
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFileAlt className="text-primary-500 text-xl mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-red-500"
                title="Remove file"
              >
                <FaTimesCircle />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? 'Importing...' : 'Import Questions'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportQuestionsModal; 