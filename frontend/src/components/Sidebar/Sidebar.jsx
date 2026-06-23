import { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, MessageCircle, Settings, User, LogOut, Sun, Moon, PanelLeftClose, MoreVertical, Edit2, Archive, Trash2, Lock, X, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateChatTitle, archiveChat, deleteChat, getArchivedChats } from '../../services/chatService';
import { verifyPassword } from '../../services/authService';
import MedicalProfileModal from '../MedicalProfileModal/MedicalProfileModal';
import SettingsModal from '../SettingsModal/SettingsModal';
import './Sidebar.css';

function Sidebar({ chats, currentChatId, onSelectChat, onNewChat, isOpen, toggleSidebar, onChatUpdate }) {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editChatId, setEditChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [archivedChats, setArchivedChats] = useState([]);

  const formatChatTitle = (title) => {
    if (!title) return 'Medical Inquiry';
    let cleanTitle = title.replace(/\.+$/, '').trim();
    if (!cleanTitle) return 'Medical Inquiry';
    return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  };

  const handleMenuToggle = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const openEditModal = (e, chat) => {
    e.stopPropagation();
    setEditChatId(chat._id);
    setEditTitle(formatChatTitle(chat.title));
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await updateChatTitle(editChatId, editTitle);
      setIsEditModalOpen(false);
      onChatUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    try {
      await archiveChat(id);
      setActiveMenu(null);
      onChatUpdate();
      if (currentChatId === id) onNewChat();
      if (isArchivedModalOpen) fetchArchivedChats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteChat(id);
      setActiveMenu(null);
      onChatUpdate();
      if (currentChatId === id) onNewChat();
      if (isArchivedModalOpen) fetchArchivedChats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveClick = () => {
    setIsPasswordModalOpen(true);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setPasswordError('');
    try {
      await verifyPassword(password);
      setIsPasswordModalOpen(false);
      fetchArchivedChats();
      setIsArchivedModalOpen(true);
    } catch (err) {
      setPasswordError('Incorrect password');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchArchivedChats = async () => {
    try {
      const data = await getArchivedChats();
      setArchivedChats(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <MessageSquarePlus size={20} />
          <span>New Chat</span>
        </button>
        <button className="close-sidebar-btn" onClick={toggleSidebar} title="Close Sidebar">
          <PanelLeftClose size={20} />
        </button>
      </div>

      <div className="chat-history">
        <p className="history-title">Recent Chats</p>
        <div className="chat-list">
          {chats.map((chat) => (
            <div 
              key={chat._id} 
              className={`history-item ${chat._id === currentChatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat._id)}
            >
              <MessageCircle size={18} className="chat-icon" />
              <span className="chat-title">{formatChatTitle(chat.title)}</span>
              <button className="chat-menu-btn" onClick={(e) => handleMenuToggle(e, chat._id)}>
                <MoreVertical size={14} />
              </button>
              {activeMenu === chat._id && (
                <div className="chat-menu-dropdown">
                  <button onClick={(e) => openEditModal(e, chat)}><Edit2 size={12}/> Edit Name</button>
                  <button onClick={(e) => handleArchive(e, chat._id)}><Archive size={12}/> Archive</button>
                  <button className="delete" onClick={(e) => handleDelete(e, chat._id)}><Trash2 size={12}/> Delete</button>
                </div>
              )}
            </div>
          ))}
          {chats.length === 0 && <p className="no-chats">No previous chats</p>}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="archive-vault-btn" onClick={handleArchiveClick}>
          <Archive size={20} />
          <span>Archived Chats</span>
        </button>

        <button className="medical-profile-btn" onClick={() => setIsProfileOpen(true)}>
          <Activity size={20} />
          <span>Medical Profile</span>
        </button>

        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="user-profile-row">
          <div className="user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-details">
              <span className="user-email">{user?.name || user?.email?.split('@')[0]}</span>
              <span className="user-settings" onClick={() => setIsSettingsOpen(true)} style={{cursor: 'pointer'}}><Settings size={12}/> Settings</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logoutUser} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Chat Name</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content password-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Lock size={32} /></div>
            <h3>Enter Password</h3>
            <p>Please verify your password to access archived chats.</p>
            <form onSubmit={handlePasswordSubmit}>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Your password"
                autoFocus 
              />
              {passwordError && <p className="error-text">{passwordError}</p>}
              <div className="modal-actions">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={isVerifying}>{isVerifying ? 'Verifying...' : 'Unlock Vault'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isArchivedModalOpen && (
        <div className="modal-overlay" onClick={() => setIsArchivedModalOpen(false)}>
          <div className="modal-content archived-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Archive size={20}/> Archived Chats</h3>
              <button className="close-modal-btn" onClick={() => setIsArchivedModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="archived-list">
              {archivedChats.length === 0 ? (
                <p className="no-chats">No archived chats.</p>
              ) : (
                archivedChats.map(chat => (
                  <div key={chat._id} className="archived-item">
                    <div className="archived-info" onClick={() => { onSelectChat(chat._id); setIsArchivedModalOpen(false); }}>
                      <MessageCircle size={16} />
                      <span>{formatChatTitle(chat.title)}</span>
                    </div>
                    <div className="archived-actions">
                      <button onClick={(e) => handleArchive(e, chat._id)} title="Unarchive"><Archive size={14} className="unarchive-icon"/></button>
                      <button className="delete" onClick={(e) => handleDelete(e, chat._id)} title="Delete Forever"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <MedicalProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onOpenProfile={() => setIsProfileOpen(true)} />
    </div>
  );
}

export default Sidebar;
