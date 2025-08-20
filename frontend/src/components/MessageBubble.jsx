/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isUser, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-100 text-gray-800 dark:bg-blue-900 dark:text-blue-100'
            : 'bg-purple-100 text-gray-800 dark:bg-purple-900 dark:text-purple-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1 px-2">
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
