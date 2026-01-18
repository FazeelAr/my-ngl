// pages/RespondNGL.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function RespondNGL() {
  const { nglId } = useParams();
  const navigate = useNavigate();
  const [ngl, setNgl] = useState(null);
  const [responses, setResponses] = useState([]);
  const [message, setMessage] = useState('');
  const [responderName, setResponderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [nglId]);

  const fetchData = async () => {
    try {
      const nglData = await api.getNGL(nglId);
      setNgl(nglData);

      const respData = await api.getResponses(nglId);
      setResponses(respData);
    } catch (err) {
      setError('Failed to load NGL');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (ngl && !ngl.is_anonymous && !responderName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.submitResponse(nglId, message, responderName || null);
      setMessage('');
      setResponderName('');
      fetchData();
    } catch (err) {
      setError('Failed to submit response');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (!ngl) {
    return (
      <div className="text-white text-center mt-8">
        <p>NGL not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 mt-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{ngl.question}</h2>
        <p className="text-gray-600 text-sm">
          {ngl.is_anonymous ? '🔒 Anonymous NGL' : '👤 Non-Anonymous NGL'}
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Respond</h3>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!ngl.is_anonymous && (
          <input
            type="text"
            placeholder="Your name"
            value={responderName}
            onChange={(e) => setResponderName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        )}

        <textarea
          placeholder="Write your response..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Responses ({responses.length})
        </h3>

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">No responses yet. Be the first to respond!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => (
              <div key={resp.id} className="bg-white rounded-lg p-4 shadow-md">
                {resp.responder_name && (
                  <p className="text-sm font-semibold text-purple-600 mb-2">
                    {resp.responder_name}
                  </p>
                )}
                <p className="text-gray-800">{resp.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(resp.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}