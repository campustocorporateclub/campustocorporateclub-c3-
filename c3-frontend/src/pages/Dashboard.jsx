import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-gray-400 mb-6">Role: {user?.role}</p>
      <Link to="/sessions" className="text-blue-400 underline mb-4 inline-block">
        View Sessions
      </Link>
      <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;