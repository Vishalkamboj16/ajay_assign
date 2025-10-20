import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';

const RecommendationPage = () => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentQuery = query;
    setQuery('');

    try {
      const response = await axios.post('http://localhost:8000/recommend', { query: currentQuery });
      const botMessage = { sender: 'bot', products: response.data };
      setConversation((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const errorMessage = { sender: 'bot', error: 'Oops! Something went wrong. Try again.' };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-800 to-indigo-600 text-white font-sans">
      
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold tracking-wider drop-shadow-lg text-yellow-300">
          FurniAI Curator
        </h1>
        <p className="text-gray-300 italic mt-1">
          Ask the oracle for luxurious furniture recommendations
        </p>
      </header>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto px-4 space-y-6 mb-4">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="bg-indigo-700 text-white p-4 rounded-2xl rounded-br-none max-w-xs md:max-w-md shadow-lg transform transition duration-300 hover:scale-[1.02] hover:bg-indigo-600">
                {msg.text}
              </div>
            ) : msg.products ? (
              <div className="bg-black/30 glass-card-style p-4 rounded-2xl rounded-tl-none shadow-2xl max-w-full">
                <p className="mb-4 italic text-yellow-400">{msg.pretext || 'Here are some curated items:'}</p>
                <div className="flex space-x-4 overflow-x-auto py-2">
                  {msg.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-2xl rounded-tl-none shadow-lg max-w-lg">
                {msg.error}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl rounded-tl-none bg-gray-800/50 animate-pulse">
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendQuery}
        className="flex max-w-5xl mx-auto p-4 bg-gray-900/80 backdrop-blur-sm border-t border-indigo-700 rounded-b-3xl shadow-xl space-x-3"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your ideal furniture piece..."
          disabled={isLoading}
          className="flex-grow p-3 rounded-full border border-indigo-500 bg-gray-800 text-white outline-none placeholder-gray-400 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 rounded-full bg-yellow-400 text-gray-900 font-bold shadow-xl hover:bg-yellow-300 hover:scale-105 transition duration-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default RecommendationPage;
