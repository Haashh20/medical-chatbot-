import React, { useState, useEffect } from 'react';
import { X, Save, Activity } from 'lucide-react';
import api from '../../services/api';
import './MedicalProfileModal.css';

const MedicalProfileModal = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfile(res.data || {});
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/profile', profile);
      setSuccessMsg('Profile saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <div className="profile-modal-header">
          <h2><Activity className="profile-icon" /> Your Medical Profile</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        {loading ? (
          <div className="profile-loading">Loading your medical data...</div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <p className="profile-disclaimer">
              This information is stored securely and helps your AI Assistant provide better, personalized advice.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label>Blood Type</label>
                <input type="text" name="bloodType" value={profile.bloodType || ''} onChange={handleChange} placeholder="e.g. O+, A-" />
              </div>
              <div className="form-group">
                <label>Height</label>
                <input type="text" name="height" value={profile.height || ''} onChange={handleChange} placeholder="e.g. 5'9&quot; or 175cm" />
              </div>
              <div className="form-group">
                <label>Weight</label>
                <input type="text" name="weight" value={profile.weight || ''} onChange={handleChange} placeholder="e.g. 150 lbs or 70kg" />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Allergies (Medications, Food, Environment)</label>
              <textarea name="allergies" value={profile.allergies || ''} onChange={handleChange} placeholder="List any allergies..." rows="2"></textarea>
            </div>

            <div className="form-group full-width">
              <label>Chronic Conditions</label>
              <textarea name="chronicConditions" value={profile.chronicConditions || ''} onChange={handleChange} placeholder="e.g. Asthma, Diabetes, Hypertension..." rows="2"></textarea>
            </div>

            <div className="form-group full-width">
              <label>Current Medications</label>
              <textarea name="currentMedications" value={profile.currentMedications || ''} onChange={handleChange} placeholder="List any medications you currently take..." rows="2"></textarea>
            </div>

            <div className="profile-form-actions">
              {successMsg && <span className="success-msg">{successMsg}</span>}
              <button type="submit" className="save-profile-btn" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MedicalProfileModal;
