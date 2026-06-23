import { Bot, User } from "lucide-react";
import "./ChatPreview.css";

function ChatPreview() {
  return (
    <div className="preview-card">
      <div className="preview-header">
        <Bot size={20} className="header-icon" />
        <span>MedAssist AI Preview</span>
      </div>
      
      <div className="preview-body">
        <div className="msg user-msg">
          <div className="msg-avatar"><User size={16} /></div>
          <div className="msg-bubble">I've been having mild chest tightness and a slight cough for the past two days.</div>
        </div>
        
        <div className="msg bot-msg">
          <div className="msg-avatar"><Bot size={16} /></div>
          <div className="msg-bubble">
            I understand you're experiencing chest tightness and a cough. While this could be related to a minor respiratory issue like a cold or mild bronchitis, chest tightness should always be taken seriously. <br/><br/>
            <strong>If you experience any shortness of breath, severe pain, or dizziness, please seek immediate emergency medical care.</strong><br/><br/>
            Have you had any fever or recent travel?
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPreview;