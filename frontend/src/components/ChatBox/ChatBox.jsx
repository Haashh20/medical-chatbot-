import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Menu, Bot, User as UserIcon, Download, Copy, Check, Edit2 } from 'lucide-react';
import { getChat, sendMessage } from '../../services/chatService';
import jsPDF from 'jspdf';
import './ChatBox.css';

function ChatBox({ chatId, onChatUpdate, toggleSidebar, isSidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [typingMessage, setTypingMessage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    } else {
      setMessages([]);
      setTypingMessage(null);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingMessage]);

  const fetchChatHistory = async () => {
    try {
      const chat = await getChat(chatId);
      // If we are currently typing, don't overwrite with full history right now to prevent double message
      setMessages(currentMessages => {
        // Only update if we aren't in the middle of a typing effect for a new chat
        if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].role === 'user') {
          return currentMessages;
        }
        return chat.messages || [];
      });
    } catch (err) {
      console.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // --- Header Bar ---
    doc.setFillColor(0, 77, 64); // Deep Teal
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MedAssist Clinic", 20, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Virtual Health Division • 1-800-MED-AI", 130, 22);
    
    // --- Patient Info section ---
    doc.setTextColor(38, 50, 56); // Dark Slate
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT CONSULTATION REPORT", 20, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 58);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 80, 58);
    doc.text("Patient ID: MA-" + Math.floor(Math.random() * 90000 + 10000), 140, 58);
    
    // Divider
    doc.setDrawColor(0, 191, 165); // Teal Accent
    doc.setLineWidth(0.5);
    doc.line(20, 62, 190, 62);
    
    // --- Find and clean content ---
    const reportMsg = [...messages].reverse().find(m => m.role === 'model' && m.content.includes('overview'));
    let content = reportMsg ? reportMsg.content : "No medical data found.";
    
    // Hard remove conversational lines
    content = content.replace(/I would be happy to generate that for you\. Here is a quick overview of our medical consultation:/gi, '');
    content = content.replace(/Here is a quick overview of our medical consultation:/gi, '');
    content = content.replace(/Does this look correct\? Please reply 'yes'( or 'generate')? to verify and I will finalize your PDF\./gi, '');
    content = content.trim();
    
    let yPos = 75;
    const lines = content.split('\n').filter(l => l.trim() !== '');
    
    lines.forEach(line => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      let textLine = line.trim();
      if (textLine.startsWith('- ')) textLine = textLine.substring(2);
      
      const boldMatch = textLine.match(/\*\*(.*?)\*\*(.*)/);
      
      if (boldMatch) {
         // Print Bold Header
         doc.setFont("helvetica", "bold");
         doc.setFontSize(11);
         doc.setTextColor(0, 77, 64);
         doc.text(boldMatch[1], 20, yPos);
         
         const textWidth = doc.getTextWidth(boldMatch[1]);
         
         // Print Normal Text after header
         doc.setFont("helvetica", "normal");
         doc.setTextColor(38, 50, 56);
         let rest = boldMatch[2].trim();
         if (rest.startsWith(':')) rest = rest.substring(1).trim();
         
         if (rest.length > 0) {
           const splitRest = doc.splitTextToSize(rest, 190 - (20 + textWidth + 2));
           doc.text(splitRest, 20 + textWidth + 2, yPos);
           yPos += (splitRest.length * 7) + 3;
         } else {
           yPos += 10;
         }
      } else {
         doc.setFont("helvetica", "normal");
         doc.setTextColor(38, 50, 56);
         doc.setFontSize(10);
         // Clean any remaining markdown asterisks just in case
         const cleanText = textLine.replace(/\*\*/g, '');
         const splitLine = doc.splitTextToSize(cleanText, 170);
         doc.text(splitLine, 20, yPos);
         yPos += (splitLine.length * 7) + 3;
      }
    });
    
    // --- Doctor signature ---
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    } else {
      yPos += 20;
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.line(130, yPos, 190, yPos);
    yPos += 6;
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(0, 77, 64);
    doc.text("Dr. MedAssist AI", 138, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Authorized Digital Signature", 142, yPos);
    
    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Disclaimer: This is an AI-generated summary and does not constitute a formal medical diagnosis.', 20, 285);
    
    doc.save('MedAssist_Prescription.pdf');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    // Reset textarea height
    const textarea = document.getElementById('chat-input-textarea');
    if (textarea) textarea.style.height = 'auto';

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await sendMessage(chatId, userMessage);
      setIsLoading(false);
      
      // Get the newest AI response
      const newMessages = data.chat.messages;
      const aiResponse = newMessages[newMessages.length - 1];
      
      // Update history excluding the latest AI message
      setMessages(newMessages.slice(0, -1));
      
      // Start typing effect for the newest message
      setTypingMessage({
        fullContent: aiResponse.content,
        displayedContent: '',
        index: 0
      });
      
      if (!chatId) {
        onChatUpdate(data.chat._id);
      }
    } catch (err) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  // Focus input when typing is done or when component loads
  useEffect(() => {
    if (!isLoading && !typingMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, typingMessage, chatId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const handleEdit = (text) => {
    setInput(text);
    if (inputRef.current) inputRef.current.focus();
  };

  // Typing Effect Logic
  useEffect(() => {
    if (!typingMessage) return;

    const { fullContent, index } = typingMessage;
    
    if (index < fullContent.length) {
      const timeoutId = setTimeout(() => {
        // Type 3 characters at a time for speed, like real ChatGPT
        const charsToAdd = fullContent.slice(index, index + 3);
        setTypingMessage(prev => ({
          ...prev,
          displayedContent: prev.displayedContent + charsToAdd,
          index: prev.index + 3
        }));
      }, 10);
      return () => clearTimeout(timeoutId);
    } else {
      // Done typing, commit to main messages array
      setMessages(prev => [...prev, { role: 'model', content: fullContent }]);
      setTypingMessage(null);
    }
  }, [typingMessage]);

  return (
    <div className="chatbox-container">
      <header className="chatbox-header">
        {!isSidebarOpen && (
          <button className="menu-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        )}
        <h2>MedAssist AI</h2>
      </header>

      <div className="messages-area">
        {messages.length === 0 && !isLoading && !typingMessage ? (
          <div className="welcome-screen">
            <div className="welcome-icon"><Bot size={40} /></div>
            <h3>How can I help you today?</h3>
            <p>I can verify your symptoms, explain complex medical terms, or provide personalized health guidance.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'model' ? <Bot size={20} /> : <UserIcon size={20} />}
                </div>
                <div className="message-content">
                  <ReactMarkdown>
                    {msg.content.replace('[DOWNLOAD_PDF_BUTTON]', '')}
                  </ReactMarkdown>
                  {msg.content.includes('[DOWNLOAD_PDF_BUTTON]') && (
                    <button className="pdf-download-btn" onClick={generatePDF}>
                      <Download size={18} /> Download Verified Report (PDF)
                    </button>
                  )}
                  <div className="message-actions">
                    <button onClick={() => handleCopy(msg.content.replace('[DOWNLOAD_PDF_BUTTON]', ''))} title="Copy">
                      <Copy size={14} />
                    </button>
                    {msg.role === 'user' && (
                      <button onClick={() => handleEdit(msg.content)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-wrapper model">
                <div className="message-avatar"><Bot size={20} /></div>
                <div className="message-content loading">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}

            {typingMessage && (
              <div className="message-wrapper model">
                <div className="message-avatar"><Bot size={20} /></div>
                <div className="message-content typing">
                  <ReactMarkdown>
                    {typingMessage.displayedContent.replace('[DOWNLOAD_PDF_BUTTON]', '')}
                  </ReactMarkdown>
                  {typingMessage.displayedContent.includes('[DOWNLOAD_PDF_BUTTON]') && (
                    <button className="pdf-download-btn" onClick={generatePDF}>
                      <Download size={18} /> Download Verified Report (PDF)
                    </button>
                  )}
                  <span className="typing-cursor"></span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="messages-bottom-padding" />
      </div>

      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            id="chat-input-textarea"
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your symptoms or questions here..."
            disabled={isLoading || typingMessage !== null}
            rows="1"
          />
          <button type="submit" disabled={!input.trim() || isLoading || typingMessage !== null} className="send-btn">
            <Send size={20} />
          </button>
        </form>
        <p className="disclaimer">
          MedAssist AI can make mistakes. Always consult a healthcare professional for serious concerns.
        </p>
      </div>
    </div>
  );
}

export default ChatBox;
