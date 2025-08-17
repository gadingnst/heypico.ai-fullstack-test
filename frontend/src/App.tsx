import useAIChat from './modules/AIChat/hooks/useAIChat';

function App() {

  const {
    inputMessage,
    messages,
    isLoading,
    setInputMessage,
    sendMessage,
    // clearMessages
  } = useAIChat()

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
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            HeyPico AI Chat
          </h1>
          <p className="text-base-content/70">
            Chat dengan AI assistant
          </p>
        </div>

        {/* Chat Container */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
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
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Kirim'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
