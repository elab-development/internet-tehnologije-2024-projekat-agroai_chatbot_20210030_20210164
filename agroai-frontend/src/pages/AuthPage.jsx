import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

  // “mode” can be 'login' or 'register'
  const [mode, setMode] = useState('login');

  // We keep a single “form” object for all fields:
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    image_url: '',
  });

  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Current slide index:
  const [current, setCurrent] = useState(0);

  // A ref to trigger the hidden <input type="file" />
  const fileInputRef = useRef();

  // -----------------------------------------------------
  // 1) SLIDER: Auto‐advance every 5 seconds
  // -----------------------------------------------------
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // -----------------------------------------------------
  // 2) RESET EVERYTHING when switching modes (especially into 'register')
  // -----------------------------------------------------
  const resetAll = () => {
    setError('');
    setUploadError('');
    setUploading(false);

    // Reset form fields (clearing out name/email/passwords/avatar)
    setForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      image_url: '',
    });
  };

  // Whenever mode changes, clear everything:
  useEffect(() => {
    resetAll();
  }, [mode]);

  // -----------------------------------------------------
  // 3) HANDLE FORM FIELD CHANGES
  // -----------------------------------------------------
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // -----------------------------------------------------
  // 4) HANDLE AVATAR UPLOAD to ImgBB
  // -----------------------------------------------------
  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);

    try {
      // 1) Convert file → Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fullDataUrl = reader.result; // "data:image/png;base64,AAAA..."
        const base64only = fullDataUrl.split(',')[1]; // strip the metadata

        // 2) Build FormData
        const data = new FormData();
        data.append('image', base64only);
        data.append('expiration', '600'); // optional: auto-delete after 600s

        // 3) POST to ImgBB
        const imgbbKey = process.env.REACT_APP_IMGBB_API_KEY;
        const url = `https://api.imgbb.com/1/upload?key=${imgbbKey}`;
        const res = await axios.post(url, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 4) On success, store the returned display_url:
        if (res.data && res.data.data && res.data.data.display_url) {
          setForm((f) => ({
            ...f,
            image_url: res.data.data.display_url,
          }));
        } else {
          setUploadError('Upload succeeded, but no preview URL was returned.');
        }
        setUploading(false);
      };

      reader.onerror = () => {
        setUploadError('Failed to read file.');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Image upload failed. Please try again.');
      setUploading(false);
    }
  };

  // -----------------------------------------------------
  // 5) REMOVE (CANCEL) UPLOADED AVATAR
  // -----------------------------------------------------
  const handleRemoveAvatar = () => {
    setForm((f) => ({ ...f, image_url: '' }));
    setUploadError('');
    setUploading(false);
  };

  // -----------------------------------------------------
  // 6) SUBMIT FORM (LOGIN or REGISTER)
  // -----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint =
      mode === 'login'
        ? 'http://127.0.0.1:8000/api/login'
        : 'http://127.0.0.1:8000/api/register';

    try {
      const payload = { ...form, role: 'regular' };
      const res = await axios.post(endpoint, payload, {
        headers: { Accept: 'application/json' },
      });

      // Store in sessionStorage (token + user data)
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userId', res.data.id);
      sessionStorage.setItem('userName', res.data.name);
      sessionStorage.setItem('userEmail', res.data.email);
      sessionStorage.setItem('userRole', res.data.role);
      sessionStorage.setItem('userImage', res.data.imageUrl || '');

      if (mode === 'register') {
        // After register, switch to login and reset fields 
        setMode('login');
        resetAll();
      } else {
        // On successful login, go to /home
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
      {/* ====================== SLIDER (Left Side) ====================== */}
      <div className="auth-left">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`slide${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}

        {/* Horizontal “lines” navigation */}
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

      {/* ====================== FORM (Right Side) ====================== */}
      <div className="auth-right">
        <div className="auth-container">
          <TopLeafs />

          <img src="/images/logo.png" alt="AgroAI Logo" className="logo" />

          {/* Toggle between “Login” / “Register” */}
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

          {error && <div className="error">{error}</div>}

          <h2>
            {mode === 'login'
              ? 'Login to AgroAI'
              : 'Create your AgroAI account'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* ===== REGISTER: NAME + EMAIL ===== */}
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

            {/* ===== LOGIN: EMAIL ===== */}
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

            {/* ===== PASSWORD (+ CONFIRM if registering) ===== */}
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

            {/* ===== REGISTER: UPLOAD AVATAR ===== */}
            {mode === 'register' && (
              <div className="avatar-upload-wrapper">
                {/* 
                  Our custom “Upload an avatar image” button covers the file input.
                  When user clicks it, we forward click to hidden <input type="file" />.
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

                {/* 
                  Hidden file input to capture local files. 
                  onChange → handleAvatarFile
                */}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFile}
                  ref={fileInputRef}
                />

                {/* As soon as we have an image, show a small thumbnail + remove button to the right */}
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
                      onClick={handleRemoveAvatar}
                      title="Remove avatar"
                    >
                      <FaTimesCircle size={18} color="rgb(255, 80, 80)" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ===== SUBMIT BUTTON ===== */}
            <button type="submit">
              {mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
