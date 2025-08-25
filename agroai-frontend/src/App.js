import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  useEffect(() => {
    // check sessionStorage every second
    const interval = setInterval(() => {
      const newToken = sessionStorage.getItem('token');
      setToken(newToken);
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={token ? <AdminDashboard /> : <Navigate to="/" replace />} />
        <Route path="/chats" element={token ? <Chat /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
