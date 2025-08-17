import AIChatRoom from '@/modules/AIChat/components/AIChatRoom';

function App() {

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            HeyPico AI Chat
          </h1>
          <p className="text-base-content/70">
            Chat with AI assistant
          </p>
        </div>

        {/* Chat Container */}
        <AIChatRoom />
      </div>
    </div>
  );
}

export default App;
