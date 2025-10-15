import { logger } from './logger.js';

const MACHAAO_API_BASE_URL = process.env.MACHAAO_API_BASE_URL;
const MACHAAO_API_TOKEN = process.env.MACHAAO_API_TOKEN;
const MACHAAO_DEVELOPER_TOKEN = process.env.MACHAAO_DEVELOPER_TOKEN;
const MACHAAO_APP_ID = process.env.MACHAAO_APP_ID;

class MachaaoClient {
  constructor() {
    if (!MACHAAO_API_BASE_URL || !MACHAAO_APP_ID) {
      logger.warn('MACHAAO API configuration incomplete');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${MACHAAO_API_BASE_URL}${endpoint}`;
    const token = options.useDeveloperToken ? MACHAAO_DEVELOPER_TOKEN : MACHAAO_API_TOKEN;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'MACHAAO API request failed');
      }

      return data;
    } catch (error) {
      logger.error('MACHAAO API Error:', error.message);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
      useDeveloperToken: true
    });
  }

  async login(credentials) {
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      useDeveloperToken: true
    });
  }

  // App Data endpoints
  async getAppData(key) {
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/app-data/${encodeURIComponent(key)}`, {
      method: 'GET',
      useDeveloperToken: true
    });
  }

  async setAppData(key, value, options = {}) {
    const requestBody = { value };
    
    // Add optional parameters if provided
    if (options.ttl) {
      requestBody.ttl = options.ttl;
    }
    
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/app-data/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
      useDeveloperToken: true
    });
  }

  async updateAppData(key, update) {
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/app-data/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ update }),
      useDeveloperToken: true
    });
  }

  async deleteAppData(key) {
    return this.request(`/developers/apps/${MACHAAO_APP_ID}/app-data/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      useDeveloperToken: true
    });
  }

  // User Tags endpoints
  async getUserTag(userId, tagId) {
    return this.request(`/users/${userId}/tags/${tagId}`, {
      method: 'GET'
    });
  }

  async setUserTag(userId, tagId, values) {
    return this.request(`/users/${userId}/tags/${tagId}`, {
      method: 'POST',
      body: JSON.stringify({ values })
    });
  }

  async updateUserTag(userId, tagId, values) {
    return this.request(`/users/${userId}/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify({ values })
    });
  }

  async deleteUserTag(userId, tagId) {
    return this.request(`/users/${userId}/tags/${tagId}`, {
      method: 'DELETE'
    });
  }
}

export const machaaoClient = new MachaaoClient();
