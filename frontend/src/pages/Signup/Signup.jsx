import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';
import { HeartPulse, Stethoscope, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import '../../styles/auth.css';

function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    gender: 'Other',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      loginUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <HeartPulse className="floating-element" size={200} />
        <Stethoscope className="floating-element" size={150} />
        <ShieldCheck className="floating-element" size={120} />
        
        <div className="sidebar-content">
          <h1 className="sidebar-title">Start your health journey.</h1>
          <p className="sidebar-subtitle">Create a secure account with MedAssist AI today and experience the future of personalized medical assistance.</p>
          
          <div className="auth-features-list">
            <div className="auth-feature-item">
              <CheckCircle2 size={24} className="auth-feature-icon" />
              <span>Bank-grade encryption for your medical data</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={24} className="auth-feature-icon" />
              <span>Instant 24/7 intelligent symptom analysis</span>
            </div>
            <div className="auth-feature-item">
              <CheckCircle2 size={24} className="auth-feature-icon" />
              <span>Automated, personalized health reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join MedAssist AI for premium medical assistance.</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Minimum 6 characters" minLength="6" />
            </div>

            <div className="input-group row">
              <div className="half-width">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="half-width">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-btn">Sign Up</button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;