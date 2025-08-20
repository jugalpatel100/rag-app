/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Link, X, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

const UploadPanel = ({ selectedCollection, onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'pdf', label: 'PDF', icon: File },
    { id: 'website', label: 'URL', icon: Link }
  ];

  const handleFileSelect = (e) => {
    const files = [...e.target.files].filter(file => 
      file.type === 'application/pdf' && file.size <= 2 * 1024 * 1024
    );
    
    if (files.length + selectedFiles.length > 3) {
      toast.error('Maximum 3 PDFs allowed');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedCollection) {
      toast.error('Please select a collection first');
      return;
    }

    setIsUploading(true);
    
    try {
      if (activeTab === 'text' && textInput.trim()) {
        await api.indexText(textInput, selectedCollection);
        setTextInput('');
        toast.success('Text uploaded successfully!');
      } else if (activeTab === 'pdf' && selectedFiles.length > 0) {
        await api.indexFiles(selectedFiles, selectedCollection);
        setSelectedFiles([]);
        toast.success('PDFs uploaded successfully!');
      } else if (activeTab === 'website' && websiteUrl.trim()) {
        await api.indexWebsite(websiteUrl, selectedCollection);
        setWebsiteUrl('');
        toast.success('Website content uploaded successfully!');
      } else {
        toast.error('Please provide content to upload');
        return;
      }
      
      onUploadSuccess();
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const isUploadDisabled = !selectedCollection || isUploading || 
    (activeTab === 'text' && !textInput.trim()) ||
    (activeTab === 'pdf' && selectedFiles.length === 0) ||
    (activeTab === 'website' && !websiteUrl.trim());

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Add Data
      </h3>
      
      {/* Tabs */}
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'text' && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-24 p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          />
        )}

        {activeTab === 'pdf' && (
          <div>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload PDF files
                </p>
              </div>
            </label>

            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'website' && (
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          />
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleUpload}
          disabled={isUploadDisabled}
          className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload Text'}
        </motion.button>
      </div>
    </div>
  );
};

export default UploadPanel;
