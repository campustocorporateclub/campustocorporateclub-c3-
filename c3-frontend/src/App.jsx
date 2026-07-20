import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import SessionForm from './pages/SessionForm';
import MyAttendance from './pages/MyAttendance';
import AllAttendance from './pages/AllAttendance';
import Hero from './components/hero/Hero';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home-preview" element={<Hero />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Login />} />




          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SessionForm />
              </ProtectedRoute>
            }
          />


          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <MyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/all"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AllAttendance />
              </ProtectedRoute>
            }
          />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;