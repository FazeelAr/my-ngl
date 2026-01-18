// pages/Dashboard.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard({ token, user }) {
  const [ngls, setNgls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNGLs();
  }, []);

  const fetchNGLs = async () => {
    try {
      if (token && user) {
        const data = await api.getUserNGLs(user.id, token);
        if (data && Array.isArray(data)) {
          setNgls(data);
        } else {
          console.error('Failed to fetch NGLs:', data);
        }
      }
    } catch (err) {
      console.error('Error fetching NGLs:', err);
    }
    setLoading(false);
  };

  const copyToClipboard = (nglId) => {
    navigator.clipboard.writeText(nglId);
    alert('NGL ID copied: ' + nglId);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mt-8">
      <h2 className="text-3xl font-bold text-white mb-6">Your NGLs</h2>

      <Link
        to="/create"
        className="mb-6 inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
      >
        + Create New NGL
      </Link>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : ngls.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">You haven't created any NGLs yet.</p>
          <Link
            to="/create"
            className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create Your First NGL
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ngls.map((ngl) => (
            <div key={ngl.id} className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{ngl.question}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {ngl.is_anonymous ? '🔒 Anonymous' : '👤 Non-Anonymous'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(ngl.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Copy ID
                </button>
              </div>
              <Link
                to={`/ngl/${ngl.id}`}
                className="w-full mt-4 inline-block text-center py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                View Responses
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}