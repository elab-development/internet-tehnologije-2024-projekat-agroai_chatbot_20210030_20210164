import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
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
        <Route
          path="*"
          element={<Navigate to="/auth" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
