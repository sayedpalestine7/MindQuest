import { apiClient } from './client';

const appendFile = (form, key, file) => {
  if (!file) return;
  form.append(key, {
    uri: file.uri,
    name: file.name || `${key}.jpg`,
    type: file.type || 'image/jpeg',
  });
};

export const login = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const registerStudent = async ({ name, email, password }) => {
  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  form.append('password', password);
  form.append('role', 'student');

  const { data } = await apiClient.post('/auth/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const registerTeacher = async ({
  name,
  email,
  password,
  specialization,
  institution,
  profileImage,
  certification,
}) => {
  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  form.append('password', password);
  form.append('role', 'teacher');
  if (specialization) form.append('specialization', specialization);
  if (institution) form.append('institution', institution);

  appendFile(form, 'profileImage', profileImage);
  appendFile(form, 'certification', certification);

  const { data } = await apiClient.post('/auth/register-teacher', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const googleAuth = async ({ token, mode }) => {
  const { data } = await apiClient.post('/auth/google', { token, mode });
  return data;
};
