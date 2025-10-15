const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

class ApiClient {
  constructor() {
    this.baseURL = `${API_URL}/api`;
    this.sessionId = this.getSessionId();
  }

  getSessionId() {
    return localStorage.getItem('sessionId');
  }

  setSessionId(sessionId) {
    localStorage.setItem('sessionId', sessionId);
    this.sessionId = sessionId;
  }

  clearSessionId() {
    localStorage.removeItem('sessionId');
    this.sessionId = null;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.sessionId) {
      headers['x-session-id'] = this.sessionId;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle network errors
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // Response is not JSON
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Network error or fetch failed
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network Error: Unable to connect to server');
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      
      console.error('API Error:', error.message);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (result.data?.token) {
      this.setSessionId(result.data.user_id);
    }
    
    return result;
  }

  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (result.data?.token) {
      this.setSessionId(result.data.user_id);
    }
    
    return result;
  }

  logout() {
    this.clearSessionId();
  }

  isAuthenticated() {
    return !!this.sessionId;
  }

  // Todo methods
  async getTodos() {
    return this.request('/todos');
  }

  async createTodo(text) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async updateTodo(id, updates) {
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteTodo(id) {
    return this.request(`/todos/${id}`, {
      method: 'DELETE'
    });
  }

  async clearCompleted() {
    return this.request('/todos/completed/clear', {
      method: 'DELETE'
    });
  }
}

export const apiClient = new ApiClient();
