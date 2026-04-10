const API_BASE = "/api";

async function parseResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

export const api = {
  signup: async (email, username, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    return parseResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return parseResponse(res);
  },

  verifyToken: async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return parseResponse(res);
  },

  createNGL: async (question, is_anonymous, token) => {
    const res = await fetch(`${API_BASE}/ngl/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, is_anonymous }),
    });
    return parseResponse(res);
  },

  getNGL: async (nglId) => {
    const res = await fetch(`${API_BASE}/ngl/${nglId}`);
    return parseResponse(res);
  },

  submitResponse: async (nglId, message, responder_name) => {
    const res = await fetch(`${API_BASE}/ngl/${nglId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, responder_name }),
    });
    return parseResponse(res);
  },

  getResponses: async (nglId) => {
    const res = await fetch(`${API_BASE}/ngl/${nglId}/responses`);
    return parseResponse(res);
  },

  getUserNGLs: async (userId, token) => {
    const res = await fetch(`${API_BASE}/user/${userId}/ngls`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return parseResponse(res);
  },
};
