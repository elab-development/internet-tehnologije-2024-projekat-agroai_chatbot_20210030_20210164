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


  const [mode, setMode] = useState('login');


  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    image_url: '',
  });


  const {
    imageUrl,
    uploading,
    uploadError,
    onFileSelect,
    removeImage,
  } = useImageUpload();

 
  useEffect(() => {
    if (imageUrl) {
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
    }
  }, [imageUrl]);


  const { error: authError, isLoading: authLoading, submitAuth } = useAuth();


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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const payload = { ...form, role: 'regular' };

    try {
      const userData = await submitAuth(mode, payload);

      if (mode === 'register') {

        setMode('login');
        resetAll();
      } else {

        console.log(userData.role);
 
        if (userData.role === 'regular') {
            window.location.replace("/home");
        } else {
          window.location.replace('/dashboard');
        }
      }
    } catch (_) {
    }
  };

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const fileInputRef = useRef();

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

          <img src="/images/logo.png" alt="AgroAI Logo" className="logo" />

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

          {authError && <div className="error">{authError}</div>}

          <h2>
            {mode === 'login'
              ? 'Login to AgroAI'
              : 'Create your AgroAI account'}
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
              <div className="avatar-upload-wrapper">
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

                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => onFileSelect(e.target.files[0])}
                  ref={fileInputRef}
                />

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

                {uploadError && (
                  <div className="error upload-error">{uploadError}</div>
                )}
              </div>
            )}

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
