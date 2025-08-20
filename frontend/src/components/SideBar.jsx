/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import CollectionCard from './CollectionCard';
import UploadPanel from './UploadPanel';

const Sidebar = ({ 
  selectedCollection, 
  onSelectCollection, 
  onDeleteCollection,
  onUploadSuccess 
}) => {
  const [collections, setCollections] = useState([]);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getCollections();
      console.log('Collections response:', response.data); // Debug log
      setCollections(response.data.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      setError('Failed to connect to backend. Make sure the server is running on port 8000.');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onSelectCollection(newCollectionName.trim());
      setCollections(prev => [...prev, newCollectionName.trim()]);
      setNewCollectionName('');
      setShowNewCollectionInput(false);
      toast.success('Collection created!');
    }
  };

  const handleDeleteCollection = async (collectionName) => {
    try {
      await api.deleteCollection(collectionName);
      setCollections(prev => prev.filter(name => name !== collectionName));
      onDeleteCollection(collectionName);
      toast.success('Collection deleted');
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  const handleUploadComplete = () => {
    onUploadSuccess();
    fetchCollections();
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          RAG App
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chat with your documents
        </p>
      </div>

      {/* Collections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Collections
          </h3>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={fetchCollections}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="space-y-2">
          {collections.map((collection) => (
            <CollectionCard
              key={collection}
              collection={collection}
              isSelected={selectedCollection === collection}
              onSelect={() => onSelectCollection(collection)}
              onDelete={() => handleDeleteCollection(collection)}
            />
          ))}

          {/* New Collection */}
          {showNewCollectionInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCollection}
                  className="flex-1 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewCollectionInput(false);
                    setNewCollectionName('');
                  }}
                  className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <CollectionCard
              isNewCollection
              onSelect={() => setShowNewCollectionInput(true)}
            />
          )}

          {!isLoading && collections.length === 0 && !error && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No collections yet. Create your first collection above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Panel */}
      <UploadPanel 
        selectedCollection={selectedCollection}
        onUploadSuccess={handleUploadComplete}
      />
    </div>
  );
};

export default Sidebar;
