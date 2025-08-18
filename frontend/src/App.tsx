import { useState } from 'react';
import AIChatRoom from '@/modules/AIChat/components/AIChatRoom';
import useAuthToken from '@/modules/Auth/hooks/useToken';
import { auth } from '@/modules/Auth/Auth.api';
import HttpAPI from '@/modules/HttpAPI';

function App() {
  const { token, setToken } = useAuthToken();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      const data = await auth({ username, password });
      setToken(data.token);
    } catch (error) {
      const { status } = await HttpAPI.getErrorResponse(error);
      if (status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
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
              disabled={isLoggingIn}
            />
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
            />
            <button
              className="btn btn-primary w-full"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                'Login'
              )}
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
