import axios from 'axios';
import NotificationService from './NotificationService';

const API_BASE_URL = 'http://localhost:5000/api';

class TourService {
  // Gán nhiều category cho tour
  static async assignCategoriesBulk(tourId, categoryIds) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tours/${tourId}/categories`,
        { categoryIds },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ assignCategoriesBulk error:', error);
      throw error;
    }
  }

  // Gán excluded servic  // =====================
  // DEBUG & TEST METHODS
  // =====================

  // Test method để debug excluded services assignment
  static async testExcludedServicesAssignment(tourId, serviceIds = ['exc-service-tip', 'exc-service-insurance']) {
    console.log('🧪 Testing excluded services assignment...');
    console.log('Tour ID:', tourId);
    console.log('Service IDs to assign:', serviceIds);

    try {
      // Get current excluded services
      const currentResponse = await axios.get(`${API_BASE_URL}/tours/${tourId}/excluded-services`, {
        headers: this.getAuthHeaders()
      });
      console.log('📋 Current excluded services:', currentResponse.data);

      // Try to assign each service
      for (const serviceId of serviceIds) {
        try {
          console.log(`🔗 Assigning service ${serviceId}...`);
          const assignResponse = await this.assignExcludedService(tourId, serviceId);
          console.log(`✅ Successfully assigned ${serviceId}:`, assignResponse);
        } catch (error) {
          console.error(`❌ Failed to assign ${serviceId}:`, error.response?.data || error.message);
        }
      }

      // Get updated excluded services
      const updatedResponse = await axios.get(`${API_BASE_URL}/tours/${tourId}/excluded-services`, {
        headers: this.getAuthHeaders()
      });
      console.log('📋 Updated excluded services:', updatedResponse.data);

      return updatedResponse.data;
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  // Gán excluded service riêng lẻ cho tour
  static async assignExcludedService(tourId, serviceId) {
    try {
      console.log(`🔗 Assigning excluded service ${serviceId} to tour ${tourId}`);
      const response = await axios.post(
        `${API_BASE_URL}/tours/${tourId}/excluded-services/${serviceId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ assignExcludedService error:', error);
      throw error;
    }
  }

  // Gán nhiều excluded services cho tour
  static async assignExcludedServicesBulk(tourId, serviceIds) {
    try {
      console.log(`🔗 Bulk assigning ${serviceIds.length} excluded services to tour ${tourId}:`, serviceIds);
      const assignPromises = serviceIds.map(serviceId =>
        this.assignExcludedService(tourId, serviceId)
      );
      const results = await Promise.allSettled(assignPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Excluded services assignment: ${successful} success, ${failed} failed`);

      if (failed > 0) {
        console.warn('⚠️ Some excluded services failed to assign:',
          results.filter(r => r.status === 'rejected').map(r => r.reason)
        );
      }

      return { successful, failed, results };
    } catch (error) {
      console.error('❌ assignExcludedServicesBulk error:', error);
      throw error;
    }
  }

  // Gán included service riêng lẻ cho tour
  static async assignIncludedService(tourId, serviceId) {
    try {
      console.log(`🔗 Assigning included service ${serviceId} to tour ${tourId}`);
      const response = await axios.post(
        `${API_BASE_URL}/tours/${tourId}/included-services/${serviceId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ assignIncludedService error:', error);
      throw error;
    }
  }

  // Gán nhiều included services cho tour
  static async assignIncludedServicesBulk(tourId, serviceIds) {
    try {
      console.log(`🔗 Bulk assigning ${serviceIds.length} included services to tour ${tourId}:`, serviceIds);
      const assignPromises = serviceIds.map(serviceId =>
        this.assignIncludedService(tourId, serviceId)
      );
      const results = await Promise.allSettled(assignPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Included services assignment: ${successful} success, ${failed} failed`);
      return { successful, failed, results };
    } catch (error) {
      console.error('❌ assignIncludedServicesBulk error:', error);
      throw error;
    }
  }

  // Gán hotel riêng lẻ cho tour
  static async assignHotel(tourId, hotelId) {
    try {
      console.log(`🔗 Assigning hotel ${hotelId} to tour ${tourId}`);
      const response = await axios.post(
        `${API_BASE_URL}/tours/${tourId}/hotels/${hotelId}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ assignHotel error:', error);
      throw error;
    }
  }

  // Gán nhiều hotels cho tour
  static async assignHotelsBulk(tourId, hotelIds) {
    try {
      console.log(`🔗 Bulk assigning ${hotelIds.length} hotels to tour ${tourId}:`, hotelIds);
      const assignPromises = hotelIds.map(hotelId =>
        this.assignHotel(tourId, hotelId)
      );
      const results = await Promise.allSettled(assignPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Hotels assignment: ${successful} success, ${failed} failed`);
      return { successful, failed, results };
    } catch (error) {
      console.error('❌ assignHotelsBulk error:', error);
      throw error;
    }
  }
  // Get auth headers
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // =====================
  // TOUR CRUD OPERATIONS
  // =====================

  // Lấy tất cả tours, phân biệt role
  static async getAllTours(isAgency = false) {
    console.log('📡 TourService.getAllTours - Fetching tours...');
    const endpoint = isAgency ? '/tours/my-agency' : '/tours';
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
    console.log(`📡 TourService.getAllTours - Received ${Array.isArray(response.data) ? response.data.length : 0} tours from server`);
    return response.data;
  }

  // Lấy tours theo status, phân biệt role
  static async getToursByStatus(status, isAgency = false) {
    const endpoint = isAgency ? `/tours/my-agency/status/${status}` : `/tours/status/${status}`;
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Lấy thông tin tour cơ bản
  static async getTour(tourId) {
    const response = await axios.get(`${API_BASE_URL}/tours/${tourId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Lấy tất cả thông tin tour cùng 1 lần - sử dụng endpoint complete
  static async getTourComplete(tourId) {
    try {
      console.log('🔍 TourService.getTourComplete - Calling GET /api/tours/:id/complete for:', tourId);

      const response = await axios.get(`${API_BASE_URL}/tours/${tourId}/complete`, {
        headers: this.getAuthHeaders()
      });

      console.log('✅ TourService.getTourComplete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TourService.getTourComplete error:', error);
      // Fallback: lấy từng phần riêng biệt
      return await this.getTourDetailsSeparately(tourId);
    }
  }

  // Lấy từng phần riêng biệt nếu endpoint complete không có
  static async getTourDetailsSeparately(tourId) {
    const headers = this.getAuthHeaders();

    const [
      tourData,
      departures,
      categories,
      includedServices,
      hotels,
      excludedServices,
      itineraries
    ] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/tours/${tourId}`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/departures`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/categories`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/included-services`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/hotels`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/excluded-services`, { headers }),
      axios.get(`${API_BASE_URL}/tours/${tourId}/itineraries`, { headers })
    ]);

    const tour = tourData.status === 'fulfilled' ? tourData.value.data : {};

    // Merge all data
    return {
      ...tour,
      departures: departures.status === 'fulfilled' ? departures.value.data : [],
      categories: categories.status === 'fulfilled' ? categories.value.data : [],
      included_services: includedServices.status === 'fulfilled' ? includedServices.value.data : [],
      hotels: hotels.status === 'fulfilled' ? hotels.value.data : [],
      excluded_services: excludedServices.status === 'fulfilled' ? excludedServices.value.data : [],
      itineraries: itineraries.status === 'fulfilled' ? itineraries.value.data : []
    };
  }

  // Tạo tour mới với validation đầy đủ
  static async createTour(tourData) {
    // Mapping đúng chuẩn BE
    const completeData = {
      name: tourData.name,
      description: tourData.description || '',
      location: tourData.location || '',
      destination: tourData.destination || '',
      departure_location: tourData.departure_location || '',
      price: parseFloat(tourData.price) || 0,
      tour_type: tourData.tour_type || 'Trong nước',
      max_participants: parseInt(tourData.max_participants) || 1,
      min_participants: parseInt(tourData.min_participants) || 1,
      images: tourData.images || [],
      departureDates: tourData.departureDates || [],
      included_service_ids: tourData.included_service_ids || [],
      excluded_service_ids: tourData.excluded_service_ids || [],
      category_ids: tourData.category_ids || [],
      hotel_ids: tourData.hotel_ids || [],
      status: tourData.status, // status chuẩn hóa từ FE
    };
    console.log('🚀 TourService.createTour - Sending to POST /api/tours:', completeData);
    const response = await axios.post(`${API_BASE_URL}/tours`, completeData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Tạo tour mới cho admin (bắt buộc có agency_id)
  static async createAdminTour(tourData) {
    const completeData = {
      agency_id: tourData.agency_id,
      name: tourData.name,
      description: tourData.description || '',
      location: tourData.location || '',
      destination: tourData.destination || '',
      departure_location: tourData.departure_location || '',
      price: parseFloat(tourData.price) || 0,
      tour_type: tourData.tour_type || 'Trong nước',
      max_participants: parseInt(tourData.max_participants) || 1,
      min_participants: parseInt(tourData.min_participants) || 1,
      images: tourData.images || [],
      departureDates: tourData.departureDates || [],
      included_service_ids: tourData.included_service_ids || [],
      excluded_service_ids: tourData.excluded_service_ids || [],
      category_ids: tourData.category_ids || [],
      hotel_ids: tourData.hotel_ids || [],
      status: tourData.status, // status chuẩn hóa từ FE
    };
    console.log('🚀 TourService.createAdminTour - Sending to POST /api/tours:', completeData);
    const response = await axios.post(`${API_BASE_URL}/tours`, completeData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Cập nhật tour với validation - Hỗ trợ selective update
  static async updateTour(tourId, tourData, options = {}) {
    console.log('🔄 TourService.updateTour called with:', { tourId, tourData, options });
    const { selective = false } = options;

    // 1. Kiểm tra booking xác nhận ở bất kỳ ngày khởi hành nào
    let hasConfirmedBooking = false;
    try {
      const departuresRes = await axios.get(`${API_BASE_URL}/tours/${tourId}/departures`, {
        headers: this.getAuthHeaders()
      });
      const departures = departuresRes.data.departureDates || [];
      for (const dep of departures) {
        // Nếu có trường bookings thì kiểm tra ở đây
        if (dep.status === 'confirmed') {
          hasConfirmedBooking = true;
          break;
        }
      }
    } catch (error) {
      console.error('❌ Failed to check departures:', error);
      throw error;
    }

    // 2. Nếu có booking đã xác nhận, không cho phép cập nhật một số trường
    if (hasConfirmedBooking) {
      const forbiddenFields = ['departureDates', 'status', 'max_participants', 'min_participants'];
      for (const field of forbiddenFields) {
        if (tourData[field] !== undefined) {
          delete tourData[field];
          NotificationService.warning(`Không thể cập nhật trường ${field} vì tour đã có booking xác nhận.`);
        }
      }
    }

    let updateData;
    if (selective) {
      // Selective update - chỉ gửi các field được provide
      updateData = {};
      if (tourData.name !== undefined) updateData.name = tourData.name;
      if (tourData.description !== undefined) updateData.description = tourData.description;
      if (tourData.location !== undefined) updateData.location = tourData.location;
      if (tourData.destination !== undefined) updateData.destination = tourData.destination;
      if (tourData.departure_location !== undefined) updateData.departure_location = tourData.departure_location;
      if (tourData.price !== undefined) updateData.price = parseFloat(tourData.price);
      if (tourData.tour_type !== undefined) updateData.tour_type = tourData.tour_type;
      if (tourData.max_participants !== undefined) updateData.max_participants = parseInt(tourData.max_participants);
      if (tourData.min_participants !== undefined) updateData.min_participants = parseInt(tourData.min_participants);
      if (tourData.images !== undefined) updateData.images = tourData.images;
      if (tourData.departureDates !== undefined) updateData.departureDates = tourData.departureDates;
      if (tourData.selectedIncludedServices !== undefined || tourData.included_service_ids !== undefined)
        updateData.selectedIncludedServices = tourData.selectedIncludedServices || tourData.included_service_ids;
      if (tourData.selectedCategories !== undefined || tourData.category_ids !== undefined)
        updateData.selectedCategories = tourData.selectedCategories || tourData.category_ids;
      if (tourData.selectedHotels !== undefined || tourData.hotel_ids !== undefined)
        updateData.hotel_ids = tourData.selectedHotels || tourData.hotel_ids;
      console.log('🎯 Selective update data:', updateData);
    } else {
      // Full update - gửi tất cả fields như BE yêu cầu
      updateData = {
        //agency_id: tourData.agency_id,
        name: tourData.name,
        description: tourData.description || '',
        location: tourData.location || '',
        destination: tourData.destination || '',
        departure_location: tourData.departure_location || '',
        price: parseFloat(tourData.price) || 0,
        tour_type: tourData.tour_type || 'Trong nước',
        max_participants: parseInt(tourData.max_participants) || 1,
        min_participants: parseInt(tourData.min_participants) || 1,
        images: tourData.images || [],
        //departureDates: tourData.departureDates || [],
        included_service_ids: tourData.included_service_ids || [],
        excluded_service_ids: tourData.excluded_service_ids || [],
        category_ids: tourData.category_ids || [],
        hotel_ids: tourData.hotel_ids || [],
      };
      console.log('📋 Full update data:', updateData);
    }
    console.log('🔄 TourService.updateTour - Sending to PUT /api/tours/:id:', updateData);
    try {
      const response = await axios.put(`${API_BASE_URL}/tours/${tourId}`, updateData, {
        headers: this.getAuthHeaders()
      });
      console.log('✅ TourService.updateTour response:', response.data);
      if (!options.suppressAlert) {
        alert('Cập nhật tour thành công!');
      }
      return response.data;
    } catch (error) {
      console.error('❌ TourService.updateTour error:', error);
      if (!options.suppressAlert) {
        alert('Cập nhật tour thất bại! Vui lòng thử lại.');
      }
      throw error;
    }
  }
// Agency gửi duyệt tour (chuyển từ draft sang Chờ duyệt)
  static async submitForApproval(tourId) {
    const response = await axios.patch(
      `${API_BASE_URL}/tours/${tourId}/submit-for-approval`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
  // Xóa tour
  static async deleteTour(tourId) {
    const response = await axios.delete(`${API_BASE_URL}/tours/${tourId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // =====================
  // TOUR UPDATE OPERATIONS - Riêng lẻ
  // =====================

  // Cập nhật location cho tour
  static async updateTourLocation(tourId, locationId) {
    try {
      console.log(`📍 Updating location for tour ${tourId} to location ${locationId}`);
      return await this.updateTour(tourId, { location_id: locationId }, {
        selective: true,
        suppressAlert: true
      });
    } catch (error) {
      console.error('❌ updateTourLocation error:', error);
      throw error;
    }
  }

  // Cập nhật thông tin cơ bản của tour
  static async updateTourBasicInfo(tourId, updateData) {
    try {
      console.log(`📝 Updating basic info for tour ${tourId}:`, updateData);
      return await this.updateTour(tourId, updateData, {
        selective: true,
        suppressAlert: true
      });
    } catch (error) {
      console.error('❌ updateTourBasicInfo error:', error);
      throw error;
    }
  }

  // Cập nhật price cho tour
  static async updateTourPrice(tourId, price) {
    try {
      console.log(`💰 Updating price for tour ${tourId} to ${price}`);
      return await this.updateTour(tourId, { price: parseFloat(price) }, {
        selective: true,
        suppressAlert: true
      });
    } catch (error) {
      console.error('❌ updateTourPrice error:', error);
      throw error;
    }
  }

  // Cập nhật destination cho tour
  static async updateTourDestination(tourId, destination) {
    try {
      console.log(`🎯 Updating destination for tour ${tourId} to ${destination}`);
      return await this.updateTour(tourId, { destination: destination }, {
        selective: true,
        suppressAlert: true
      });
    } catch (error) {
      console.error('❌ updateTourDestination error:', error);
      throw error;
    }
  }

  // Cập nhật departure dates cho tour
  static async updateTourDepartureDates(tourId, departureDates) {
    try {
      console.log(`📅 Updating departure dates for tour ${tourId}:`, departureDates);
      return await this.updateTour(tourId, { departureDates: departureDates }, {
        selective: true,
        suppressAlert: true
      });
    } catch (error) {
      console.error('❌ updateTourDepartureDates error:', error);
      throw error;
    }
  }

  // Cập nhật status tour
  static async updateTourStatus(tourId, status) {
    const response = await axios.patch(`${API_BASE_URL}/tours/${tourId}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // ===============================
  // TOUR RELATIONSHIPS MANAGEMENT
  // ===============================

  // Hủy gán dịch vụ bao gồm
  static async removeIncludedService(tourId, serviceId) {
    const response = await axios.delete(
      `${API_BASE_URL}/tours/${tourId}/included-services/${serviceId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Hủy gán dịch vụ loại trừ
  static async removeExcludedService(tourId, serviceId) {
    const response = await axios.delete(
      `${API_BASE_URL}/tours/${tourId}/excluded-services/${serviceId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Hủy gán khách sạn
  static async removeHotel(tourId, hotelId) {
    const response = await axios.delete(
      `${API_BASE_URL}/tours/${tourId}/hotels/${hotelId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Gán category
  static async assignCategory(tourId, categoryId) {
    const response = await axios.post(
      `${API_BASE_URL}/tours/${tourId}/categories/${categoryId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Hủy gán category
  static async removeCategory(tourId, categoryId) {
    const response = await axios.delete(
      `${API_BASE_URL}/tours/${tourId}/categories/${categoryId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // =======================
  // BULK OPERATIONS
  // =======================

  // Cập nhật tất cả relationships của tour
  static async updateTourRelationships(tourId, {
    selectedCategories = [],
    selectedIncludedServices = [],
    selectedExcludedServices = [],
    selectedHotels = []
  }) {
    try {
      console.log('🔗 TourService.updateTourRelationships called with:', {
        tourId,
        selectedCategories,
        selectedIncludedServices,
        selectedExcludedServices,
        selectedHotels
      });

      // Lấy relationships hiện tại
      const currentTour = await this.getTourComplete(tourId);

      const currentCategories = currentTour.categories?.map(c => c.id || c.category_id) || [];
      const currentIncludedServices = currentTour.included_services?.map(s => s.id || s.included_service_id) || [];
      const currentExcludedServices = currentTour.excluded_services?.map(s => s.id || s.excluded_service_id) || [];
      const currentHotels = currentTour.hotels?.map(h => h.id || h.id_hotel) || [];

      console.log('📊 Current relationships:', {
        currentCategories,
        currentIncludedServices,
        currentExcludedServices,
        currentHotels
      });

      // Tính toán thay đổi
      const categoriesToAdd = selectedCategories.filter(id => !currentCategories.includes(id));
      const categoriesToRemove = currentCategories.filter(id => !selectedCategories.includes(id));

      const includedServicesToAdd = selectedIncludedServices.filter(id => !currentIncludedServices.includes(id));
      const includedServicesToRemove = currentIncludedServices.filter(id => !selectedIncludedServices.includes(id));

      const excludedServicesToAdd = selectedExcludedServices.filter(id => !currentExcludedServices.includes(id));
      const excludedServicesToRemove = currentExcludedServices.filter(id => !selectedExcludedServices.includes(id));

      const hotelsToAdd = selectedHotels.filter(id => !currentHotels.includes(id));
      const hotelsToRemove = currentHotels.filter(id => !selectedHotels.includes(id));

      console.log('🔄 Changes to apply:', {
        categoriesToAdd,
        categoriesToRemove,
        includedServicesToAdd,
        includedServicesToRemove,
        excludedServicesToAdd,
        excludedServicesToRemove,
        hotelsToAdd,
        hotelsToRemove
      });

      // Thực hiện các thay đổi
      const operations = [
        // Thêm mới
        ...categoriesToAdd.map(id => this.assignCategory(tourId, id)),
        ...includedServicesToAdd.map(id => this.assignIncludedService(tourId, id)),
        ...excludedServicesToAdd.map(id => this.assignExcludedService(tourId, id)),
        ...hotelsToAdd.map(id => this.assignHotel(tourId, id)),

        // Xóa bỏ
        ...categoriesToRemove.map(id => this.removeCategory(tourId, id)),
        ...includedServicesToRemove.map(id => this.removeIncludedService(tourId, id)),
        ...excludedServicesToRemove.map(id => this.removeExcludedService(tourId, id)),
        ...hotelsToRemove.map(id => this.removeHotel(tourId, id))
      ];

      console.log(`🔧 Executing ${operations.length} relationship operations...`);
      const results = await Promise.allSettled(operations);

      // Debug kết quả
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('❌ Some relationship operations failed:', failed);
      }

      console.log('✅ Tour relationships updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating tour relationships:', error);
      throw error;
    }
  }

  // =====================
  // ADMIN TOUR ENDPOINTS
  // =====================

  // List tours with pagination (admin)
  static async getAdminTours(params = {}) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/tours`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data.data); // Đảm bảo trả về đúng data.data
  }

  // Get tour detail (admin)
  static async getAdminTourDetail(id) {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/tours/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }

  // Update tour (admin, full update)
  static async updateAdminTour(id, data) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/admin/tours/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }

  // Update status (admin)
  static async updateAdminTourStatus(id, status) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/admin/tours/${id}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }

  // Approve tour (admin)
  static async approveAdminTour(id) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/admin/tours/${id}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }

  // Reject tour (admin)
  static async rejectAdminTour(id, reason) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/admin/tours/${id}/reject`, { reason }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }

  // Delete tour (admin)
  static async deleteAdminTour(id) {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/admin/tours/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }
}

export default TourService;
