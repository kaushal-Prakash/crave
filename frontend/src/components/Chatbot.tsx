'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hi there! I am Crave AI Assistant. What ingredients do you have?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In production you would point to your actual backend URL (e.g. from env)
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          chat_history: messages.slice(1) // exclude the first greeting message if you want, or send all
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I am having trouble connecting to the kitchen right now.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl border border-zinc-200 dark:border-zinc-800 rounded-2xl w-80 sm:w-96 overflow-hidden mb-4 flex flex-col h-[500px] max-h-[80vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 flex justify-between items-center text-white shadow-md">
                <div className="flex items-center gap-2 font-semibold">
                  <FaRobot className="text-xl" />
                  <span>Crave AI Assistant</span>
                </div>
                <button
                  onClick={toggleChat}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <div className="chatbot-markdown">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 p-3 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-zinc-700 max-w-[85%] text-sm flex gap-1 items-center">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a recipe..."
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 text-white dark:border-zinc-700 rounded-full px-4 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-md"
                >
                  <FaPaperPlane className="text-xs ml-[-2px]" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl text-white transition-all duration-300 ${
            isOpen ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:shadow-orange-500/50'
          }`}
        >
          {isOpen ? <FaTimes /> : <FaRobot />}
        </motion.button>
      </div>
    </>
  );
}
