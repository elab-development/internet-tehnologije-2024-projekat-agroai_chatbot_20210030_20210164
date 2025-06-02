import { useState, useEffect, useRef } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaImage,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TopLeafs from '../components/TopLeafs';

// Import our custom hooks:
import useImageUpload from '../hooks/useImageUpload';
import useAuth from '../hooks/useAuth';

const slides = [
  '/images/slide1.jpg',
  '/images/slide2.jpg',
  '/images/slide3.jpg',
  '/images/slide4.jpg',
  '/images/slide5.jpg',
  '/images/slide6.jpg',
  '/images/slide7.jpg',
  '/images/slide8.jpg',
  '/images/slide9.jpg',
  '/images/slide10.jpg',
];

export default function AuthPage() {
  const navigate = useNavigate();

  // ─── 1) “mode” is either 'login' or 'register' ────────────────────────
  const [mode, setMode] = useState('login');

  // ─── 2) Single form object holding all fields ────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    image_url: '',
  });

  // ─── 3) Hook for ImgBB upload ────────────────────────────────────────
  const {
    imageUrl,
    uploading,
    uploadError,
    onFileSelect,
    removeImage,
  } = useImageUpload();

  // Whenever imageUrl changes, copy it into form.image_url
  useEffect(() => {
    if (imageUrl) {
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
    }
  }, [imageUrl]);

  // ─── 4) Hook for login/register API calls ────────────────────────────
  const { error: authError, isLoading: authLoading, submitAuth } = useAuth();

  // ─── 5) Reset everything when switching mode ──────────────────────────
  const resetAll = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      image_url: '',
    });
    removeImage();
  };

  useEffect(() => {
    resetAll();
  }, [mode]);

  // ─── 6) Handle typable fields ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ─── 7) Handle form submission ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload with “regular” role
    const payload = { ...form, role: 'regular' };

    try {
      const userData = await submitAuth(mode, payload);

      if (mode === 'register') {
        // On successful registration, switch to login
        setMode('login');
        resetAll();
      } else {
        // On successful login, navigate based on role
        if (userData.role === 'regular') {
          navigate('/home');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (_) {
      // authError is already set by useAuth
    }
  };

  // ─── 8) Slider auto-advance every 5 seconds ──────────────────────────
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // ─── 9) Input ref for the hidden <input type="file" /> ──────────────
  const fileInputRef = useRef();

  return (
    <div className="auth-page">
      {/* ====================== SLIDER (Left) ====================== */}
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

      {/* ====================== FORM (Right) ====================== */}
      <div className="auth-right">
        <div className="auth-container">
          <TopLeafs />

          <img src="/images/logo.png" alt="AgroAI Logo" className="logo" />

          {/* Toggle Buttons */}
          <div className="toggle-buttons">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          {/* Display any authentication error */}
          {authError && <div className="error">{authError}</div>}

          <h2>
            {mode === 'login'
              ? 'Login to AgroAI'
              : 'Create your AgroAI account'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* ===== REGISTER: Name + Email side by side ===== */}
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

            {/* ===== LOGIN: Email only ===== */}
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

            {/* ===== PASSWORD + CONFIRM (if register) ===== */}
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

            {/* ===== REGISTER: Upload Avatar ===== */}
            {mode === 'register' && (
              <div className="avatar-upload-wrapper">
                {/* 
                  We place a <label> over the hidden <input type="file" />. 
                  If there's already an imageUrl, show a check icon + text. 
                  If uploading, show “Uploading…”
                  Otherwise, show the “Upload an avatar image” prompt.
                */}
                <label
                  htmlFor="avatar-input"
                  className={`upload-cover ${
                    form.image_url ? 'uploaded' : ''
                  }`}
                >
                  {form.image_url ? (
                    <>
                      <FaCheckCircle /> Avatar Uploaded!
                    </>
                  ) : uploading ? (
                    'Uploading…'
                  ) : (
                    <>
                      <FaImage /> Upload an avatar image
                    </>
                  )}
                </label>

                {/* Hidden <input type="file" /> */}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => onFileSelect(e.target.files[0])}
                  ref={fileInputRef}
                />

                {/* If an avatar is set, show its thumbnail + a “cancel” button */}
                {form.image_url && (
                  <>
                    <img
                      src={form.image_url}
                      alt="avatar thumbnail"
                      className="avatar-thumb"
                    />
                    <button
                      type="button"
                      className="remove-avatar-btn"
                      onClick={() => {
                        removeImage();
                        setForm((f) => ({ ...f, image_url: '' }));
                      }}
                      title="Remove avatar"
                    >
                      <FaTimesCircle size={18} color="rgb(255, 80, 80)" />
                    </button>
                  </>
                )}

                {/* Show any upload‐specific error */}
                {uploadError && (
                  <div className="error upload-error">{uploadError}</div>
                )}
              </div>
            )}

            {/* ===== SUBMIT BUTTON ===== */}
            <button type="submit" disabled={authLoading}>
              {authLoading
                ? mode === 'login'
                  ? 'Logging in…'
                  : 'Creating…'
                : mode === 'login'
                ? 'Login'
                : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
