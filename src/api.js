const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
    return localStorage.getItem('timeline_token');
}

export function setToken(token) {
    localStorage.setItem('timeline_token', token);
}

export function clearToken() {
    localStorage.removeItem('timeline_token');
}

export function getStoredUser() {
    const raw = localStorage.getItem('timeline_user');
    return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
    localStorage.setItem('timeline_user', JSON.stringify(user));
}

export function clearStoredUser() {
    localStorage.removeItem('timeline_user');
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || 'Error del servidor');
    return data;
}

// Auth
export const login = (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (username, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });

export const getMe = () => request('/auth/me');

// Events
export const getEvents = (userId) =>
    request(`/events${userId ? `?user_id=${userId}` : ''}`);

export const createEvent = (data) =>
    request('/events', { method: 'POST', body: JSON.stringify(data) });

export const updateEvent = (id, data) =>
    request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteEvent = (id) =>
    request(`/events/${id}`, { method: 'DELETE' });

// Tags
export const getTags = () => request('/tags');

export const createTag = (name, color) =>
    request('/tags', { method: 'POST', body: JSON.stringify({ name, color }) });

export const updateTag = (id, name, color) =>
    request(`/tags/${id}`, { method: 'PUT', body: JSON.stringify({ name, color }) });

export const deleteTag = (id) =>
    request(`/tags/${id}`, { method: 'DELETE' });

// Users (admin)
export const getUsers = () => request('/users');
