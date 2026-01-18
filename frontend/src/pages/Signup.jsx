// pages/Signup.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Signup({ onLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !username || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.signup(email, username, password);
      if (data.token) {
        onLogin(data.token, {
          id: data.user_id,
          email: data.email,
          username: data.username,
        });
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Create Account</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        <p className="text-center text-gray-600 mt-4 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}