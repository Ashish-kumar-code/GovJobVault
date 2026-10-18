import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileForm from './pages/ProfileForm';
import Tools from './pages/Tools';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Resume from './pages/Resume';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="profiles/new" element={<ProfileForm />} />
            <Route path="profiles/edit/:id" element={<ProfileForm />} />
            <Route path="tools" element={<Tools />} />
            <Route path="applications" element={<Applications />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="resume" element={<Resume />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
