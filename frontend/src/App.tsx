import { useState } from 'react';
import AIChatRoom from '@/modules/AIChat/components/AIChatRoom';
import { BACKEND_URL } from '@/configs/envs';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="card w-96 bg-base-200 shadow-xl">
          <div className="card-body space-y-4">
            <h2 className="card-title">Login</h2>
            {error && <p className="text-error text-sm">{error}</p>}
            <input
              className="input input-bordered w-full"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary w-full" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            HeyPico AI Chat
          </h1>
          <p className="text-base-content/70">
            Chat with AI Location assistant
          </p>
          <button className="btn btn-sm btn-outline absolute right-0 top-0" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Chat Container */}
        <AIChatRoom />

      </div>
    </div>
  );
}

export default App;
