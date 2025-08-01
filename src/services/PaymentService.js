import api from '../utils/api';

// Helper để lấy prefix endpoint theo role
const getPaymentApiPrefix = (isAgency) => isAgency ? '/agency/payments' : '/admin/payments';

class PaymentService {
  // Get all payments (admin/agency) with filters and pagination
  static async getPayments(isAgency = false, filters = {}, page = 1, pageSize = 10) {
    try {
      const prefix = getPaymentApiPrefix(isAgency);
      const params = { ...filters, page, pageSize };
      const response = await api.get(prefix, { params });
      return {
        success: true,
        data: response.data.payments || response.data.data || (Array.isArray(response.data) ? response.data : []),
        pagination: response.data.pagination,
        summary: response.data.summary,
        agency: response.data.agency
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách thanh toán'
      };
    }
  }

  // Get all payments for admin (all agencies)
  static async getAllPayments(filters = {}) {
    try {
      console.log('🔄 Fetching all payments for admin...');
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() ? `/admin/payments?${queryParams.toString()}` : '/admin/payments';
      const response = await api.get(url);
      
      console.log('✅ All payments fetched successfully:', response.data?.length || 0, 'payments');
      
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : (response.data?.data || []),
        pagination: response.data?.pagination || null,
        summary: response.data?.summary || null
      };
    } catch (error) {
      console.error('❌ Error fetching all payments:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách thanh toán'
      };
    }
  }

  // Get payment details by ID
  static async getPaymentById(isAgency = false, paymentId) {
    try {
      const prefix = getPaymentApiPrefix(isAgency);
      const response = await api.get(`${prefix}/${paymentId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải chi tiết thanh toán'
      };
    }
  }

  // Update payment status (admin only)
  static async updatePaymentStatus(paymentId, status) {
    try {
      const response = await api.put(`/admin/payments/${paymentId}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái thanh toán'
      };
    }
  }

  // Process refund (admin only)
  static async processRefund(paymentId, refundAmount, reason) {
    try {
      console.log(`🔄 Processing refund for payment ${paymentId}...`);
      
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount: refundAmount,
        reason: reason
      });
      
      if (response.data.success) {
        console.log('✅ Refund processed successfully');
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to process refund'
      };
    }
  }

  // Get payment statistics (admin/agency)
  static async getPaymentStats(isAgency = false, filters = {}) {
    try {
      const prefix = getPaymentApiPrefix(isAgency);
      const url = `${prefix}/stats`;
      const response = await api.get(url, { params: filters });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thống kê thanh toán'
      };
    }
  }

  // Get payment revenue (admin/agency)
  static async getPaymentRevenue(isAgency = false, filters = {}) {
    try {
      const prefix = getPaymentApiPrefix(isAgency);
      const url = `${prefix}/revenue`;
      const response = await api.get(url, { params: filters });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thống kê doanh thu thanh toán'
      };
    }
  }

  // Get payment methods stats (admin only)
  static async getPaymentMethodsStats(filters = {}) {
    try {
      const response = await api.get(`/admin/payments/methods`, { params: filters });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thống kê phương thức thanh toán'
      };
    }
  }

  // Export payments (admin/agency)
  static async exportPayments(isAgency = false, filters = {}, format = 'csv') {
    try {
      const prefix = getPaymentApiPrefix(isAgency);
      const params = new URLSearchParams({ ...filters, format });
      const url = `${prefix}/export/csv?${params.toString()}`;
      const response = await api.get(url, { responseType: 'blob' });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể export dữ liệu thanh toán'
      };
    }
  }

  // Verify payment with payment gateway
  static async verifyPayment(transactionId, paymentMethod) {
    try {
      console.log(`🔄 Verifying payment: ${transactionId} via ${paymentMethod}`);
      
      const response = await api.post('/payments/verify', {
        transaction_id: transactionId,
        payment_method: paymentMethod
      });
      
      if (response.data.success) {
        console.log('✅ Payment verified successfully');
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to verify payment'
      };
    }
  }
}

export default PaymentService;
