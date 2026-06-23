import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import "./Hero.css";

function Hero() {
  return (
    <div className="hero-container">
      <div className="hero-badge">
        <ShieldCheck size={16} className="badge-icon" />
        <span>Your Medical Assist</span>
      </div>
      
      <h1 className="hero-title">
        Advanced Medical Care,<br/>
        <span className="hero-highlight">Available 24/7.</span>
      </h1>
      
      <p className="hero-subtitle">
        Experience the future of healthcare assistance. MedAssist AI understands your symptoms, explains complex terms seamlessly, and manages your personal medical history with absolute privacy.
      </p>

      <div className="hero-cta">
        <Link to="/signup" className="btn-hero-primary">
          Get Started Free <ArrowRight size={18} />
        </Link>
        <Link to="/login" className="btn-hero-secondary">
          Log In
        </Link>
      </div>
    </div>
  );
}

export default Hero;