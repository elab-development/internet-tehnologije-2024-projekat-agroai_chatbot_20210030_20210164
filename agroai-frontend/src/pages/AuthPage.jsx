import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TopLeafs from '../components/TopLeafs';

const slides = [
  '/images/slide1.jpg','/images/slide2.jpg','/images/slide3.jpg',
  '/images/slide4.jpg','/images/slide5.jpg','/images/slide6.jpg',
  '/images/slide7.jpg','/images/slide8.jpg','/images/slide9.jpg',
  '/images/slide10.jpg',
];

const CLOUD_NAME    = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', image_url: ''
  });
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent(i => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const uploadImage = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setError('');
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', UPLOAD_PRESET);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        data
      );
      setForm(f => ({ ...f, image_url: res.data.secure_url }));
    } catch {
      setError('Image upload failed.');
    }
  };

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const url = mode === 'login'
      ? 'http://127.0.0.1:8000/api/login'
      : 'http://127.0.0.1:8000/api/register';
    const payload = { ...form, role: 'regular' };
    try {
      const res = await axios.post(url, payload, {
        headers: { Accept: 'application/json' }
      });
      localStorage.setItem('token', res.data.token);
      if (mode === 'register') {
        setMode('login');
        setForm(f => ({ ...f, password: '', password_confirmation: '' }));
      } else {
        navigate('/chats');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Something went wrong';
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`slide${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="line-container">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`line${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-container">
          <TopLeafs />
          <img src="/images/logo.png" alt="Logo" className="logo" />

          <div className="toggle-buttons">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Login
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <h2>
            {mode === 'login' ? 'Login to AgroAI' : 'Create your AgroAI account'}
          </h2>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-row">
                <div className="input-group">
                  <FaUser className="icon" />
                  <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <FaEnvelope className="icon" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="input-group">
                <FaEnvelope className="icon" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className={mode === 'register' ? 'form-row' : ''}>
              <div className="input-group">
                <FaLock className="icon" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {mode === 'register' && (
                <div className="input-group">
                  <FaLock className="icon" />
                  <input
                    name="password_confirmation"
                    type="password"
                    placeholder="Confirm Password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>

            {mode === 'register' && (
              <>
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileRef.current.click()}
                >
                  <FaImage /> Upload avatar
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  style={{ display: 'none' }}
                />
              </>
            )}

            <button type="submit">
              {mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
