/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

const CollectionCard = ({ collection, isSelected, onSelect, onDelete, isNewCollection = false }) => {
  if (isNewCollection) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onSelect}
        className="p-4 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 cursor-pointer transition-colors border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-200 dark:bg-green-800 flex items-center justify-center">
            <Plus className="w-4 h-4 text-green-600 dark:text-green-300" />
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            New Collection
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`p-4 rounded-xl cursor-pointer transition-colors group ${
        isSelected 
          ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700' 
          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
            {collection}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Collection</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CollectionCard;
