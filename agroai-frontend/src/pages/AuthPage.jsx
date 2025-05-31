import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import TopLeafs from '../components/TopLeafs';

const slides = [
  '/images/slide1.jpg','/images/slide2.jpg','/images/slide3.jpg',
  '/images/slide4.jpg','/images/slide5.jpg','/images/slide6.jpg',
  '/images/slide7.jpg','/images/slide8.jpg','/images/slide9.jpg',
  '/images/slide10.jpg',
];

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    image_url: ''
  });
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // slider auto-advance
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent(i => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const url =
      mode === 'login'
        ? 'http://127.0.0.1:8000/api/login'
        : 'http://127.0.0.1:8000/api/register';

    try {
      const res = await axios.post(
        url,
        { ...form, role: 'regular' },
        { headers: { Accept: 'application/json' } }
      );

      const { token, id, name, email, role, imageUrl } = res.data;

      // store in sessionStorage
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem(
        'user',
        JSON.stringify({ id, name, email, role, imageUrl })
      );

      if (mode === 'register') {
        // switch to login view, clear sensitive fields
        setMode('login');
        setForm(f => ({
          ...f,
          password: '',
          password_confirmation: ''
        }));
      } else {
        // navigate to home (or dashboard)
        navigate('/home');
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
      {/* LEFT SLIDER */}
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

      {/* RIGHT FORM */}
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
            {mode === 'login'
              ? 'Login to AgroAI'
              : 'Create your AgroAI account'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* REGISTER: name + email */}
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

            {/* LOGIN: email */}
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

            {/* PASSWORDS */}
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

            {/* REGISTER: avatar */}
            {mode === 'register' && (
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <FileUploaderRegular
                  pubkey={process.env.REACT_APP_UPLOADCARE_PUBLIC_KEY}
                  sourceList="local, camera, facebook, gdrive"
                  classNameUploader="uc-light"
                  onChange={fileInfo => {
                    if (fileInfo?.cdnUrl) {
                      setForm(f => ({ ...f, image_url: fileInfo.cdnUrl }));
                    }
                  }}
                />
              </div>
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
