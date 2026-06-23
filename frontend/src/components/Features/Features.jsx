import { Brain, HeartPulse, Shield, FileText } from "lucide-react";
import "./Features.css";

function Features() {
  const features = [
    {
      icon: <Brain size={28} />,
      title: "Intelligent Diagnostics",
      description: "Powered by advanced AI to quickly verify your symptoms and provide reliable information."
    },
    {
      icon: <HeartPulse size={28} />,
      title: "Compassionate Care",
      description: "Interacts with you empathetically, using easy-to-understand language."
    },
    {
      icon: <FileText size={28} />,
      title: "Medical Reports",
      description: "Automatically generates monthly summaries of your health interactions for your records."
    },
    {
      icon: <Shield size={28} />,
      title: "Data Privacy",
      description: "Your personal medical data is strictly confidential and securely stored."
    }
  ];

  return (
    <div className="features-container" id="features">
      <div className="features-header">
        <span className="section-badge">Capabilities</span>
        <h2>Powerful Features for Your Health</h2>
      </div>
      
      <div className="features-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Features;