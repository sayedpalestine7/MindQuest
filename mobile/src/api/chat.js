import { apiClient } from './client';

export const getConversation = async ({ teacherId, studentId }) => {
  const { data } = await apiClient.get(`/chat/conversation/${teacherId}/${studentId}`);
  return data?.messages || [];
};

export const sendMessage = async ({ content, sender, teacherId, studentId }) => {
  const { data } = await apiClient.post('/chat/send', {
    content,
    sender,
    teacher: teacherId,
    student: studentId,
  });
  return data;
};
