const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('whatsapp_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('whatsapp_token', token);
  } else {
    localStorage.removeItem('whatsapp_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  searchUsers: (query) => request(`/auth/users/search?q=${encodeURIComponent(query)}`),
  getDemoAccounts: () => request('/auth/demo-accounts'),
};

export const friendsAPI = {
  sendRequest: (email) => request('/friends/request', { method: 'POST', body: JSON.stringify({ email }) }),
  getRequests: () => request('/friends/requests'),
  respondRequest: (request_id, action) => request('/friends/respond', { method: 'POST', body: JSON.stringify({ request_id, action }) }),
  getFriendsList: () => request('/friends/list'),
  getEmailOutbox: () => request('/friends/email-outbox'),
};

export const chatsAPI = {
  getChats: () => request('/chats'),
  createDirectChat: (friend_id) => request('/chats/direct', { method: 'POST', body: JSON.stringify({ friend_id }) }),
  createGroupChat: (payload) => request('/chats/group', { method: 'POST', body: JSON.stringify(payload) }),
  getMessages: (conversation_id) => request(`/chats/${conversation_id}/messages`),
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const res = await fetch(`${API_BASE}/chats/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
