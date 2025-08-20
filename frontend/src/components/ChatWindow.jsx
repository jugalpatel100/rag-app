/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Moon, Sun, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useTheme } from '../hooks/useTheme';

const ChatWindow = ({ selectedCollection }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isDark, setIsDark } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (selectedCollection) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedCollection]);

  const fetchMessages = async () => {
    if (!selectedCollection) return;
    
    try {
      const response = await api.getMessages(selectedCollection);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedCollection || isLoading) return;

    const query = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.query(query, selectedCollection);
      
      if (response.data.success) {
        const assistantMessage = { role: 'assistant', content: response.data.answer };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.message || 'Query failed');
      }
    } catch (error) {
      toast.error('Query failed: ' + (error.response?.data?.message || error.message));
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedCollection) return;

    try {
      await api.clearMessages(selectedCollection);
      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      toast.error('Failed to clear chat');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const currentTime = formatTime(new Date());

  if (!selectedCollection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to RAG App
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a collection to start chatting with your documents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedCollection}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chat with your uploaded documents
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {messages.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Ask a question about your documents to get started
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isUser={message.role === 'user'}
                timestamp={index === messages.length - 1 ? currentTime : null}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
