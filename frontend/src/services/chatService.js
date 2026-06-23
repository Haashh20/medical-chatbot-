import api from './api';

export const getChats = async () => {
  const response = await api.get('/chat');
  return response.data;
};

export const getChat = async (id) => {
  const response = await api.get(`/chat/${id}`);
  return response.data;
};

export const sendMessage = async (chatId, message) => {
  const response = await api.post('/chat', { chatId, message });
  return response.data;
};

export const updateChatTitle = async (id, title) => {
  const response = await api.put(`/chat/${id}/title`, { title });
  return response.data;
};

export const getArchivedChats = async () => {
  const response = await api.get('/chat/archived');
  return response.data;
};

export const archiveChat = async (id) => {
  const response = await api.put(`/chat/${id}/archive`);
  return response.data;
};

export const deleteChat = async (id) => {
  const response = await api.delete(`/chat/${id}`);
  return response.data;
};
