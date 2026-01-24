// api.js
const API_URL = 'http://nglbackend.famtrixsolutions.com:8001';
export const api = {
  // Auth
  signup: async (email, username, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  verifyToken: async (token) => {
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.json();
  },

  // NGLs
  createNGL: async (question, is_anonymous, token) => {
    const res = await fetch(`${API_URL}/ngl/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question, is_anonymous }),
    });
    return res.json();
  },

  getNGL: async (nglId) => {
    const res = await fetch(`${API_URL}/ngl/${nglId}`);
    return res.json();
  },

  submitResponse: async (nglId, message, responder_name) => {
    const res = await fetch(`${API_URL}/ngl/${nglId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, responder_name }),
    });
    return res.json();
  },

  getResponses: async (nglId) => {
    const res = await fetch(`${API_URL}/ngl/${nglId}/responses`);
    return res.json();
  },

  getUserNGLs: async (userId, token) => {
    const res = await fetch(`${API_URL}/user/${userId}/ngls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  connectWebSocket: (nglId, onMessage) => {
    const wsUrl = `ws://localhost:8000/ws/${nglId}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for NGL:', nglId);
    };
    
    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected for NGL:', nglId);
    };
    
    return ws;
  },
};