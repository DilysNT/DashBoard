import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ReviewService {
  // Get auth headers with token
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    console.log('🔑 ReviewService - Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    if (!token) {
      console.warn('⚠️ No auth token found in localStorage');
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Lấy tất cả reviews
  static async getAllReviews() {
    try {
      console.log('📡 ReviewService.getAllReviews - Fetching all reviews...');
      const response = await axios.get(`${API_BASE_URL}/reviews`, {
        headers: this.getAuthHeaders()
      });
      console.log(`📡 Received ${Array.isArray(response.data) ? response.data.length : (response.data.data?.length || 0)} reviews`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error) {
      console.error('❌ ReviewService.getAllReviews error:', error);
      throw error;
    }
  }

  // Lấy reviews theo tour ID
  static async getReviewsByTour(tourId) {
    try {
      console.log(`📡 ReviewService.getReviewsByTour - Fetching reviews for tour ${tourId}...`);
      
      // Try without auth headers first (public endpoint)
      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/reviews/tour/${tourId}`);
        console.log(`📡 Success without auth headers for tour ${tourId}`);
      } catch (noAuthError) {
        console.log(`📡 Trying with auth headers for tour ${tourId}...`);
        response = await axios.get(`${API_BASE_URL}/reviews/tour/${tourId}`, {
          headers: this.getAuthHeaders()
        });
      }
      
      console.log(`📡 Raw response for tour ${tourId}:`, response.data);
      console.log(`📡 Received ${Array.isArray(response.data) ? response.data.length : (response.data.data?.length || 0)} reviews for tour ${tourId}`);
      return response.data.data || response.data.reviews || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(`❌ ReviewService.getReviewsByTour error for tour ${tourId}:`, error);
      console.error(`❌ Error details:`, error.response?.data || error.message);
      // Return empty array instead of throwing to prevent breaking the flow
      return [];
    }
  }

  // Lấy reviews theo user ID
  static async getReviewsByUser(userId) {
    try {
      console.log(`📡 ReviewService.getReviewsByUser - Fetching reviews for user ${userId}...`);
      const response = await axios.get(`${API_BASE_URL}/reviews/user/${userId}`, {
        headers: this.getAuthHeaders()
      });
      console.log(`📡 Received ${Array.isArray(response.data) ? response.data.length : (response.data.data?.length || 0)} reviews for user ${userId}`);
      return response.data.data || response.data.reviews || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(`❌ ReviewService.getReviewsByUser error for user ${userId}:`, error);
      throw error;
    }
  }

  // Cập nhật trạng thái hiển thị review
  static async updateReviewVisibility(reviewId, isVisible) {
    try {
      console.log(`🔄 ReviewService.updateReviewVisibility - Updating review ${reviewId} visibility to ${isVisible}...`);
      const response = await axios.patch(`${API_BASE_URL}/reviews/${reviewId}/visibility`, 
        { is_visible: isVisible },
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ Review ${reviewId} visibility updated successfully`);
      return response.data;
    } catch (error) {
      console.error(`❌ ReviewService.updateReviewVisibility error for review ${reviewId}:`, error);
      throw error;
    }
  }

  // Xóa review
  static async deleteReview(reviewId) {
    try {
      console.log(`🗑️ ReviewService.deleteReview - Deleting review ${reviewId}...`);
      const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
        headers: this.getAuthHeaders()
      });
      console.log(`✅ Review ${reviewId} deleted successfully`);
      return response.data;
    } catch (error) {
      console.error(`❌ ReviewService.deleteReview error for review ${reviewId}:`, error);
      throw error;
    }
  }

  // Lấy reviews của tất cả tours thuộc agency
  static async getReviewsForAgencyTours(tourIds) {
    try {
      console.log(`📡 ReviewService.getReviewsForAgencyTours - Fetching reviews for tours:`, tourIds);
      
      if (!tourIds || tourIds.length === 0) {
        console.log('⚠️ No tour IDs provided, returning empty array');
        return [];
      }

      // Gọi API cho từng tour và gộp kết quả
      const reviewPromises = tourIds.map(tourId => this.getReviewsByTour(tourId));
      const reviewArrays = await Promise.allSettled(reviewPromises);
      
      console.log('DEBUG - Promise results:', reviewArrays);
      
      // Gộp tất cả reviews và lọc những tour có data
      const allReviews = reviewArrays
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);

      console.log(`📊 Total reviews for agency tours: ${allReviews.length}`);
      console.log('📊 All reviews data:', allReviews);
      return allReviews;
    } catch (error) {
      console.error('❌ ReviewService.getReviewsForAgencyTours error:', error);
      return []; // Return empty array instead of throwing
    }
  }

  // Lấy reviews của agency (phân trang)
  static async getAgencyReviews(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/agency/bookings/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      return {
        reviews: data.reviews || [],
        pagination: data.pagination || {},
        summary: data.summary || {},
      };
    } catch (error) {
      console.error('❌ Error fetching agency reviews:', error);
      return { reviews: [], pagination: {}, summary: {}, error: error.message };
    }
  }
}

export default ReviewService;