/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-6"
    >
      <div className="bg-purple-100 dark:bg-purple-900 rounded-2xl px-4 py-3">
        <div className="typing-indicator flex gap-1">
          <span className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full"></span>
          <span className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full"></span>
          <span className="w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full"></span>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
