import { clientLogger } from './logger.js';

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
    // Generate correlation ID for this request
    const correlationId = clientLogger.generateCorrelationId();
    const startTime = Date.now();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...options.headers
    };

    if (this.sessionId) {
      headers['x-session-id'] = this.sessionId;
    }

    const config = {
      ...options,
      headers
    };

    // Log the API request
    clientLogger.logApiCall(
      options.method || 'GET',
      endpoint,
      config,
      correlationId
    );

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const duration = Date.now() - startTime;
      
      // Handle network errors
      if (!response.ok) {
        let errorMessage = 'Request failed';
        let errorData = null;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response is not JSON
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Log error response
        clientLogger.logApiResponse(
          options.method || 'GET',
          endpoint,
          response.status,
          duration,
          correlationId,
          null,
          new Error(errorMessage)
        );
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Log successful response
      clientLogger.logApiResponse(
        options.method || 'GET',
        endpoint,
        response.status,
        duration,
        correlationId,
        data
      );
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Network error or fetch failed
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Unable to connect to server. Please check your connection.');
        
        clientLogger.logApiResponse(
          options.method || 'GET',
          endpoint,
          0,
          duration,
          correlationId,
          null,
          networkError
        );
        
        throw networkError;
      }
      
      // Log other errors if not already logged
      if (!error.message.includes('Request failed')) {
        clientLogger.logApiResponse(
          options.method || 'GET',
          endpoint,
          0,
          duration,
          correlationId,
          null,
          error
        );
      }
      
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
