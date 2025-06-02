import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!token ? <AuthPage /> : <Navigate to="/chats" replace />}
        />
        {/* Dodajte svoje zaštićene rute ovde, npr. /chats */}
        <Route path="/" element={<AuthPage/>} />
        <Route path="/home" element={token ? <Home/> : <Navigate to="/auth" replace />} />
        <Route path="/dashboard" element={token ? <AdminDashboard/> : <Navigate to="/auth" replace />} />
        <Route path="/chats" element={token ? <Chat /> : <Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
