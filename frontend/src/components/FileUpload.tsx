import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useResumeStore } from '../store/resumeStore';


interface FileUploadProps {
  setIsLoading: (isLoading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { setResume } = useResumeStore();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const parsedResume = await apiService.parseResume(selectedFile);
      // Persist parsed resume into the central store
      setResume(parsedResume);
      navigate('/builder');
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Failed to parse resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const jsonData = JSON.parse(event.target.result as string);
            // Load JSON resume directly into the central store
            setResume(jsonData);
            navigate('/builder');
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Failed to parse JSON file. Please ensure it\'s a valid JSON format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className="text-gray-600">
            Drag and drop your resume file here, or{' '}
            <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
            </label>
          </p>
          <p className="text-sm text-gray-500">Supported formats: PDF, DOCX</p>
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
          <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
          >
            Upload & Parse
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-500 mb-2">Or import from JSON file</p>
        <label className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 cursor-pointer inline-block">
          Import JSON
          <input
            type="file"
            className="hidden"
            accept=".json"
            onChange={handleJsonUpload}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;