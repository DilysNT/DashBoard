const API_BASE_URL = "http://localhost:5000/api";

class CommissionService {
  static getToken() {
    // Lấy token từ localStorage (hoặc sửa lại nếu bạn dùng context)
    return localStorage.getItem('token');
  }
  static async getCommissions(params) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE_URL}/commissions${query}`, {
      headers: {
        'Authorization': `Bearer ${CommissionService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return await res.json();
  }
  static async getCommissionById(id) {
    const res = await fetch(`${API_BASE_URL}/commissions/${id}`, {
      headers: {
        'Authorization': `Bearer ${CommissionService.getToken()}`,
        'Content-Type': 'application/json',
      },
    });
    return await res.json();
  }
  static async updateCommission(id, data) {
    const res = await fetch(`${API_BASE_URL}/commissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CommissionService.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
  static async createReversal(data) {
    const res = await fetch(`${API_BASE_URL}/commissions/reversal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CommissionService.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
}
export default CommissionService; 