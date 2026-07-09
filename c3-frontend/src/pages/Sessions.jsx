import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/sessions', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSessions(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user.token]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading sessions...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Sessions</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {sessions.length === 0 ? (
        <p className="text-gray-400">No sessions logged yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Link
              key={session._id}
              to={`/sessions/${session._id}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
            >
              <img
                src={session.coverImage}
                alt={session.topic}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <span className="text-xs uppercase text-blue-400">{session.type}</span>
                <h2 className="text-lg font-semibold mt-1">{session.topic}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(session.date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;