import React, { useState } from 'react';
import { X, User, Shield, Sliders, Info, Download, Trash2, AlertTriangle, Moon, Sun, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, onOpenProfile }) {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await api.get('/auth/export');
      const data = res.data;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MedAssist_Export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export data. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently delete ALL your chats? This cannot be undone.")) return;
    
    try {
      setIsClearing(true);
      await api.delete('/chat/all');
      alert('All chat history has been permanently deleted.');
      window.location.reload(); // Hard reload to clear UI state
    } catch (err) {
      console.error(err);
      alert('Failed to clear history.');
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("DANGER: This will permanently delete your account, medical profile, and all chat history. Are you absolutely sure?")) return;
    
    try {
      setIsDeleting(true);
      await api.delete('/auth/me');
      alert('Your account has been deleted. We are sorry to see you go.');
      logoutUser();
    } catch (err) {
      console.error(err);
      alert('Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'account':
        return (
          <div className="settings-tab-content">
            <h3>Account Settings</h3>
            <div className="settings-card">
              <div className="settings-field">
                <label>Email Address</label>
                <div className="settings-value">{user?.email || 'N/A'}</div>
              </div>
              <div className="settings-field">
                <label>User ID</label>
                <div className="settings-value code">{user?._id || user?.id || 'N/A'}</div>
              </div>
            </div>
            
            <h3 className="danger-zone-title"><AlertTriangle size={18}/> Danger Zone</h3>
            <div className="settings-card danger">
              <p>Permanently delete your account and all associated data.</p>
              <button className="danger-btn" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="settings-tab-content">
            <h3>Data & Privacy</h3>
            <div className="settings-card">
              <h4>Export Your Data</h4>
              <p>Download a complete copy of your chat history and medical profile in JSON format.</p>
              <button className="primary-outline-btn" onClick={handleExportData} disabled={isExporting}>
                <Download size={16}/> {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            <div className="settings-card danger">
              <h4>Clear Chat History</h4>
              <p>Permanently delete all of your active and archived chat logs from our servers.</p>
              <button className="danger-btn" onClick={handleClearHistory} disabled={isClearing}>
                <Trash2 size={16}/> {isClearing ? 'Clearing...' : 'Clear All History'}
              </button>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="settings-tab-content">
            <h3>App Preferences</h3>
            <div className="settings-card flex-row">
              <div className="pref-info">
                <h4>Theme Preference</h4>
                <p>Toggle between light and dark mode.</p>
              </div>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <><Sun size={16}/> Light Mode</> : <><Moon size={16}/> Dark Mode</>}
              </button>
            </div>

            <div className="settings-card flex-row">
              <div className="pref-info">
                <h4>Medical Profile</h4>
                <p>View or edit your clinical information.</p>
              </div>
              <button className="primary-outline-btn" onClick={() => { onClose(); onOpenProfile(); }}>
                <Activity size={16}/> Open Profile
              </button>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="settings-tab-content">
            <h3>About MedAssist</h3>
            <div className="settings-card text-center">
              <div className="about-logo">
                <Activity size={32} color="var(--primary-color)" />
              </div>
              <h2>MedAssist AI</h2>
              <p className="version">Version 1.0.0 (Beta)</p>
              <p className="about-desc">
                MedAssist AI is a premium virtual healthcare assistant built to verify symptoms and provide accurate medical guidance.
              </p>
              <div className="disclaimer-box">
                <strong>Medical Disclaimer:</strong> This application utilizes generative AI to simulate a medical assistant. It does not replace professional medical advice, diagnosis, or treatment. Always consult a physician for serious concerns.
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-sidebar">
          <div className="settings-sidebar-header">
            <Sliders size={24} />
            <h2>Settings</h2>
          </div>
          <nav className="settings-nav">
            <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>
              <User size={18} /> Account
            </button>
            <button className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>
              <Shield size={18} /> Data & Privacy
            </button>
            <button className={activeTab === 'preferences' ? 'active' : ''} onClick={() => setActiveTab('preferences')}>
              <Sliders size={18} /> Preferences
            </button>
            <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>
              <Info size={18} /> About
            </button>
          </nav>
        </div>
        
        <div className="settings-content">
          <button className="settings-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="settings-scroll-area">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
