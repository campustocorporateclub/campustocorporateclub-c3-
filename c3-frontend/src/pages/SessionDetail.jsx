import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SessionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSession(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, user.token]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-400 p-8">{error}</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/sessions" className="text-blue-400 text-sm mb-4 inline-block">
        ← Back to Sessions
      </Link>

      <img
        src={session.coverImage}
        alt={session.topic}
        className="w-full max-h-96 object-cover rounded-lg mb-6"
      />

      <span className="text-xs uppercase text-blue-400">{session.type}</span>
      <h1 className="text-2xl font-bold mt-1">{session.topic}</h1>
      <p className="text-gray-400 mt-1">
        {new Date(session.date).toLocaleDateString()} · Handled by {session.handledBy}
      </p>

      {session.summary && (
        <p className="text-gray-200 mt-4 leading-relaxed">{session.summary}</p>
      )}

      {session.images?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {session.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${session.topic} photo ${i + 1}`}
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionDetail;