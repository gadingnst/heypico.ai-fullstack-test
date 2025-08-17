import React from 'react';
import ReactMarkdown from 'react-markdown';
import useAIChat from '@/modules/AIChat/hooks/useAIChat';
import PlacesMap from '@/modules/Map/components/PlacesMap';

/**
 * AI Chat Room component that handles the chat interface
 */
function AIChatRoom() {
  const {
    inputMessage,
    messages,
    isLoading,
    setInputMessage,
    sendMessage,
    clearMessages
  } = useAIChat();

  /**
   * Handle enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body p-0">
        {/* Messages Area */}
        <div className="h-[70vh] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-base-content/50 mt-20">
              <p>Start a conversation by sending a message!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${
                  message.role === 'user' ? 'chat-end' : 'chat-start'
                }`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        message.role === 'user'
                          ? 'bg-primary'
                          : 'bg-secondary'
                      }`}
                    >
                      {message.role === 'user' ? 'U' : 'AI'}
                    </div>
                  </div>
                </div>
                <div
                  className={`chat-bubble ${
                    message.role === 'user'
                      ? 'chat-bubble-primary'
                      : 'chat-bubble-secondary'
                  }`}
                >
                  <div
                    className="prose prose-sm max-w-none"
                    style={{
                      color: 'white',
                      '--tw-prose-body': 'white',
                      '--tw-prose-headings': 'white',
                      '--tw-prose-lead': 'white',
                      '--tw-prose-links': 'white',
                      '--tw-prose-bold': 'white',
                      '--tw-prose-counters': 'white',
                      '--tw-prose-bullets': 'white',
                      '--tw-prose-hr': 'white',
                      '--tw-prose-quotes': 'white',
                      '--tw-prose-quote-borders': 'white',
                      '--tw-prose-captions': 'white',
                      '--tw-prose-code': 'white',
                      '--tw-prose-pre-code': 'white',
                      '--tw-prose-pre-bg': 'rgba(255, 255, 255, 0.1)',
                      '--tw-prose-th-borders': 'white',
                      '--tw-prose-td-borders': 'white'
                    } as React.CSSProperties}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.places && message.places.length > 0 && (
                    <div className="mt-2">
                      <PlacesMap places={message.places} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-secondary">
                    AI
                  </div>
                </div>
              </div>
              <div className="chat-bubble chat-bubble-secondary">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-base-300 p-4">
          <div className="flex gap-2">
            <textarea
              className="textarea textarea-bordered flex-1 resize-none"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={isLoading}
            />
            {messages.length > 0 && (
              <button
                className="btn btn-warning"
                onClick={clearMessages}
                disabled={isLoading}
              >
                Clear
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatRoom;
