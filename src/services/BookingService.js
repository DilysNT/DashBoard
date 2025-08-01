import api from '../utils/api';

// Helper để lấy prefix endpoint theo role
const getBookingApiPrefix = (isAgency) => isAgency ? '/agency/bookings' : '/admin/bookings';

class BookingService {
  // Get all bookings (admin or agency) with filters and pagination
  static async getBookings(isAgency = false, filters = {}) {
    try {
      const prefix = getBookingApiPrefix(isAgency);
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      const url = queryParams.toString() ? `${prefix}?${queryParams.toString()}` : prefix;
      const response = await api.get(url);
      let bookings = [];
      let agency = null;
      let pagination = null;
      let summary = null;
      if (isAgency && response.data) {
        bookings = Array.isArray(response.data) ? response.data : (response.data.bookings || response.data.data || []);
        agency = response.data.agency || null;
        pagination = response.data.pagination || null;
        summary = response.data.summary || null;
      } else {
        bookings = Array.isArray(response.data) ? response.data : (response.data.data || []);
        pagination = response.data.pagination || null;
        summary = response.data.summary || null;
      }
      return {
        success: true,
        data: bookings,
        agency,
        pagination,
        summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng'
      };
    }
  }

  // Get all bookings for admin (all agencies)
  static async getAllBookings(filters = {}) {
    try {
      console.log('🔄 Fetching all bookings for admin...');
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() ? `/admin/bookings?${queryParams.toString()}` : '/admin/bookings';
      const response = await api.get(url);
      
      console.log('✅ All bookings fetched successfully:', response.data?.length || 0, 'bookings');
      
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : (response.data?.data || []),
        pagination: response.data?.pagination || null,
        summary: response.data?.summary || null
      };
    } catch (error) {
      console.error('❌ Error fetching all bookings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng'
      };
    }
  }

  // Get booking by ID
  static async getBookingById(isAgency = false, bookingId) {
    try {
      const prefix = getBookingApiPrefix(isAgency);
      const response = await api.get(`${prefix}/${bookingId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thông tin đơn hàng'
      };
    }
  }

  // Update booking status
  static async updateBookingStatus(isAgency = false, bookingId, status) {
    try {
      const prefix = getBookingApiPrefix(isAgency);
      // Admin: PUT /api/admin/bookings/:id/status, Agency: PUT /api/agency/bookings/:id/status
      const response = await api.put(`${prefix}/${bookingId}/status`, { status });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái đơn hàng'
      };
    }
  }

  // Update booking details
  static async updateBooking(bookingId, updateData) {
    try {
      console.log('🔄 Updating booking:', bookingId, 'with data:', updateData);
      
      const response = await api.put(`/bookings/${bookingId}`, updateData);
      
      console.log('✅ Booking updated successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật thông tin đơn hàng'
      };
    }
  }

  // Create new booking (for admin)
  static async createBooking(bookingData) {
    try {
      console.log('➕ Creating new booking with data:', bookingData);
      
      const response = await api.post('/bookings', bookingData);
      
      console.log('✅ Booking created successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tạo đơn hàng'
      };
    }
  }

  // Delete booking
  static async deleteBooking(isAdmin = true, bookingId) {
    try {
      const prefix = getBookingApiPrefix(!isAdmin ? true : false); // Nếu là admin thì false, agency thì true
      const response = await api.delete(`${prefix}/${bookingId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể xóa đơn hàng'
      };
    }
  }

  // Bulk update status (admin only)
  static async bulkUpdateStatus(bookingIds, status) {
    try {
      const response = await api.put(`/admin/bookings/bulk/status`, { bookingIds, status });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái hàng loạt'
      };
    }
  }

  // Bulk delete (admin only)
  static async bulkDelete(bookingIds) {
    try {
      const response = await api.delete(`/admin/bookings/bulk`, { data: { bookingIds } });
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể xóa hàng loạt đơn hàng'
      };
    }
  }

  // Get bookings by tour ID
  static async getBookingsByTour(tourId) {
    try {
      console.log('📋 Fetching bookings for tour:', tourId);
      
      const response = await api.get(`/tours/${tourId}/bookings`);
      
      console.log('✅ Tour bookings fetched successfully:', response.data?.length || 0, 'bookings');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching tour bookings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng của tour'
      };
    }
  }

  // Get bookings by user ID
  static async getBookingsByUser(userId) {
    try {
      console.log('📋 Fetching bookings for user:', userId);
      
      const response = await api.get(`/users/${userId}/bookings`);
      
      console.log('✅ User bookings fetched successfully:', response.data?.length || 0, 'bookings');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng của khách hàng'
      };
    }
  }

  // Get booking statistics (admin/agency)
  static async getBookingStats(isAgency = false, filters = {}) {
    try {
      const prefix = getBookingApiPrefix(isAgency);
      const url = `${prefix}/stats`;
      const response = await api.get(url, { params: filters });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thống kê đơn hàng'
      };
    }
  }

  // Get booking revenue (admin/agency)
  static async getBookingRevenue(isAgency = false, filters = {}) {
    try {
      const prefix = getBookingApiPrefix(isAgency);
      const url = `${prefix}/revenue`;
      const response = await api.get(url, { params: filters });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể tải thống kê doanh thu đơn hàng'
      };
    }
  }

  // Confirm booking payment
  static async confirmPayment(bookingId, paymentData) {
    try {
      console.log('💳 Confirming payment for booking:', bookingId, 'with data:', paymentData);
      
      const response = await api.post(`/bookings/${bookingId}/confirm-payment`, paymentData);
      
      console.log('✅ Payment confirmed successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể xác nhận thanh toán'
      };
    }
  }

  // Cancel booking
  static async cancelBooking(bookingId, reason = '') {
    try {
      console.log('❌ Cancelling booking:', bookingId, 'with reason:', reason);
      
      const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      
      console.log('✅ Booking cancelled successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không thể hủy đơn hàng'
      };
    }
  }

  // Export bookings (admin/agency)
  static async exportBookings(isAgency = false, filters = {}, format = 'csv') {
    try {
      const prefix = getBookingApiPrefix(isAgency);
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
        error: error.response?.data?.message || error.message || 'Không thể export dữ liệu đơn hàng'
      };
    }
  }

  // Agency-specific methods for convenience
  
  // Get all bookings for the logged-in agency
  static async getMyAgencyBookings(filters = {}) {
    const result = await this.getBookings(true, filters);
    console.log("DEBUG getMyAgencyBookings result:", result);
    return result;
  }

  // Get agency booking statistics
  static async getMyAgencyStats(dateFilters = {}) {
    return this.getBookingStats(true, dateFilters);
  }

  // Get agency bookings with pagination
  static async getMyAgencyBookingsWithPagination(page = 1, limit = 10, filters = {}) {
    const paginationFilters = {
      ...filters,
      page,
      limit
    };
    return this.getBookings(true, paginationFilters);
  }

  // Get agency bookings by status
  static async getMyAgencyBookingsByStatus(status, filters = {}) {
    const statusFilters = {
      ...filters,
      status
    };
    return this.getBookings(true, statusFilters);
  }

  // Get agency booking statistics for date range
  static async getMyAgencyStatsDateRange(startDate, endDate) {
    const dateFilters = {
      startDate,
      endDate
    };
    return this.getBookingStats(true, dateFilters);
  }

  // Export agency bookings
  static async exportMyAgencyBookings(filters = {}, format = 'csv') {
    return this.exportBookings(true, filters, format);
  }
}

export default BookingService;
