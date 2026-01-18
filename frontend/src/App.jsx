// App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateNGL from './pages/CreateNGL';
import RespondNGL from './pages/RespondNGL';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyAuth = async () => {
    try {
      const payload = await api.verifyToken(token);
      if (payload.user_id) {
        setUser({ id: payload.user_id, email: payload.email });
      } else {
        setToken(null);
        localStorage.removeItem('token');
      }
    } catch {
      setToken(null);
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <Navbar token={token} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={token ? <Dashboard token={token} user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/create"
            element={token ? <CreateNGL token={token} /> : <Navigate to="/login" />}
          />
          <Route path="/ngl/:nglId" element={<RespondNGL />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;