import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaBars,
  FaEllipsisV,
  FaSignOutAlt,
  FaSearch,
  FaEdit,
  FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ─── State ─────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuSel, setMenuSel] = useState('users'); // 'users' or 'models'
  const [userInfo, setUserInfo] = useState({});     // logged‐in admin
  const [users, setUsers] = useState([]);           // list of all non-admin users
  const [searchTerm, setSearchTerm] = useState(''); // filter by name
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [models, setModels] = useState([]);         // top AI models
  const [loadingModels, setLoadingModels] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const fileInputRef = useRef();

  // ─── 1) On mount: check token + load admin info + fetch users ─────────────
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Pull stored admin info from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    const userId = sessionStorage.getItem('userId');
    const userImage = sessionStorage.getItem('userImage');
    const userName = sessionStorage.getItem('userName');
    const userRole = sessionStorage.getItem('userRole');
    const storedUser = {
        email: userEmail,
        id: userId,
        image_url: userImage,
        name: userName,
        role: userRole,
    };
    setUserInfo(storedUser);

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── 2) Fetch all users (filter out administrators) ─────────────────────────
  const fetchUsers = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      // res.data.data is array of all users (including admin); filter out admins
      const all = res.data.data || [];
      const nonAdmins = all.filter((u) => u.role !== 'administrator');
      console.log(nonAdmins);
      setUsers(nonAdmins);
      setFilteredUsers(nonAdmins);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response && err.response.status === 403) {
        // not an admin → log out
        sessionStorage.clear();
        navigate('/');
      }
    }
  };

  // ─── 3) Filter users whenever searchTerm or users change ────────────────────
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) => u.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, users]);

  // ─── 4) Toggle sidebar ─────────────────────────────────────────────────────
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // ─── 5) Logout routine ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );
    } catch (_) {
      // ignore
    }
    sessionStorage.clear();
    navigate('/');
  };

  // ─── 6) Edit modal open/close ───────────────────────────────────────────────
  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      image_url: user.image_url || ''
    });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({ id: '', name: '', email: '', image_url: '' });
  };

  // ─── 7) Handle form changes ────────────────────────────────────────────────
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  // ─── 8) Upload new avatar to imgBB ─────────────────────────────────────────
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const apiKey = process.env.REACT_APP_IMGBB_API_KEY;
    if (!apiKey) {
      alert('Please set REACT_APP_IMGBB_API_KEY in your .env');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      // strip off the "data:*/*;base64," prefix
      const base64data = reader.result.split(',')[1];
      try {
        const formData = new FormData();
        formData.append('image', base64data);

        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          formData
        );
        const url = res.data.data.url;
        setEditForm((f) => ({ ...f, image_url: url }));
      } catch (err) {
        console.error('Error uploading to imgBB:', err);
        alert('Upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── 9) Remove avatar from edit form ───────────────────────────────────────
  const handleRemoveAvatar = () => {
    setEditForm((f) => ({ ...f, image_url: '' }));
  };

  // ─── 10) Submit updated user data ──────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const { id, name, email, image_url } = editForm;
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/api/users/${id}`,
        { name, email, image_url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );
      // Update local users list
      const updated = res.data.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      closeEditModal();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Update failed.');
    }
  };

  // ─── 11) Fetch Top AI Models when selected ─────────────────────────────────
  useEffect(() => {
    if (menuSel === 'models') {
      fetchTopModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuSel]);

  const fetchTopModels = async () => {
    setLoadingModels(true);
    try {
      // Example: using Hugging Face API to get models sorted by downloads
      const res = await axios.get(
        'https://huggingface.co/api/models?sort=downloads'
      );
      // res.data is an array of model objects; take first 10
      const topTen = (res.data || []).slice(0, 10).map((m) => ({
        id: m.modelId,
        downloads: m.downloads || 0
      }));
      setModels(topTen);
    } catch (err) {
      console.error('Error fetching models:', err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // ─── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-dashboard">
      {/* ─────────────────── Top Bar ───────────────────────────────────────────── */}
      <div className="topbar">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <FaBars size={20} color="rgb(140,201,64)" />
        </button>
        <div className="topbar-title">
          <h2>
            {menuSel === 'users' ? 'Manage Users' : 'Top AI Models'}
          </h2>
        </div>
        <div
          className="user-info-dropdown"
          onClick={() => setShowUserDropdown((p) => !p)}
        >
          <img
            src={userInfo.image_url || '/images/default-avatar.png'}
            alt="Admin Avatar"
            className="user-avatar"
          />
          <span className="user-name">{userInfo.name}</span>
          <FaEllipsisV size={18} color="white" style={{ marginLeft: '8px' }} />
          {showUserDropdown && (
            <div className="user-dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '6px' }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────── Sidebar ───────────────────────────────────────────── */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Admin Menu</h3>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${
              menuSel === 'users' ? 'active' : ''
            }`}
            onClick={() => setMenuSel('users')}
          >
            Users
          </li>
          <li
            className={`sidebar-item ${
              menuSel === 'models' ? 'active' : ''
            }`}
            onClick={() => setMenuSel('models')}
          >
            Top AI Models
          </li>
        </ul>
      </div>

      {/* ─────────────────── Main Content ──────────────────────────────────────── */}
      <div className="main-content">
        {menuSel === 'users' ? (
          <>
            {/* Search Bar */}
            <div className="search-bar">
              <FaSearch color="rgb(140,201,64)" style={{ marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Users Table */}
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <img
                          src={u.imageUrl || '/images/default-avatar.png'}
                          alt="avatar"
                          className="table-avatar"
                        />
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(u)}
                        >
                          <FaEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Edit User Modal ─────────────────────────────────────────────── */}
            {showEditModal && (
              <div className="modal-overlay" onClick={closeEditModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Edit User</h3>
                    <button className="close-modal-btn" onClick={closeEditModal}>
                      <FaTimes />
                    </button>
                  </div>
                  <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Avatar</label>
                      <div className="avatar-upload-section">
                        {editForm.image_url ? (
                          <div className="avatar-preview-wrapper">
                            <img
                              src={editForm.image_url}
                              alt="preview"
                              className="avatar-preview"
                            />
                            <button
                              type="button"
                              className="remove-avatar-btn"
                              onClick={handleRemoveAvatar}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="upload-avatar-btn"
                            onClick={() => fileInputRef.current.click()}
                          >
                            {uploading ? 'Uploading…' : 'Upload Avatar'}
                          </button>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleAvatarSelect}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="save-btn">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={closeEditModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Top AI Models View */}
            <div className="models-container">
              {loadingModels ? (
                <p>Loading top AI models…</p>
              ) : (
                <table className="models-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Model ID</th>
                      <th>Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m, idx) => (
                      <tr key={m.id}>
                        <td>{idx + 1}</td>
                        <td>{m.id}</td>
                        <td>{m.downloads.toLocaleString()}</td>
                      </tr>
                    ))}
                    {models.length === 0 && !loadingModels && (
                      <tr>
                        <td colSpan="3" className="no-data">
                          No models available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
