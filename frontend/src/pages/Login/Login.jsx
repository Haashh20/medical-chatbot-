import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/authService';
import { HeartPulse, Stethoscope, ShieldCheck, ArrowLeft } from 'lucide-react';
import '../../styles/auth.css';

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      loginUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-sidebar">
        <HeartPulse className="floating-element" size={200} />
        <Stethoscope className="floating-element" size={150} />
        <ShieldCheck className="floating-element" size={120} />
        
        <div className="sidebar-content">
          <h1 className="sidebar-title">Welcome back to MedAssist AI.</h1>
          <p className="sidebar-subtitle">Your secure gateway to personalized, advanced healthcare assistance. Log in to continue where you left off.</p>
          
          <div className="auth-testimonial">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"MedAssist AI has completely transformed how I manage my health. It's like having a dedicated medical professional available 24/7."</p>
            <div className="testimonial-author">
              <div className="author-avatar">S</div>
              <div className="author-info">
                <h4>Sarah Jenkins</h4>
                <span>Verified User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Log in to access your personal medical history.</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" />
            </div>
            
            <button type="submit" className="auth-btn">Log In</button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;