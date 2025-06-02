import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaBars,
  FaEllipsisV,
  FaSignOutAlt,
  FaPlus,
  FaPaperPlane
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // ─── State ───────────────────────────────────────────────────────────────
  const [chats, setChats] = useState([]);           // all chats
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);     // messages for activeChat
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});     // { name, image_url, ... }
  const [menuOpen, setMenuOpen] = useState(false);  // three‐dots dropdown

  // ─── 1) On mount: load user + fetch all chats ────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Pull the stored user object (saved at login time)
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

    // Fetch chat list
    axios
      .get('http://127.0.0.1:8000/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
        // Laravel Resource: actual array in res.data.data
        const chatArray = res.data.data || [];
        setChats(chatArray);

        if (chatArray.length > 0) {
          setActiveChat(chatArray[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching chats:', err);
        sessionStorage.clear();
        navigate('/');
      });
  }, [navigate]);

  // ─── 2) Whenever activeChat changes, load its messages ─────────────────────
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    const token = sessionStorage.getItem('token');
    axios
      .get(`http://127.0.0.1:8000/api/chats/${activeChat.id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
        const msgs = res.data.data || [];
        setMessages(msgs);
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        setMessages([]);
      });
  }, [activeChat]);

  // ─── 3) Auto‐scroll to bottom when messages change ─────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ─── 4) Send a new message ─────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/chats/${activeChat.id}/messages`,
        { content: newMessage.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );
      // Append newly created message (with AI response embedded)
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // ─── 5) Create a brand‐new chat ────────────────────────────────────────────
  const handleNewChat = async () => {
    const token = sessionStorage.getItem('token');
    const title = window.prompt('Enter a title for your new chat:');
    if (!title) return;

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/chats',
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );
      const newChat = res.data.data;
      setChats((prev) => [...prev, newChat]);
      setActiveChat(newChat);
      setSidebarOpen(true);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  // ─── 6) Logout ────────────────────────────────────────────────────────────
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
      /* ignore */
    }
    sessionStorage.clear();
    navigate('/');
  };

  // ─── 7) Toggle sidebar open/closed ─────────────────────────────────────────
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // ─── 8) Select a chat from the sidebar ────────────────────────────────────
  const selectChat = (chat) => {
    setActiveChat(chat);
    // Close sidebar on selection (optional)
    setSidebarOpen(false);
  };

  // ─── 9) Toggle the three‐dots menu ─────────────────────────────────────────
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="chat-page">
      {/* ─────────────────── Top Bar ───────────────────────────────────────────── */}
      <div className="chat-topbar">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          title="Toggle Chats"
        >
          <FaBars size={20} color="rgb(140,201,64)" />
        </button>

        <div className="chat-title-container">
          {activeChat ? (
            <h2 className="chat-title">{activeChat.title}</h2>
          ) : (
            <h2 className="chat-title">No Chat Selected</h2>
          )}
        </div>

        <div className="user-info-dropdown">
          {/* User avatar (fallback to default if no image_url present) */}
          <img
            src={
              userInfo.image_url
                ? userInfo.image_url
                : '/images/default-avatar.png'
            }
            alt="avatar"
            className="user-avatar"
          />
          <span className="user-name">{userInfo.name || 'User'}</span>

          {/* Three dots icon */}
          <div className="three-dots-wrapper">
            <button
              className="three-dots-btn"
              onClick={toggleMenu}
              title="Open menu"
            >
              <FaEllipsisV size={18} color="white" />
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <FaSignOutAlt style={{ marginRight: '6px' }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────── Sidebar ───────────────────────────────────────────── */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>My Chats</h3>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <FaPlus style={{ marginRight: '8px' }} /> New Chat
        </button>
        <ul className="chat-list">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`chat-list-item ${
                activeChat && chat.id === activeChat.id ? 'active' : ''
              }`}
              onClick={() => selectChat(chat)}
            >
              {chat.title}
            </li>
          ))}
        </ul>
      </div>

      {/* ─────────────────── Main Chat Area ───────────────────────────────────── */}
      <div className="chat-main">
        {!activeChat ? (
          <div className="no-chat-selected">
            <p>Select a chat from the sidebar or create a new one.</p>
          </div>
        ) : (
          <>
            {/* ── Messages (Scrollable Container) ───────────────────────────────── */}
            <div className="chat-messages-container">
              {messages.map((msg, idx) => {
                // If msg.response exists, render both user and AI bubbles together
                if (msg.response) {
                  return (
                    <div key={idx}>
                      <div className="message-row user">
                        <div className="message-bubble user-bubble">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="message-row ai">
                        <div className="message-bubble ai-bubble">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.response.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Otherwise, decide side by msg.role (legacy support)
                const isAI = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={`message-row ${isAI ? 'ai' : 'user'}`}
                  >
                    <div
                      className={`message-bubble ${
                        isAI ? 'ai-bubble' : 'user-bubble'
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input + Send Button ────────────────────────────────────────────── */}
            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Type your message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="chat-input-box"
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <FaPaperPlane size={20} color="white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
