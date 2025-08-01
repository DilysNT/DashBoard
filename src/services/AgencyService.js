import axios from 'axios';

class AgencyService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get current agency profile
  async getCurrentAgencyProfile() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/agency/profile`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching agency profile:', error);
      throw error;
    }
  }

  // Update agency profile
  async updateAgencyProfile(profileData) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.put(`${this.baseURL}/agency/profile`, profileData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating agency profile:', error);
      throw error;
    }
  }

  // Get agency by ID
  async getAgencyById(agencyId) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/agencies/${agencyId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching agency by ID:', error);
      throw error;
    }
  }

  // Update agency information
  async updateAgency(agencyId, agencyData) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.put(`${this.baseURL}/agencies/${agencyId}`, agencyData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating agency:', error);
      throw error;
    }
  }

  // Get agency statistics
  async getAgencyStats() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/agency/stats`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching agency stats:', error);
      throw error;
    }
  }

  // Get agency tours
  async getAgencyTours(params = {}) {
    try {
      const headers = this.getAuthHeaders();
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${this.baseURL}/agency/tours?${queryParams}` : `${this.baseURL}/agency/tours`;
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching agency tours:', error);
      throw error;
    }
  }

  // Update agency avatar
  async updateAgencyAvatar(avatarData) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/agency/avatar`, avatarData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating agency avatar:', error);
      throw error;
    }
  }
}

export default new AgencyService();
