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

  return (
    <div className="chat-page">
      <Breadcrumbs 
        items={[
          { label: 'Home',     to: '/home' }, 
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
        <div className="sidebar-header" >
          <h3>My Chats</h3>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat} style={{ marginTop:"50px"}}>
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

      <div className="chat-main">
        {!activeChat ? (
          <div className="no-chat-selected">
            <p>Select a chat from the sidebar or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="chat-messages-container">
              {messages.map((msg, idx) => {
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
