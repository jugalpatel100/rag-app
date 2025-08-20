import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/SideBar';
import ChatWindow from './components/ChatWindow';

function App() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const { isDark } = useTheme();

  const handleSelectCollection = (collectionName) => {
    setSelectedCollection(collectionName);
  };

  const handleDeleteCollection = (collectionName) => {
    if (selectedCollection === collectionName) {
      setSelectedCollection(null);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh any necessary data
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#374151' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      
      <Sidebar
        selectedCollection={selectedCollection}
        onSelectCollection={handleSelectCollection}
        onDeleteCollection={handleDeleteCollection}
        onUploadSuccess={handleUploadSuccess}
      />

      <ChatWindow selectedCollection={selectedCollection} />
    </div>
  );
}

export default App;
