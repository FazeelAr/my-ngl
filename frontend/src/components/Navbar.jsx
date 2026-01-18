// components/Navbar.js
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ token, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-purple-600">
        NGL
      </Link>
      <div className="flex gap-4 items-center">
        {token && user ? (
          <>
            <span className="text-gray-700">{user.email}</span>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}