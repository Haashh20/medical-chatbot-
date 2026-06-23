import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatBox from '../../components/ChatBox/ChatBox';
import { getChats } from '../../services/chatService';
import './Dashboard.css';

function Dashboard() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async (newChatId) => {
    try {
      const data = await getChats();
      setChats(data);
      if (newChatId) {
        setCurrentChatId(newChatId);
      }
    } catch (err) {
      console.error('Failed to fetch chats');
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar 
        chats={chats} 
        currentChatId={currentChatId} 
        onSelectChat={setCurrentChatId} 
        onNewChat={handleNewChat} 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onChatUpdate={fetchChats}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ChatBox 
          chatId={currentChatId} 
          onChatUpdate={fetchChats} 
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
}

export default Dashboard;