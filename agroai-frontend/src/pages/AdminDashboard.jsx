import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaBars,
  FaEllipsisV,
  FaSignOutAlt,
  FaSearch,
  FaEdit,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';


export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuSel, setMenuSel] = useState('users'); 
  const [userInfo, setUserInfo] = useState({});    
  const [users, setUsers] = useState([]);           
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4; 

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const [models, setModels] = useState([]);         
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsSortAsc, setModelsSortAsc] = useState(false);

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const fileInputRef = useRef();

  // NEW: users sort state (by name)
  const [usersNameSortAsc, setUsersNameSortAsc] = useState(true);
  const toggleUsersNameSort = () => setUsersNameSortAsc((p) => !p);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
  
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
      role: userRole
    };
    setUserInfo(storedUser);

    fetchUsers();
  
  }, []);


  const fetchUsers = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const all = res.data.data || [];
      const nonAdmins = all.filter((u) => u.role !== 'administrator');
      setUsers(nonAdmins);
      setFilteredUsers(nonAdmins);
      setCurrentPage(1); 
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response && err.response.status === 403) {
  
        sessionStorage.clear();
        navigate('/');
      }
    }
  };


  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = !term ? users : users.filter((u) => u.name.toLowerCase().includes(term));

    // NEW: apply name sorting
    list = [...list].sort((a, b) =>
      usersNameSortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    setFilteredUsers(list);
    setCurrentPage(1); 
  }, [searchTerm, users, usersNameSortAsc]);

  
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  
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

    }
    sessionStorage.clear();
    navigate('/');
  };


  const openEditModal = (user) => {
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      image_url: user.imageUrl || '' 
    });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditForm({ id: '', name: '', email: '', image_url: '' });
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

 
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
        console.error('Error uploading to ImgBB:', err);
        alert('Upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };


  const handleRemoveAvatar = () => {
    setEditForm((f) => ({ ...f, image_url: '' }));
  };


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


  useEffect(() => {
    if (menuSel === 'models') {
      fetchTopModels();
    }
 
  }, [menuSel]);

  const fetchTopModels = async () => {
    setLoadingModels(true);
    try {
 
      const res = await axios.get(
        'https://huggingface.co/api/models?sort=downloads'
      );

      const topTen = (res.data || []).slice(0, 10).map((m) => ({
        id: m.modelId,
        downloads: m.downloads || 0
      }));

      topTen.sort((a, b) => b.downloads - a.downloads);
      setModels(topTen);
      setModelsSortAsc(false);
    } catch (err) {
      console.error('Error fetching models:', err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };


  const toggleModelSort = () => {
    const asc = !modelsSortAsc;
    const sorted = [...models].sort((a, b) => {
      return asc
        ? a.downloads - b.downloads
        : b.downloads - a.downloads;
    });
    setModels(sorted);
    setModelsSortAsc(asc);
  };


  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredUsers, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const indexOfFirstUser = (currentPage - 1) * usersPerPage;
  const indexOfLastUser = indexOfFirstUser + usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

 
  return (
    <div className="admin-dashboard">
      <div className="topbar" style={{height:"100px", marginBottom:"300px"}}>
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <FaBars size={20} color="rgb(140,201,64)" />
        </button>
        <div className="topbar-title">
          <Breadcrumbs 
            items={[
              { label: 'AdminDashboard' }, 
              { label: menuSel === 'users' ? 'Users' : 'Top AI Models' }
            ]}
          />
          <h2 style={{ marginLeft:"130px"}}>
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
          <FaEllipsisV
            size={18}
            color="white"
            style={{ marginLeft: '8px' }}
          />
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


      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{marginTop:"40px"}}>
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

 
      <div className="main-content" style={{marginTop:"100px"}}>
        {menuSel === 'users' ? (
          <>
            {/* Search Bar */}
            <div className="search-bar">
              <FaSearch
                color="rgb(140,201,64)"
                style={{ marginRight: '6px' }}
              />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>


            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th
                      className="sortable-header"
                      onClick={toggleUsersNameSort}
                      title="Sort by name"
                    >
                      Name{' '}
                      {usersNameSortAsc ? (
                        <FaSortAmountUp style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                      ) : (
                        <FaSortAmountDown style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                      )}
                    </th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u) => (
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
                          <FaEdit style={{ marginRight: '4px' }} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            {filteredUsers.length > usersPerPage && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo; Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${
                        pageNum === currentPage ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next &raquo;
                </button>
              </div>
            )}

 
            {showEditModal && (
              <div className="modal-overlay" onClick={closeEditModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Edit User</h3>
                    <button
                      className="close-modal-btn"
                      onClick={closeEditModal}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <form
                    onSubmit={handleEditSubmit}
                    className="edit-form"
                  >
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
                            onClick={() =>
                              fileInputRef.current.click()
                            }
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
   
            <div className="models-container">
              {loadingModels ? (
                <p>Loading top AI models…</p>
              ) : (
                <table className="models-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Model ID</th>
                      <th
                        className="sortable-header"
                        onClick={toggleModelSort}
                      >
                        Downloads{'   '}
                        {modelsSortAsc ? (
                          <FaSortAmountUp
                            style={{ verticalAlign: 'middle', marginLeft: '5px' }}
                          />
                        ) : (
                          <FaSortAmountDown
                            style={{ verticalAlign: 'middle', marginLeft: '5px'  }}
                          />
                        )}
                      </th>
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
