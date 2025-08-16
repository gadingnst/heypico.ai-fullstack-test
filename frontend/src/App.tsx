import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            HeyPico AI Assistant
          </h1>
          <p className="text-base-content/70">
            Tanyakan lokasi apapun, saya akan membantu Anda!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

export default App;
