import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { apiService } from '../services/api';
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
    scrollToBottom();
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
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: generateId(),
      type: 'assistant',
      content: 'Sedang mencari...',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.chatSearch({
        message: inputMessage.trim(),
      });

      // Remove loading message and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const assistantMessage: ChatMessage = {
          id: generateId(),
          type: 'assistant',
          content: response.response_message,
          timestamp: new Date(),
          places: response.places,
        };
        return [...withoutLoading, assistantMessage];
      });
    } catch {
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: generateId(),
          type: 'assistant',
          content: 'Maaf, terjadi kesalahan saat mencari lokasi. Silakan coba lagi.',
          timestamp: new Date(),
        };
        return [...withoutLoading, errorMessage];
      });
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
          <div key={message.id} className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                {message.type === 'user' ? (
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
              {message.type === 'user' ? 'You' : 'AI Assistant'}
              <time className="text-xs opacity-50 ml-2">
                {message.timestamp.toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${
              message.type === 'user' 
                ? 'chat-bubble-primary' 
                : message.isLoading 
                  ? 'chat-bubble-secondary' 
                  : 'chat-bubble-accent'
            }`}>
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <span className="loading loading-dots loading-sm"></span>
                  <span>{message.content}</span>
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.places && message.places.length > 0 && (
                    <div className="mt-3">
                      <GoogleMapEmbed places={message.places} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
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