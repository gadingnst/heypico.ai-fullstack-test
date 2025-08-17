import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { LocalStorageService } from '../services/localStorage';
import type { ChatMessage, ChatSearchResponse, RegularChatResponse } from '../types';
import GoogleMapEmbed from '../components/GoogleMapEmbed';

/**
 * Chat interface component with Daisy UI styling
 */
function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load chat history on component mount
    const savedMessages = LocalStorageService.loadChatHistory();
    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save messages to local storage whenever messages change
    if (messages.length > 0) {
      LocalStorageService.saveChatHistory(messages);
    }
  }, [messages]);

  /**
   * Generate unique ID for messages
   */
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      content: inputMessage.trim(),
      isUser: true,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get chat history for context
      const chatHistory = LocalStorageService.getChatHistoryForAPI(messages);
      
      const response = await apiService.chatSearch({
        message: inputMessage.trim(),
        chat_history: chatHistory
      });

      let assistantMessage: ChatMessage;
      
      // Check if response is search result or regular chat
      if ('places' in response) {
        // Search response
        const searchResponse = response as ChatSearchResponse;
        assistantMessage = {
          id: generateId(),
          content: searchResponse.response_message,
          isUser: false,
          role: 'assistant',
          timestamp: new Date(),
          places: searchResponse.places
        };
        
        // Save location results
        if (searchResponse.places && searchResponse.places.length > 0) {
          LocalStorageService.saveLocationResults(searchResponse.places);
        }
      } else {
        // Regular chat response
        const chatResponse = response as RegularChatResponse;
        assistantMessage = {
          id: generateId(),
          content: chatResponse.response_message,
          isUser: false,
          role: 'assistant',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, assistantMessage]);

    } catch {
        const errorMessage: ChatMessage = {
          id: generateId(),
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          isUser: false,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🗺️ AI Location Assistant</h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-base-content/60 mt-8">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold mb-2">Halo! Saya AI Location Assistant</h2>
            <p className="text-lg">
              Tanya saya tentang lokasi, tempat makan, cafe, rumah sakit, atau tempat lainnya!
            </p>
            <div className="mt-4 text-sm opacity-75">
              Contoh: "Cari cafe enak di Jakarta" atau "Rumah sakit terdekat di Surabaya"
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                {message.isUser ? (
                  <div className="bg-primary text-primary-content w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    U
                  </div>
                ) : (
                  <div className="bg-secondary text-secondary-content w-10 h-10 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                )}
              </div>
            </div>
            <div className="chat-header">
              {message.isUser ? 'You' : 'AI Assistant'}
              <time className="text-xs opacity-50 ml-2">
                {message.timestamp.toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${
              message.isUser 
                ? 'chat-bubble-primary' 
                : 'chat-bubble-accent'
            }`}>
              <div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.places && message.places.length > 0 && (
                  <div className="mt-3">
                    <GoogleMapEmbed places={message.places} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Message */}
        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <div className="bg-secondary text-secondary-content w-10 h-10 rounded-full flex items-center justify-center">
                  🤖
                </div>
              </div>
            </div>
            <div className="chat-header">
              AI Assistant
              <time className="text-xs opacity-50 ml-2">
                {new Date().toLocaleTimeString()}
              </time>
            </div>
            <div className="chat-bubble chat-bubble-secondary">
              <div className="flex items-center space-x-2">
                <span className="loading loading-dots loading-sm"></span>
                <span>Sedang memproses...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-base-200 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Tanya tentang lokasi atau tempat..."
            className="input input-bordered flex-1"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? '' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;