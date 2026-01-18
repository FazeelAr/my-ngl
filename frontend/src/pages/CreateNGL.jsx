// pages/CreateNGL.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CreateNGL({ token }) {
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.createNGL(question, isAnonymous, token);
      if (data.ngl_id) {
        alert(`NGL Created! ID: ${data.ngl_id}`);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Failed to create NGL');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Create NGL</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <textarea
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
        />

        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 mr-3"
            />
            <span className="text-gray-700">Allow Anonymous Responses</span>
          </label>
          <p className="text-gray-500 text-xs mt-2">
            {isAnonymous
              ? 'Responders can answer without providing their name'
              : 'Responders must provide their name'}
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create NGL'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-3 py-2 text-purple-600 hover:text-purple-700 font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}