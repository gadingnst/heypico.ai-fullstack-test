import React from 'react';
import useAIChat from '@/modules/AIChat/hooks/useAIChat';

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
              <p>Mulai percakapan dengan mengirim pesan!</p>
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
                  {message.content}
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
              placeholder="Ketik pesan Anda..."
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
