import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaBars,
  FaEllipsisV,
  FaSignOutAlt,
  FaPlus,
  FaPaperPlane
} from 'react-icons/fa';
import { FaEdit, FaTrash, FaVolumeUp, FaStop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  // Text-to-Speech state
  const [speakingKey, setSpeakingKey] = useState(null);
  const utteranceRef = useRef(null);

  const ttsSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  // Convert markdown-ish content to plain-ish text for TTS
  const toPlainText = (md = '') =>
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/[*_>#\-~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const speak = (text, key) => {
    if (!ttsSupported || !text) return;
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    const u = new window.SpeechSynthesisUtterance(toPlainText(text));
    utteranceRef.current = u;
    u.onend = () => {
      setSpeakingKey(null);
      utteranceRef.current = null;
    };
    u.onerror = () => {
      setSpeakingKey(null);
      utteranceRef.current = null;
    };
    setSpeakingKey(key);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingKey(null);
    utteranceRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (ttsSupported) window.speechSynthesis.cancel();
    };
  }, [ttsSupported]);

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
      role: userRole,
    };
    setUserInfo(storedUser);

    axios
      .get('http://127.0.0.1:8000/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

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

  // Edit chat title
  const handleEditChat = async (chat) => {
    const token = sessionStorage.getItem('token');
    const newTitle = window.prompt('Edit chat title:', chat.title);
    if (!newTitle || newTitle.trim() === '' || newTitle === chat.title) return;
    try {
      const res = await axios.put(
        `http://127.0.0.1:8000/api/chats/${chat.id}`,
        { title: newTitle.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );
      const updated = res.data.data;
      setChats((prev) => prev.map((c) => (c.id === chat.id ? updated : c)));
      setActiveChat((prev) => (prev && prev.id === chat.id ? updated : prev));
    } catch (err) {
      console.error('Error updating chat:', err);
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId) => {
    const token = sessionStorage.getItem('token');
    const confirmed = window.confirm('Are you sure you want to delete this chat?');
    if (!confirmed) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      setActiveChat((prev) => {
        if (!prev || prev.id !== chatId) return prev;
        const remaining = chats.filter((c) => c.id !== chatId);
        return remaining.length ? remaining[0] : null;
      });
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
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
    } catch (_) {}
    sessionStorage.clear();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setSidebarOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Shared style for the TTS button
  const ttsBtnStyle = {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#8CC940', // from your image
    border: 'none',
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  };

  return (
    <div className="chat-page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/home' },
          { label: 'Chats' }
        ]}
      />
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

      <div className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>My Chats</h3>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat} style={{ marginTop: '50px' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span className="chat-list-title" style={{ flex: 1 }}>{chat.title}</span>

              {/* Show buttons ONLY for the selected chat */}
              {activeChat && activeChat.id === chat.id && (
                <>
                  <button
                    className="chat-edit-btn"
                    title="Edit chat title"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditChat(chat);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    className="chat-delete-btn"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <FaTrash size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-main">
        {!activeChat ? (
          <div className="no-chat-selected">
            <p>Select a chat from the sidebar or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="chat-messages-container">
              {messages.map((msg, idx) => {
                // Case 1: message with paired response (user then AI)
                if (msg.response) {
                  const aiKey = `ai-${idx}`;
                  const aiText = msg.response.content;
                  const isSpeaking = speakingKey === aiKey;

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
                        <div className="message-bubble ai-bubble" style={{ position: 'relative' }}>
                          {/* TTS control */}
                          {ttsSupported && (
                            <button
                              className="tts-btn"
                              aria-label={isSpeaking ? 'Stop reading' : 'Read response aloud'}
                              title={isSpeaking ? 'Stop' : 'Read aloud'}
                              onClick={() => (isSpeaking ? stopSpeaking() : speak(aiText, aiKey))}
                              style={ttsBtnStyle}
                            >
                              {isSpeaking ? <FaStop size={14} color="white" /> : <FaVolumeUp size={14} color="white" />}
                            </button>
                          )}
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiText}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Case 2: single message (could be assistant or user)
                const isAI = msg.role === 'assistant';
                const key = `m-${idx}`;
                const isSpeaking = speakingKey === key;

                return (
                  <div
                    key={idx}
                    className={`message-row ${isAI ? 'ai' : 'user'}`}
                  >
                    <div
                      className={`message-bubble ${
                        isAI ? 'ai-bubble' : 'user-bubble'
                      }`}
                      style={{ position: 'relative' }}
                    >
                      {/* TTS only for AI messages */}
                      {isAI && ttsSupported && (
                        <button
                          className="tts-btn"
                          aria-label={isSpeaking ? 'Stop reading' : 'Read response aloud'}
                          title={isSpeaking ? 'Stop' : 'Read aloud'}
                          onClick={() =>
                            isSpeaking ? stopSpeaking() : speak(msg.content, key)
                          }
                          style={ttsBtnStyle}
                        >
                          {isSpeaking ? <FaStop size={14} color="white" /> : <FaVolumeUp size={14} color="white" />}
                        </button>
                      )}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

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
