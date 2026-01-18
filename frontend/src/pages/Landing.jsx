// pages/Landing.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [accessId, setAccessId] = useState('');
  const navigate = useNavigate();

  const handleAccessNGL = () => {
    if (accessId.trim()) {
      navigate(`/ngl/${accessId}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">
          Ask Anything Anonymously
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Share feedback without revealing your identity. Create your own or join an existing one.
        </p>

        <button
          onClick={() => navigate('/signup')}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold mb-3"
        >
          Create NGL (Sign Up)
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500 font-semibold mb-6"
        >
          Login
        </button>

        <div className="border-t pt-6">
          <p className="text-gray-600 text-sm mb-3">Or respond to an existing NGL:</p>
          <input
            type="text"
            placeholder="Enter NGL ID"
            value={accessId}
            onChange={(e) => setAccessId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAccessNGL}
            className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold"
          >
            Access NGL
          </button>
        </div>
      </div>
    </div>
  );
}